import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def generate_impact_report(anomalies: list, region: str) -> str:
    """Generates a legal dossier using Groq."""
    if not anomalies:
        return "Baseline metrics nominal. No synchronized anomalies detected."

    anomaly_summary = [{"date": a["date"], "Temp_C": a["modis_lst_c"], "Aerosol_Index": a["s5p_aai"], "Optical_Depth": a["modis_aod"]} for a in anomalies]
    
    prompt = f"""
    You are the lead Environmental Data Prosecutor. We are monitoring coordinates: {region}.
    
    Our Multivariate Isolation Forest ML model has detected {len(anomalies)} synchronized environmental anomalies. This is a corroborated event fusing Sentinel-5P (Gases), MODIS LST (Heat signatures), and MODIS AOD (Particulate Matter).
    
    Corroborated Anomaly Data: {anomaly_summary}
    
    Write a devastating, legally-structured 3-paragraph executive summary. 
    1. Define the 'Trifecta of Evidence' (heat, gas, and particulates spiking together).
    2. Outline the severe community health hazards.
    3. Issue a mandate for immediate regulatory intervention.
    Tone: Cold, analytical, legally irrefutable, authoritative. No pleasantries.
    """

    completion = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
        max_tokens=800,
    )
    return completion.choices[0].message.content