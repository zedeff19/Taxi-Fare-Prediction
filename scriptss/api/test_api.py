"""
Test script for the Taxi Fare Prediction API
Run this to test if your API is working correctly
"""

import requests
import json

# API base URL
BASE_URL = "http://localhost:5000"

def test_health_check():
    """Test the health check endpoint"""
    print("=== Testing Health Check ===")
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Health check failed: {e}")
        return False

def test_single_prediction():
    """Test single prediction endpoint"""
    print("\n=== Testing Single Prediction ===")
    
    # Sample trip data
    trip_data = {
        "PULocationID": 161,
        "DOLocationID": 230,
        "passenger_count": 2,
        "trip_distance": 5.5,
        "extra": 0.5,
        "mta_tax": 0.5,
        "tip_amount": 3.0,
        "tolls_amount": 0.0,
        "total_amount": 25.0,
        "payment_type": 1,
        "trip_type": 1,
        "congestion_surcharge": 2.5,
        "cbd_congestion_fee": 0.75,
        "trip_duration_minutes": 22,
        "pickup_hour": 14,
        "pickup_day": "Friday",
        "pickup_month": 1
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/predict",
            json=trip_data,
            headers={"Content-Type": "application/json"}
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Single prediction failed: {e}")
        return False

def test_batch_prediction():
    """Test batch prediction endpoint"""
    print("\n=== Testing Batch Prediction ===")
    
    # Sample batch data
    batch_data = {
        "trips": [
            {
                "PULocationID": 161,
                "DOLocationID": 230,
                "passenger_count": 1,
                "trip_distance": 3.2,
                "extra": 0.0,
                "mta_tax": 0.5,
                "tip_amount": 2.0,
                "tolls_amount": 0.0,
                "total_amount": 15.0,
                "payment_type": 1,
                "trip_type": 1,
                "congestion_surcharge": 0.0,
                "cbd_congestion_fee": 0.0,
                "trip_duration_minutes": 12,
                "pickup_hour": 10,
                "pickup_day": "Monday",
                "pickup_month": 1
            },
            {
                "PULocationID": 74,
                "DOLocationID": 75,
                "passenger_count": 2,
                "trip_distance": 8.1,
                "extra": 1.0,
                "mta_tax": 0.5,
                "tip_amount": 4.5,
                "tolls_amount": 5.76,
                "total_amount": 35.0,
                "payment_type": 1,
                "trip_type": 1,
                "congestion_surcharge": 2.5,
                "cbd_congestion_fee": 0.75,
                "trip_duration_minutes": 28,
                "pickup_hour": 17,
                "pickup_day": "Friday",
                "pickup_month": 1
            }
        ]
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/predict/batch",
            json=batch_data,
            headers={"Content-Type": "application/json"}
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Batch prediction failed: {e}")
        return False

def test_features_endpoint():
    """Test features information endpoint"""
    print("\n=== Testing Features Endpoint ===")
    try:
        response = requests.get(f"{BASE_URL}/features")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Features endpoint failed: {e}")
        return False

def run_all_tests():
    """Run all API tests"""
    print("🚕 Testing Taxi Fare Prediction API")
    print("=" * 50)
    
    tests = [
        ("Health Check", test_health_check),
        ("Single Prediction", test_single_prediction),
        ("Batch Prediction", test_batch_prediction),
        ("Features Endpoint", test_features_endpoint)
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"Test {test_name} crashed: {e}")
            results.append((test_name, False))
    
    print("\n" + "=" * 50)
    print("📊 TEST RESULTS")
    print("=" * 50)
    
    passed = 0
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name}: {status}")
        if result:
            passed += 1
    
    print(f"\nTotal: {passed}/{len(results)} tests passed")
    
    if passed == len(results):
        print("🎉 All tests passed! Your API is working correctly.")
    else:
        print("⚠️  Some tests failed. Check the API server and try again.")

if __name__ == "__main__":
    print("Make sure the API server is running (python predictionAPI.py)")
    print("Press Enter to start testing or Ctrl+C to cancel...")
    
    try:
        input()
        run_all_tests()
    except KeyboardInterrupt:
        print("\nTest cancelled.")
