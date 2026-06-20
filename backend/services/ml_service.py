import pandas as pd
from sklearn.ensemble import IsolationForest

def process_multivariate_data(df: pd.DataFrame) -> dict:
    """Processes satellite telemetry through an Isolation Forest."""
    if df.empty:
        return {"error": "Insufficient satellite telemetry for this region."}

    features = df[['s5p_aai', 'modis_lst_c', 'modis_aod']].values
    
    model = IsolationForest(contamination=0.10, random_state=42)
    model.fit(features)
    
    df['anomaly_score'] = model.decision_function(features)
    df['is_anomaly'] = model.predict(features)
    
    result = []
    for _, row in df.iterrows():
        result.append({
            "date": str(row['date']),
            "s5p_aai": round(float(row['s5p_aai']), 3),
            "modis_lst_c": round(float(row['modis_lst_c']), 2),
            "modis_aod": round(float(row['modis_aod']), 3),
            "threat_score": round(float(row['anomaly_score']), 3),
            "is_anomaly": True if row['is_anomaly'] == -1 else False
        })
    
    anomalies = [r for r in result if r['is_anomaly']]
    return {"timeseries": result, "anomalies": anomalies}