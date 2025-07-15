"""
Quick interactive test for the API
"""
import requests
import json

# API base URL
BASE_URL = "http://localhost:5000"

def quick_test():
    """Quick test of the API"""
    
    print("🚕 Quick API Test")
    print("=" * 40)
    
    # 1. Health check
    print("1. Testing health check...")
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()['message']}")
    except Exception as e:
        print(f"   Error: {e}")
        return
    
    # 2. Simple prediction
    print("\n2. Testing prediction...")
    trip_data = {
        "PULocationID": 161,
        "DOLocationID": 230,
        "passenger_count": 2,
        "trip_distance": 5.5,
        "pickup_hour": 14,
        "pickup_day": "Friday"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/predict",
            json=trip_data
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"   ✅ Prediction successful!")
            print(f"   Predicted fare: ${result['predicted_fare']}")
        else:
            print(f"   ❌ Error: {response.status_code}")
            print(f"   Message: {response.json()}")
            
    except Exception as e:
        print(f"   Error: {e}")

if __name__ == "__main__":
    print("Make sure the API is running (python predictionAPI.py)")
    input("Press Enter to test...")
    quick_test()
