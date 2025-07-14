"""
Taxi Fare Prediction API using Flask
Serves a PyTorch model trained on NYC taxi data for fare predictions
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import torch.nn as nn
import numpy as np
import pandas as pd
import pickle
import os
from sklearn.preprocessing import StandardScaler
import traceback
from datetime import datetime
import logging

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global variables for model and scaler
model = None
scaler = None
feature_order = [
    'PULocationID', 'DOLocationID', 'passenger_count', 'trip_distance',
    'extra', 'mta_tax', 'tip_amount', 'tolls_amount', 'total_amount',
    'payment_type', 'trip_type', 'congestion_surcharge', 'cbd_congestion_fee',
    'trip_duration_minutes', 'pickup_hour', 'pickup_day', 'pickup_month'
]

# Model Architecture (same as training)
class TaxiFareModel(nn.Module):
    """
    Deep Neural Network for taxi fare prediction
    """
    def __init__(self, input_size, hidden_sizes=[128, 64, 32], dropout_rate=0.2):
        super(TaxiFareModel, self).__init__()
        
        layers = []
        prev_size = input_size
        
        # Build hidden layers
        for hidden_size in hidden_sizes:
            layers.extend([
                nn.Linear(prev_size, hidden_size),
                nn.ReLU(),
                nn.BatchNorm1d(hidden_size),
                nn.Dropout(dropout_rate)
            ])
            prev_size = hidden_size
        
        # Output layer (single neuron for regression)
        layers.append(nn.Linear(prev_size, 1))
        
        self.model = nn.Sequential(*layers)
        
    def forward(self, x):
        return self.model(x).squeeze()

def load_model_and_scaler():
    """Load the trained model and scaler"""
    global model, scaler
    
    try:
        # Load model
        input_size = len(feature_order)
        model = TaxiFareModel(input_size=input_size)
        
        # Load trained weights
        model_path = 'best_taxi_fare_model.pth'
        if os.path.exists(model_path):
            model.load_state_dict(torch.load(model_path, map_location='cpu'))
            model.eval()
            logger.info("Model loaded successfully")
        else:
            logger.warning(f"Model file {model_path} not found. Using untrained model.")
        
        # Load scaler
        scaler_path = 'scaler.pkl'
        if os.path.exists(scaler_path):
            with open(scaler_path, 'rb') as f:
                scaler = pickle.load(f)
            logger.info("Scaler loaded successfully")
        else:
            # Create a dummy scaler if not found
            scaler = StandardScaler()
            # Fit with dummy data that matches expected ranges
            dummy_data = np.array([[
                150, 150, 1, 5, 0.5, 0.5, 2, 0, 20, 1, 1, 2.5, 0.75, 20, 12, 3, 1
            ]])
            scaler.fit(dummy_data)
            logger.warning("Scaler not found. Created dummy scaler.")
            
    except Exception as e:
        logger.error(f"Error loading model/scaler: {str(e)}")
        raise

def preprocess_input(data):
    """
    Preprocess input data for prediction
    """
    try:
        # Handle day name to number conversion
        if 'pickup_day' in data and isinstance(data['pickup_day'], str):
            day_mapping = {
                'Monday': 0, 'Tuesday': 1, 'Wednesday': 2, 'Thursday': 3,
                'Friday': 4, 'Saturday': 5, 'Sunday': 6,
                'monday': 0, 'tuesday': 1, 'wednesday': 2, 'thursday': 3,
                'friday': 4, 'saturday': 5, 'sunday': 6
            }
            data['pickup_day'] = day_mapping.get(data['pickup_day'], 0)
        
        # Create feature array in correct order
        features = []
        for feature in feature_order:
            if feature in data:
                features.append(float(data[feature]))
            else:
                # Default values for missing features
                defaults = {
                    'PULocationID': 161, 'DOLocationID': 230, 'passenger_count': 1,
                    'trip_distance': 5.0, 'extra': 0.5, 'mta_tax': 0.5,
                    'tip_amount': 2.0, 'tolls_amount': 0.0, 'total_amount': 20.0,
                    'payment_type': 1, 'trip_type': 1, 'congestion_surcharge': 2.5,
                    'cbd_congestion_fee': 0.75, 'trip_duration_minutes': 20,
                    'pickup_hour': 12, 'pickup_day': 3, 'pickup_month': 1
                }
                features.append(defaults.get(feature, 0.0))
        
        # Convert to numpy array
        features_array = np.array([features], dtype=np.float32)
        
        # Apply scaling
        if scaler:
            features_array = scaler.transform(features_array)
        
        return features_array
        
    except Exception as e:
        logger.error(f"Error preprocessing input: {str(e)}")
        raise

def make_prediction(features_array):
    """
    Make prediction using the loaded model
    """
    try:
        with torch.no_grad():
            # Convert to tensor
            input_tensor = torch.tensor(features_array, dtype=torch.float32)
            
            # Make prediction
            prediction = model(input_tensor)
            
            # Return as float
            return float(prediction.item())
            
    except Exception as e:
        logger.error(f"Error making prediction: {str(e)}")
        raise

# API Routes

@app.route('/', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'success',
        'message': 'Taxi Fare Prediction API is running',
        'model_loaded': model is not None,
        'scaler_loaded': scaler is not None,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/predict', methods=['POST'])
def predict_fare():
    """
    Main prediction endpoint
    Expected JSON format:
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
    """
    try:
        # Get JSON data from request
        data = request.get_json()
        
        if not data:
            return jsonify({
                'status': 'error',
                'message': 'No JSON data provided'
            }), 400
        
        # Log the request
        logger.info(f"Prediction request: {data}")
        
        # Preprocess input
        features_array = preprocess_input(data)
        
        # Make prediction
        predicted_fare = make_prediction(features_array)
        
        # Ensure prediction is reasonable (basic validation)
        if predicted_fare < 0:
            predicted_fare = abs(predicted_fare)
        if predicted_fare > 1000:  # Cap at $1000
            predicted_fare = 1000
        
        # Prepare response
        response = {
            'status': 'success',
            'predicted_fare': round(predicted_fare, 2),
            'currency': 'USD',
            'input_data': data,
            'timestamp': datetime.now().isoformat()
        }
        
        logger.info(f"Prediction successful: ${predicted_fare:.2f}")
        return jsonify(response)
        
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Prediction error: {error_msg}")
        logger.error(traceback.format_exc())
        
        return jsonify({
            'status': 'error',
            'message': f'Prediction failed: {error_msg}',
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/predict/batch', methods=['POST'])
def predict_batch():
    """
    Batch prediction endpoint
    Expected JSON format:
    {
        "trips": [
            {trip_data_1},
            {trip_data_2},
            ...
        ]
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'trips' not in data:
            return jsonify({
                'status': 'error',
                'message': 'No trips data provided. Expected format: {"trips": [...]}'
            }), 400
        
        trips = data['trips']
        predictions = []
        
        for i, trip in enumerate(trips):
            try:
                features_array = preprocess_input(trip)
                predicted_fare = make_prediction(features_array)
                
                # Basic validation
                if predicted_fare < 0:
                    predicted_fare = abs(predicted_fare)
                if predicted_fare > 1000:
                    predicted_fare = 1000
                
                predictions.append({
                    'trip_index': i,
                    'predicted_fare': round(predicted_fare, 2),
                    'input_data': trip
                })
                
            except Exception as e:
                predictions.append({
                    'trip_index': i,
                    'error': str(e),
                    'input_data': trip
                })
        
        return jsonify({
            'status': 'success',
            'predictions': predictions,
            'total_trips': len(trips),
            'successful_predictions': len([p for p in predictions if 'predicted_fare' in p]),
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Batch prediction error: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Batch prediction failed: {str(e)}',
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/features', methods=['GET'])
def get_features():
    """Get information about required features"""
    feature_info = {
        'required_features': feature_order,
        'feature_descriptions': {
            'PULocationID': 'Pickup location ID (numeric)',
            'DOLocationID': 'Dropoff location ID (numeric)',
            'passenger_count': 'Number of passengers (1-6)',
            'trip_distance': 'Trip distance in miles',
            'extra': 'Extra charges',
            'mta_tax': 'MTA tax (usually 0.5)',
            'tip_amount': 'Tip amount',
            'tolls_amount': 'Toll charges',
            'total_amount': 'Total trip amount',
            'payment_type': 'Payment type (1=Credit, 2=Cash)',
            'trip_type': 'Trip type (1=Street hail, 2=Dispatch)',
            'congestion_surcharge': 'Congestion surcharge',
            'cbd_congestion_fee': 'CBD congestion fee',
            'trip_duration_minutes': 'Trip duration in minutes',
            'pickup_hour': 'Pickup hour (0-23)',
            'pickup_day': 'Day of week (Monday-Sunday or 0-6)',
            'pickup_month': 'Month (1-12)'
        },
        'example_request': {
            'PULocationID': 161,
            'DOLocationID': 230,
            'passenger_count': 2,
            'trip_distance': 5.5,
            'extra': 0.5,
            'mta_tax': 0.5,
            'tip_amount': 3.0,
            'tolls_amount': 0.0,
            'total_amount': 25.0,
            'payment_type': 1,
            'trip_type': 1,
            'congestion_surcharge': 2.5,
            'cbd_congestion_fee': 0.75,
            'trip_duration_minutes': 22,
            'pickup_hour': 14,
            'pickup_day': 'Friday',
            'pickup_month': 1
        }
    }
    
    return jsonify(feature_info)

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'status': 'error',
        'message': 'Endpoint not found',
        'available_endpoints': [
            'GET /',
            'POST /predict',
            'POST /predict/batch',
            'GET /features'
        ]
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'status': 'error',
        'message': 'Internal server error',
        'timestamp': datetime.now().isoformat()
    }), 500

# Initialize the app
if __name__ == '__main__':
    try:
        logger.info("Starting Taxi Fare Prediction API...")
        
        # Load model and scaler
        load_model_and_scaler()
        
        # Start the Flask app
        app.run(debug=True, host='0.0.0.0', port=5000)
        
    except Exception as e:
        logger.error(f"Failed to start API: {str(e)}")
        raise
