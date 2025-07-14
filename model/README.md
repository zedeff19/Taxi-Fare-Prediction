# Taxi Fare Prediction API

A Flask API that serves a PyTorch neural network model for predicting NYC taxi fares. This API is designed to work with React frontends and provides RESTful endpoints for fare predictions.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Prepare Model Files
After training your model in the Jupyter notebook, save the scaler:

```python
# Run this in your notebook after training
import pickle
with open('scaler.pkl', 'wb') as f:
    pickle.dump(train_dataset.scaler, f)
print('Scaler saved for API!')
```

Ensure these files are in the same directory as `predictionAPI.py`:
- `best_taxi_fare_model.pth` (saved during training)
- `scaler.pkl` (saved manually as above)

### 3. Start the API Server
```bash
python predictionAPI.py
```

The server will start on `http://localhost:5000`

### 4. Test the API
```bash
python test_api.py
```

## 📋 API Endpoints

### Health Check
```
GET /
```
Returns API status and model loading information.

### Single Prediction
```
POST /predict
Content-Type: application/json

{
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
```

### Batch Prediction
```
POST /predict/batch
Content-Type: application/json

{
  "trips": [
    { /* trip data 1 */ },
    { /* trip data 2 */ }
  ]
}
```

### Features Information
```
GET /features
```
Returns information about required features and example request format.

## 🔧 React Integration

### Example React Component
```jsx
import React, { useState } from 'react';

const TaxiFarePrediction = () => {
  const [tripData, setTripData] = useState({
    PULocationID: 161,
    DOLocationID: 230,
    passenger_count: 2,
    trip_distance: 5.5,
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
    pickup_hour: 14,
    pickup_day: "Friday",
    pickup_month: 1
  });
  
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const predictFare = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tripData)
      });
      
      const result = await response.json();
      setPrediction(result);
    } catch (error) {
      console.error('Prediction failed:', error);
    }
    setLoading(false);
  };

  return (
    <div>
      <h2>Taxi Fare Prediction</h2>
      {/* Add form inputs for tripData */}
      <button onClick={predictFare} disabled={loading}>
        {loading ? 'Predicting...' : 'Predict Fare'}
      </button>
      
      {prediction && (
        <div>
          <h3>Predicted Fare: ${prediction.predicted_fare}</h3>
        </div>
      )}
    </div>
  );
};

export default TaxiFarePrediction;
```

### Fetch API Examples
```javascript
// Single prediction
const predictSingleFare = async (tripData) => {
  const response = await fetch('http://localhost:5000/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tripData)
  });
  return response.json();
};

// Batch prediction
const predictBatchFares = async (trips) => {
  const response = await fetch('http://localhost:5000/predict/batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ trips })
  });
  return response.json();
};
```

## 📊 Feature Descriptions

| Feature | Description | Example |
|---------|-------------|---------|
| PULocationID | Pickup location ID | 161 |
| DOLocationID | Dropoff location ID | 230 |
| passenger_count | Number of passengers (1-6) | 2 |
| trip_distance | Trip distance in miles | 5.5 |
| extra | Extra charges | 0.5 |
| mta_tax | MTA tax (usually 0.5) | 0.5 |
| tip_amount | Tip amount | 3.0 |
| tolls_amount | Toll charges | 0.0 |
| total_amount | Total trip amount | 25.0 |
| payment_type | Payment type (1=Credit, 2=Cash) | 1 |
| trip_type | Trip type (1=Street hail, 2=Dispatch) | 1 |
| congestion_surcharge | Congestion surcharge | 2.5 |
| cbd_congestion_fee | CBD congestion fee | 0.75 |
| trip_duration_minutes | Trip duration in minutes | 22 |
| pickup_hour | Pickup hour (0-23) | 14 |
| pickup_day | Day of week (Monday-Sunday) | "Friday" |
| pickup_month | Month (1-12) | 1 |

## 🛠️ Development

### Project Structure
```
model/
├── predictionAPI.py          # Main Flask API
├── requirements.txt          # Python dependencies
├── test_api.py              # API testing script
├── save_model_components.py # Helper for saving model files
├── best_taxi_fare_model.pth # Trained model weights
├── scaler.pkl               # Preprocessing scaler
└── README.md                # This file
```

### Model Architecture
- Input: 17 features
- Hidden layers: 128 → 64 → 32 neurons
- Activation: ReLU
- Regularization: Batch normalization + Dropout (20%)
- Output: Single neuron (fare prediction)

## 🔍 Troubleshooting

### Common Issues

1. **Model file not found**
   - Ensure `best_taxi_fare_model.pth` is in the API directory
   - Train the model first in the notebook

2. **Scaler not found**
   - Save the scaler manually after training (see setup instructions)
   - The API will create a dummy scaler as fallback

3. **CORS errors in React**
   - The API includes CORS headers
   - Ensure flask-cors is installed

4. **Dependencies missing**
   - Install all requirements: `pip install -r requirements.txt`

### Testing
Run the test script to verify everything works:
```bash
python test_api.py
```

## 📱 Production Deployment

For production use:
1. Set `debug=False` in the Flask app
2. Use a production WSGI server (e.g., Gunicorn)
3. Configure proper logging
4. Set up environment variables for configuration
5. Add authentication if needed

## 🤝 Contributing

1. Train your model using the Jupyter notebook
2. Save the model and scaler files
3. Test the API with the provided test script
4. Integrate with your React frontend

## 📄 License

This project is part of the Sopra Steria internship taxi fare prediction system.
