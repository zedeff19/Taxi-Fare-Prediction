import requests
import json

print('Testing passenger count multipliers with LOCAL API...')
print('=' * 50)

base_data = {
    'pickup_location_id': 161,
    'dropoff_location_id': 230,
    'pickup_hour': 14,
    'pickup_day': 'Friday',
    'pickup_month': 3
}

results = []
for passengers in [1, 2, 3, 5, 6]:
    test_data = base_data.copy()
    test_data['passenger_count'] = passengers
    
    try:
        response = requests.post('http://localhost:5000/predict_from_locations', 
                               json=test_data, timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                fare = result['predicted_fare']
                results.append((passengers, fare))
                print(f'Passengers: {passengers} | Fare: ${fare:.2f}')
            else:
                print(f'Passengers: {passengers} | Error: {result.get("message", "Unknown")}')
        else:
            print(f'Passengers: {passengers} | HTTP {response.status_code}')
            
    except Exception as e:
        print(f'Passengers: {passengers} | Connection failed: {str(e)[:30]}')

print()
print('Expected behavior:')
print('1-2 passengers: Same fare (1.0x multiplier)')
print('3-4 passengers: +12% fare (1.12x multiplier)')  
print('5+ passengers: +35% fare (1.35x multiplier)')

if len(results) >= 3:
    base_fare = results[0][1]  # 1 passenger fare
    print(f'\nActual results:')
    for passengers, fare in results:
        multiplier = fare / base_fare if base_fare > 0 else 0
        print(f'Passengers: {passengers} | Multiplier: {multiplier:.2f}x')
