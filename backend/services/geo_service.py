import requests

def get_place_name(lat: float, lon: float) -> str:
    """Reverse geocoding: Lat/Lon -> Place Name."""
    url = f"https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lon}&format=json"
    try:
        response = requests.get(url, headers={'User-Agent': 'TerraTruth-App'})
        data = response.json()
        return data.get("display_name", f"{lat}, {lon}")
    except:
        return f"{lat}, {lon}"

def get_coordinates(place_name: str) -> dict:
    """Forward geocoding: Place Name -> Lat/Lon."""
    url = f"https://nominatim.openstreetmap.org/search?q={place_name}&format=json&limit=1"
    try:
        response = requests.get(url, headers={'User-Agent': 'TerraTruth-App'})
        data = response.json()
        if data:
            return {"lat": data[0]['lat'], "lon": data[0]['lon']}
        return None
    except:
        return None

def identify_culprit_facility(lat: float, lon: float, radius: int = 2000) -> dict:
    """Uses OpenStreetMap Overpass API to find industrial zones near the anomaly."""
    overpass_url = "http://overpass-api.de/api/interpreter"
    
    # Query for industrial land use, power plants, or man-made works within the radius
    overpass_query = f"""
    [out:json];
    (
      way["landuse"="industrial"](around:{radius},{lat},{lon});
      node["power"="plant"](around:{radius},{lat},{lon});
      way["man_made"="works"](around:{radius},{lat},{lon});
    );
    out center;
    """
    
    try:
        response = requests.post(overpass_url, data={'data': overpass_query})
        if response.status_code == 200:
            data = response.json()
            elements = data.get("elements", [])
            if elements:
                # Extract the nearest/most prominent entity's tags
                tags = elements[0].get("tags", {})
                return {
                    "name": tags.get("name", "Unnamed Industrial Facility"), 
                    "type": tags.get("landuse", tags.get("power", "industrial"))
                }
        return {"name": "No registered industrial facility found within radius", "type": "unknown"}
    except Exception as e:
        return {"name": f"OSM Lookup Failed: {str(e)}", "type": "error"}