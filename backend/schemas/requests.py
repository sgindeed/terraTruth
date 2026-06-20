from pydantic import BaseModel

class LocationRequest(BaseModel):
    lat: float
    lon: float

class RAGQueryRequest(BaseModel):
    query: str
    location_context: str = ""
    anomaly_count: int = 0
    n_results: int = 2