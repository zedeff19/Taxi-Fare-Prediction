const API_BASE = 'http://localhost:5000';

        async function testHealthCheck() {
            const resultDiv = document.getElementById('healthResult');
            resultDiv.style.display = 'block';
            resultDiv.innerHTML = 'Testing...';
            
            try {
                const response = await fetch(`${API_BASE}/`);
                const data = await response.json();
                
                resultDiv.className = 'result success';
                resultDiv.innerHTML = `
                    <h3>✅ Health Check Successful</h3>
                    <p><strong>Status:</strong> ${data.status}</p>
                    <p><strong>Message:</strong> ${data.message}</p>
                    <p><strong>Model Loaded:</strong> ${data.model_loaded}</p>
                    <p><strong>Scaler Loaded:</strong> ${data.scaler_loaded}</p>
                `;
            } catch (error) {
                resultDiv.className = 'result error';
                resultDiv.innerHTML = `
                    <h3>❌ Health Check Failed</h3>
                    <p>Error: ${error.message}</p>
                    <p>Make sure the API server is running on port 5000</p>
                `;
            }
        }

        async function predictFare() {
            const resultDiv = document.getElementById('predictionResult');
            resultDiv.style.display = 'block';
            resultDiv.innerHTML = 'Predicting...';
            
            // Collect form data
            const tripData = {
                PULocationID: parseInt(document.getElementById('pickupLocation').value),
                DOLocationID: parseInt(document.getElementById('dropoffLocation').value),
                passenger_count: parseInt(document.getElementById('passengerCount').value),
                trip_distance: parseFloat(document.getElementById('tripDistance').value),
                extra: 0.5,
                mta_tax: 0.5,
                tip_amount: 3.0,
                tolls_amount: 0.0,
                total_amount: 25.0,
                payment_type: 1,
                trip_type: 1,
                congestion_surcharge: 2.5,
                cbd_congestion_fee: 0.75,
                trip_duration_minutes: 22,
                pickup_hour: parseInt(document.getElementById('pickupHour').value),
                pickup_day: document.getElementById('pickupDay').value,
                pickup_month: 1
            };
            
            try {
                const response = await fetch(`${API_BASE}/predict`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(tripData)
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    resultDiv.className = 'result success';
                    resultDiv.innerHTML = `
                        <h3>🎯 Prediction Successful</h3>
                        <p><strong>Predicted Fare:</strong> $${data.predicted_fare}</p>
                        <p><strong>Trip Details:</strong></p>
                        <ul>
                            <li>Distance: ${tripData.trip_distance} miles</li>
                            <li>Passengers: ${tripData.passenger_count}</li>
                            <li>Time: ${tripData.pickup_hour}:00 on ${tripData.pickup_day}</li>
                        </ul>
                    `;
                } else {
                    resultDiv.className = 'result error';
                    resultDiv.innerHTML = `
                        <h3>❌ Prediction Failed</h3>
                        <p>Error: ${data.message}</p>
                    `;
                }
            } catch (error) {
                resultDiv.className = 'result error';
                resultDiv.innerHTML = `
                    <h3>❌ Request Failed</h3>
                    <p>Error: ${error.message}</p>
                    <p>Make sure the API server is running and CORS is enabled</p>
                `;
            }
        }