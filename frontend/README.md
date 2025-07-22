# 🚖 NYC Taxi Fare Predictor - Frontend

A modern, user-friendly interface for predicting NYC taxi fares using machine learning.

## 📁 Files Overview

### Main Frontend
- **`index.html`** - Main application with dropdown location selectors
- **`styles.css`** - Modern CSS styling with responsive design
- **`app.js`** - JavaScript application logic and API integration
- **`taxi_zones.json`** - Complete list of NYC taxi zones for dropdowns

### Testing
- **`test.html`** - Simple API testing interface

## 🚀 Features

### ✨ User-Friendly Interface
- **Dropdown Location Selection** - No need to remember zone IDs
- **Smart Defaults** - Intelligent default values for quick testing
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Real-time Validation** - Form validation with helpful feedback

### 🎯 Smart Predictions
- **Location-Based** - Just select pickup and dropoff locations
- **Distance Calculation** - Uses precomputed distance matrix
- **Intelligent Estimates** - Automatically estimates trip features
- **Detailed Breakdown** - Shows fare components and trip details

### ⚡ Quick Features
- **API Health Check** - Monitor backend status
- **Quick Estimates** - One-click estimates for popular routes
- **Batch Testing** - Multiple prediction examples
- **Error Handling** - Graceful error messages and recovery

## 🛠️ Setup Instructions

### 1. Ensure Backend is Running
```bash
cd "d:\college\projects\traffic prediction\Taxi-Fare-Prediction\model\api"
python predictionAPI.py
```

### 2. Open Frontend
- Open `index.html` in your web browser
- Or use `test.html` for simple API testing

### 3. Test the Application
1. **Health Check** - Click "Check API Health" to verify backend
2. **Select Locations** - Choose pickup and dropoff from dropdowns
3. **Set Parameters** - Adjust passengers, time, and date
4. **Get Estimate** - Click "Get Fare Estimate"

## 📊 Available Zones

The application includes all 265 NYC taxi zones:
- **Manhattan** - Times Square, Central Park, Financial District, etc.
- **Brooklyn** - Downtown Brooklyn, Park Slope, Williamsburg, etc.
- **Queens** - LGA Airport, JFK Airport, Flushing, etc.
- **Bronx** - Yankee Stadium, Bronx Zoo, etc.
- **Staten Island** - St. George, Tottenville, etc.
- **Airports** - JFK, LGA, Newark

## 🔧 API Endpoints Used

### Primary Endpoint
- **`POST /predict_from_locations`** - Location-based predictions
  ```json
  {
    "pickup_location_id": 161,
    "dropoff_location_id": 230,
    "passenger_count": 1,
    "pickup_hour": 14,
    "pickup_day": "Friday",
    "pickup_month": 7
  }
  ```

### Additional Endpoints
- **`GET /`** - Health check and status
- **`GET /features`** - Feature information
- **`POST /predict`** - Direct feature-based prediction

## 💡 Usage Examples

### Popular Routes
- **JFK Airport ↔ Manhattan** - ~$45-65
- **LGA Airport ↔ Manhattan** - ~$35-50
- **Times Square ↔ Brooklyn** - ~$15-25
- **Local Manhattan Trips** - ~$8-15

### Time-Based Variations
- **Rush Hours (7-9 AM, 5-7 PM)** - Higher congestion charges
- **Late Night (11 PM - 6 AM)** - Extra charges apply
- **Weekends** - Different pricing patterns

## 🎨 Design Features

### Modern UI/UX
- **Gradient Backgrounds** - Attractive visual design
- **Card-Based Layout** - Clean, organized sections
- **Hover Effects** - Interactive feedback
- **Loading States** - Visual feedback during API calls

### Responsive Design
- **Mobile-First** - Optimized for all screen sizes
- **Grid Layouts** - Flexible and adaptive
- **Touch-Friendly** - Large buttons and touch targets

## 🔍 Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Ensure backend server is running on port 5000
   - Check if CORS is enabled in the API
   - Verify the API_BASE URL in JavaScript

2. **No Locations in Dropdowns**
   - Check if `taxi_zones.json` file is present
   - Verify file path in `app.js`
   - Check browser console for loading errors

3. **Prediction Errors**
   - Verify model and scaler files are loaded
   - Check distance matrix availability
   - Ensure valid location IDs are selected

### Development Tips

1. **Testing API**
   - Use `test.html` for simple API testing
   - Check browser Network tab for API calls
   - Monitor backend logs for errors

2. **Customization**
   - Modify `styles.css` for visual changes
   - Update `app.js` for functionality changes
   - Edit `taxi_zones.json` for zone modifications

## 📈 Performance

### Optimizations
- **Efficient Loading** - Zones loaded once on startup
- **Smart Caching** - Reuse location data
- **Minimal API Calls** - Only when necessary
- **Fast UI Updates** - Immediate feedback

### Scalability
- **Modular Design** - Easy to extend and modify
- **API-First** - Backend can serve multiple frontends
- **Error Recovery** - Graceful handling of failures

## 🔒 Security Considerations

- **Client-Side Only** - No sensitive data stored
- **API Validation** - Backend validates all inputs
- **CORS Enabled** - Controlled cross-origin requests
- **Input Sanitization** - Clean data before API calls

---

**🎯 Ready to predict taxi fares with just pickup and dropoff locations!**
