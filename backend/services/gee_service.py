import ee
import pandas as pd
import os
import json
from dotenv import load_dotenv
from datetime import datetime, timedelta
from google.oauth2 import service_account

# Load environment variables from the .env file
load_dotenv()

# Fetch variables securely from the environment
EE_PROJECT_ID = os.getenv("EE_PROJECT_ID")
EE_PRIVATE_KEY_JSON = os.getenv("EE_PRIVATE_KEY_JSON")

def initialize_earth_engine():
    """Initializes GEE using a Service Account on Render, or local auth as a fallback."""
    try:
        if not EE_PROJECT_ID:
            raise ValueError("EE_PROJECT_ID is not set. Please add it to .env or Render variables.")
            
        if EE_PRIVATE_KEY_JSON:
            # Server Mode (Render) - Use the injected Service Account JSON
            key_dict = json.loads(EE_PRIVATE_KEY_JSON)
            credentials = service_account.Credentials.from_service_account_info(key_dict)
            
            # Explicitly define the scopes required by Google Earth Engine
            SCOPES = [
                'https://www.googleapis.com/auth/earthengine',
                'https://www.googleapis.com/auth/cloud-platform'
            ]
            scoped_credentials = credentials.with_scopes(SCOPES)
            
            # Initialize with the newly scoped credentials
            ee.Initialize(scoped_credentials, project=EE_PROJECT_ID)
            print("Earth Engine initialized successfully via Service Account.")
        else:
            # Local Development Mode - Use local cached credentials
            ee.Initialize(project=EE_PROJECT_ID)
            print("Earth Engine initialized successfully via Local Credentials.")
            
    except Exception as e:
        print(f"CRITICAL: Earth Engine Initialization Failed. Reason: {e}")

# Call initialization when this module loads
initialize_earth_engine()


def get_gee_data(lat: float, lon: float, days_back: int = 30) -> pd.DataFrame:
    """Extracts and fuses Sentinel-5P, MODIS LST, and MODIS AOD dynamically."""
    poi = ee.Geometry.Point([lon, lat])
    roi = poi.buffer(5000).bounds()
    
    # Timeline
    end_date = '2026-06-20'
    start_date = (datetime.strptime(end_date, '%Y-%m-%d') - timedelta(days=days_back)).strftime('%Y-%m-%d')
    
    # 1. Sentinel-5P (Aerosol Index)
    s5p = ee.ImageCollection('COPERNICUS/S5P/NRTI/L3_AER_AI').filterDate(start_date, end_date).filterBounds(roi)
    
    # 2. MODIS LST (Land Surface Temp - scaled to Celsius)
    lst = ee.ImageCollection('MODIS/061/MOD11A1').filterDate(start_date, end_date).filterBounds(roi)
    
    # 3. MODIS AOD (Aerosol Optical Depth)
    aod = ee.ImageCollection('MODIS/061/MCD19A2_GRANULES').filterDate(start_date, end_date).filterBounds(roi)

    def extract_mean(image, band_name, scale_factor=1.0, offset=0.0):
        date = ee.Date(image.get('system:time_start')).format('YYYY-MM-dd')
        mean_dict = image.reduceRegion(reducer=ee.Reducer.mean(), geometry=roi, scale=1000, maxPixels=1e9)
        val = mean_dict.get(band_name)
        val = ee.Algorithms.If(ee.Algorithms.IsEqual(val, None), None, ee.Number(val).multiply(scale_factor).add(offset))
        return ee.Feature(None, {'date': date, band_name: val})

    # Extraction execution
    s5p_feat = s5p.map(lambda img: extract_mean(img, 'absorbing_aerosol_index')).getInfo()
    lst_feat = lst.map(lambda img: extract_mean(img, 'LST_Day_1km', 0.02, -273.15)).getInfo()
    aod_feat = aod.map(lambda img: extract_mean(img, 'Optical_Depth_047', 0.001)).getInfo()

    # Convert to DataFrames
    df_s5p = pd.DataFrame([f['properties'] for f in s5p_feat.get('features', [])]).dropna()
    df_lst = pd.DataFrame([f['properties'] for f in lst_feat.get('features', [])]).dropna()
    df_aod = pd.DataFrame([f['properties'] for f in aod_feat.get('features', [])]).dropna()

    df_s5p.rename(columns={'absorbing_aerosol_index': 's5p_aai'}, inplace=True)
    df_lst.rename(columns={'LST_Day_1km': 'modis_lst_c'}, inplace=True)
    df_aod.rename(columns={'Optical_Depth_047': 'modis_aod'}, inplace=True)

    # Sensor Fusion
    fused_df = pd.merge(df_s5p, df_lst, on='date', how='outer')
    fused_df = pd.merge(fused_df, df_aod, on='date', how='outer')
    
    # Handle missing satellite passes via interpolation
    fused_df['date'] = pd.to_datetime(fused_df['date'])
    fused_df = fused_df.sort_values('date').set_index('date').interpolate(method='linear').ffill().bfill().reset_index()
    fused_df['date'] = fused_df['date'].dt.strftime('%Y-%m-%d')

    return fused_df
