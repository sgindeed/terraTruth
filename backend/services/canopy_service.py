import ee
from datetime import datetime, timedelta

def get_canopy_data(lat: float, lon: float, days_back: int = 90) -> dict:
    """Analyzes deforestation using Sentinel-1 (SAR) to penetrate cloud cover."""
    poi = ee.Geometry.Point([lon, lat])
    roi = poi.buffer(2000).bounds()
    
    end_date = datetime.now().strftime('%Y-%m-%d')
    start_date = (datetime.now() - timedelta(days=days_back)).strftime('%Y-%m-%d')
    
    # Sentinel-1 (SAR) looking for drastic loss of surface roughness (texture)
    s1 = ee.ImageCollection('COPERNICUS/S1_GRD') \
        .filterBounds(roi) \
        .filterDate(start_date, end_date) \
        .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV')) \
        .select('VV')
        
    def extract_s1_mean(image):
        date = ee.Date(image.get('system:time_start')).format('YYYY-MM-dd')
        mean_dict = image.reduceRegion(reducer=ee.Reducer.mean(), geometry=roi, scale=30)
        val = mean_dict.get('VV')
        return ee.Feature(None, {'date': date, 'sar_vv': val})
        
    s1_feat = s1.map(extract_s1_mean).getInfo()
    
    sar_data = [f['properties'] for f in s1_feat.get('features', []) if f['properties'].get('sar_vv') is not None]
    
    # Detect significant drop in VV backscatter (indicator of clear-cutting)
    loss_detected = False
    if len(sar_data) > 2:
        initial_vv = sar_data[0]['sar_vv']
        final_vv = sar_data[-1]['sar_vv']
        loss_detected = final_vv < (initial_vv - 2.0) 
        
    return {
        "analyzed_period_days": days_back,
        "timeseries_sar": sar_data,
        "canopy_loss_flag": loss_detected
    }