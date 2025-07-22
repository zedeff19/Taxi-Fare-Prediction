import pandas as pd
import json

# Read the taxi zone lookup CSV
df = pd.read_csv('model/distances/taxi_zone_lookup.csv')

# Create a list of location objects
locations = []
for _, row in df.iterrows():
    location = {
        "id": int(row['LocationID']),
        "name": f"{row['Zone']}, {row['Borough']}",
        "zone": row['Zone'],
        "borough": row['Borough'],
        "service_zone": row['service_zone']
    }
    locations.append(location)

# Sort locations by name for better user experience
locations.sort(key=lambda x: x['name'])

# Create the final JSON structure
taxi_zones_data = {
    "total_zones": len(locations),
    "last_updated": "2025-07-22",
    "zones": locations
}

# Save to JSON file
with open('frontend/taxi_zones.json', 'w', encoding='utf-8') as f:
    json.dump(taxi_zones_data, f, indent=2, ensure_ascii=False)

print(f"✅ Created taxi_zones.json with {len(locations)} locations")
print("📁 File saved to: frontend/taxi_zones.json")

# Print first few locations as preview
print("\n📋 Preview of locations:")
for i, location in enumerate(locations[:5]):
    print(f"{i+1}. ID: {location['id']} - {location['name']}")

print("...")
print(f"Total locations: {len(locations)}")
