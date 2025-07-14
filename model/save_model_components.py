"""
Helper script to save the scaler from the training notebook
Run this after training your model in the notebook
"""

import pickle
import torch
from sklearn.preprocessing import StandardScaler
import sys
import os

def save_scaler_and_model():
    """
    Save the trained scaler and model for use in the API
    This should be run after training in the notebook
    """
    try:
        # Import from the notebook globals (if running in notebook environment)
        # You'll need to run this in the notebook after training
        
        print("Saving scaler and model for API usage...")
        
        # Example of how to save after training in notebook:
        # Assuming you have train_dataset with scaler
        
        # Save scaler
        # with open('scaler.pkl', 'wb') as f:
        #     pickle.dump(train_dataset.scaler, f)
        
        # The model is already saved as 'best_taxi_fare_model.pth' during training
        
        print("To use this script properly:")
        print("1. Run your training in the notebook")
        print("2. In the notebook, add this cell:")
        print()
        print("# Save scaler for API")
        print("import pickle")
        print("with open('scaler.pkl', 'wb') as f:")
        print("    pickle.dump(train_dataset.scaler, f)")
        print("print('Scaler saved for API!')")
        print()
        print("3. Make sure 'best_taxi_fare_model.pth' exists from training")
        print("4. Copy both files to the same directory as predictionAPI.py")
        
    except Exception as e:
        print(f"Error: {e}")
        print("Make sure to run this after training the model in the notebook")

if __name__ == "__main__":
    save_scaler_and_model()
