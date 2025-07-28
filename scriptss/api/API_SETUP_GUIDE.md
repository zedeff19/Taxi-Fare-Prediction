# 🚖 NYC Taxi Fare Prediction API - Setup Guide

## 🚀 How to Run the API Server

### Option 1: From VS Code Terminal
1. **Open Terminal in VS Code**
   - Press `Ctrl + `` (backtick) or go to Terminal → New Terminal

2. **Navigate to API Directory**
   ```bash
   cd "d:\college\projects\traffic prediction\Taxi-Fare-Prediction\model\api"
   ```

3. **Run the API Server**
   ```bash
   python predictionAPI.py
   ```

### Option 2: From Command Prompt/PowerShell
1. **Open Command Prompt or PowerShell**
   - Press `Win + R`, type `cmd` or `powershell`, press Enter

2. **Navigate to Project Directory**
   ```bash
   cd "d:\college\projects\traffic prediction\Taxi-Fare-Prediction\model\api"
   ```

3. **Run the API Server**
   ```bash
   python predictionAPI.py
   ```

### Option 3: From File Explorer
1. **Navigate to the API folder**
   ```
   d:\college\projects\traffic prediction\Taxi-Fare-Prediction\model\api\
   ```

2. **Right-click in the folder** and select "Open in Terminal" or "Open PowerShell window here"

3. **Run the server**
   ```bash
   python predictionAPI.py
   ```

## ✅ Expected Output
When the server starts successfully, you should see:
```
INFO:__main__:Starting Taxi Fare Prediction API...
INFO:__main__:Model loaded successfully
INFO:__main__:Scaler loaded successfully (or warning about dummy scaler)
INFO:__main__:Distance matrix loaded successfully (or warning)
 * Running on all addresses (0.0.0.0)
 * Running on http://127.0.0.1:5000
 * Running on http://192.168.x.x:5000
```

## 🌐 Testing the API

### Test Health Check
Open your browser and go to:
```
http://localhost:5000/
```

You should see JSON response with API status.

### Test with Frontend
1. **Start the API server** (follow steps above)
2. **Open the frontend** - Navigate to:
   ```
   d:\college\projects\traffic prediction\Taxi-Fare-Prediction\frontend\
   ```
3. **Open `index.html`** in your web browser
4. **Click "Check API Health"** to verify connection

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. "python is not recognized"
**Problem**: Python not in PATH
**Solution**: 
- Install Python from python.org
- Or use `py` instead of `python`:
  ```bash
  py predictionAPI.py
  ```

#### 2. "No module named 'flask'"
**Problem**: Missing dependencies
**Solution**: Install required packages:
```bash
pip install flask flask-cors torch pandas scikit-learn numpy
```

#### 3. "Permission denied" or "Access denied"
**Problem**: File permissions
**Solution**: 
- Run terminal as Administrator
- Or check file permissions

#### 4. "Port 5000 already in use"
**Problem**: Another service using port 5000
**Solution**: 
- Stop other services using port 5000
- Or change port in the API code (line with `app.run`)

#### 5. "Model/Scaler file not found"
**Problem**: Missing model files
**Solution**: This is OK! The API will work with dummy models for testing

### Error Messages and What They Mean

#### ✅ Safe to Ignore (API will still work):
- `Model file not found. Using untrained model.`
- `Scaler not found. Created dummy scaler.`
- `Distance matrix not found. Using default distance.`

#### ❌ Need to Fix:
- `python is not recognized`
- `No module named 'flask'`
- `Permission denied`
- `Port already in use`

## 📁 Required File Structure
```
model/
├── api/
│   └── predictionAPI.py     ← Run this file
├── best_models/             ← Optional (API works without)
│   ├── best_taxi_fare_model.pth
│   └── scaler.pkl
└── distances/               ← Optional (API works without)
    └── full_taxi_zone_distance_matrix.csv
```

## 🎯 API Endpoints Available

Once running, these endpoints will be available:

- **`GET http://localhost:5000/`** - Health check
- **`POST http://localhost:5000/predict_from_locations`** - Location-based prediction
- **`POST http://localhost:5000/predict`** - Direct feature prediction
- **`GET http://localhost:5000/features`** - Feature information

## 🚦 Status Indicators

### Server Status
- **✅ Green "Running"** - Server started successfully
- **❌ Red "Error"** - Server failed to start

### Component Status
- **✅ Model Loaded** - PyTorch model ready
- **✅ Scaler Loaded** - Feature scaling ready
- **✅ Distance Matrix** - Location distances available

## 🔄 Stopping the Server
To stop the API server:
- Press `Ctrl + C` in the terminal where it's running
- Or close the terminal window

## 📞 Quick Test Commands

After starting the server, test these URLs in your browser:

1. **Health Check**: http://localhost:5000/
2. **Feature Info**: http://localhost:5000/features

Or use the frontend test page:
- Open `frontend/test.html` in your browser

---

**🎉 Once the server is running, you can use the frontend application!**
