import requests

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