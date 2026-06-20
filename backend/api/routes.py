from fastapi import APIRouter, HTTPException
from schemas.requests import LocationRequest, RAGQueryRequest
from services.gee_service import get_gee_data
from services.ml_service import process_multivariate_data
from services.llm_service import client 
from services.geo_service import identify_culprit_facility
from services.rag_service import get_relevant_statutes
from services.canopy_service import get_canopy_data
import hashlib
import json

router = APIRouter()

@router.post("/analyze-location")
def analyze_location(request: LocationRequest):
    """The master route: handles ML, OSM mapping, LLM Dossier, and Crypto-hashing."""
    try:
        # 1. Base ML & Telemetry
        df = get_gee_data(request.lat, request.lon)
        data = process_multivariate_data(df)
        
        if "error" in data:
            raise HTTPException(status_code=404, detail=data["error"])
            
        anomalies = data["anomalies"]
        
        # 2. OSM Integration (Find the Culprit)
        facility_info = identify_culprit_facility(request.lat, request.lon)
        entity_name = facility_info.get("name", "Unknown Entity")
        
        # 3. ChromaDB RAG (Find the Laws)
        rag_query = "unauthorized venting of Sulfur Dioxide and particulate anomalies" 
        relevant_laws = get_relevant_statutes(rag_query)
        
        # 4. Generate Enhanced LLM Dossier
        region_str = f"Lat: {request.lat}, Lon: {request.lon}"
        prompt = f"""
        You are the lead Environmental Data Prosecutor.
        Target Entity: {entity_name} at coordinates {region_str}.
        
        Our ML isolated {len(anomalies)} synchronized anomalies (Gases, Heat, Particulates).
        
        Applicable Legal Statutes (Extracted via RAG): 
        {relevant_laws}
        
        Write a 3-paragraph executive legal dossier invoking these specific statutes against the Target Entity.
        Tone: Cold, analytical, legally irrefutable.
        """
        
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=800,
        )
        report = completion.choices[0].message.content
        
        # 5. Package Payload & Cryptographic Evidence Chain
        payload = {
            "region_coords": region_str,
            "target_entity": entity_name,
            "total_events": len(data["timeseries"]),
            "anomaly_count": len(anomalies),
            "timeseries": data["timeseries"],
            "anomalies": anomalies,  # EXPLICITLY RETURNED FOR THE FRONTEND MODAL
            "llm_dossier": report,
            "applicable_laws": relevant_laws
        }
        
        evidence_hash = hashlib.sha256(json.dumps(payload, sort_keys=True).encode()).hexdigest()
        payload["evidence_hash"] = evidence_hash
        
        return payload

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze-canopy")
def analyze_canopy(request: LocationRequest):
    """Specific route for tracking clear-cutting using SAR."""
    try:
        canopy_data = get_canopy_data(request.lat, request.lon)
        return {"status": "success", "data": canopy_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/query-legal-database")
def query_legal_database(request: RAGQueryRequest):
    """RAG chat route combining vector DB statutes with the LLM."""
    try:
        relevant_laws = get_relevant_statutes(request.query, request.n_results)
        
        prompt = f"""
        You are SYS.RAG, an AI legal and environmental analysis terminal.
        The operator asked: "{request.query}"
        
        Current Target Coordinates: {request.location_context}
        Active Environmental Anomalies Detected: {request.anomaly_count}
        
        Applicable Environmental Statutes:
        {relevant_laws}
        
        Task: Answer the operator's query directly by cross-referencing the detected anomalies with the legal statutes. 
        Tone: Cold, analytical, highly technical, and authoritative.
        Constraint: Do not use Markdown formatting (like ** or *). Use plain text. Keep it under 150 words.
        """
        
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=300,
        )
        
        return {
            "query": request.query,
            "response": completion.choices[0].message.content
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))