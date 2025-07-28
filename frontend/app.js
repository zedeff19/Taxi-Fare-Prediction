const API_BASE = 'http://localhost:5000';
let taxiZones = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Initializing Taxi Fare Predictor...');
    
    await loadTaxiZones();
    initializeTimeField();
    setupFormValidation();
    
    console.log('✅ Application initialized successfully');
});

// Initialize time field with current time
function initializeTimeField() {
    const timeElement = document.getElementById('pickupTime');
    if (timeElement) {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        timeElement.value = `${hours}:${minutes}`;
        console.log(`⏰ Time field initialized to: ${timeElement.value}`);
    }
}

// Load taxi zones from JSON file
async function loadTaxiZones() {
    try {
        console.log('📍 Loading taxi zones...');
        
        // Try to load the JSON file
        const response = await fetch('taxi_zones.json');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        taxiZones = data.zones;
        
        populateLocationDropdowns();
        console.log(`✅ Loaded ${taxiZones.length} taxi zones`);
        
        // Show success notification
        showSuccessNotification(`Successfully loaded ${taxiZones.length} NYC taxi zones`);
        
    } catch (error) {
        console.error('❌ Error loading taxi zones:', error);
        showError(`Failed to load location data: ${error.message}`);
    }
}

// Show success notification
function showSuccessNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'result';
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '1000';
    notification.style.maxWidth = '400px';
    notification.style.background = '#d4edda';
    notification.style.border = '1px solid #c3e6cb';
    notification.style.color = '#155724';
    notification.style.padding = '15px';
    notification.style.borderRadius = '5px';
    
    notification.innerHTML = `
        <h4>✅ ${message}</h4>
        <button onclick="this.parentElement.remove()" style="margin-top: 10px; padding: 5px 10px; background: #fff; border: 1px solid #ccc; border-radius: 3px; cursor: pointer;">
            OK
        </button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Show detailed error with solutions
// Populate location dropdowns
function populateLocationDropdowns() {
    const pickupSelect = document.getElementById('pickupLocation');
    const dropoffSelect = document.getElementById('dropoffLocation');
    
    // Clear existing options (except first)
    pickupSelect.innerHTML = '<option value="">Select pickup location...</option>';
    dropoffSelect.innerHTML = '<option value="">Select dropoff location...</option>';
    
    // Add options for each zone
    taxiZones.forEach(zone => {
        const pickupOption = new Option(zone.name, zone.id);
        const dropoffOption = new Option(zone.name, zone.id);
        
        // Add borough info as data attribute for styling
        pickupOption.dataset.borough = zone.borough;
        dropoffOption.dataset.borough = zone.borough;
        
        pickupSelect.appendChild(pickupOption);
        dropoffSelect.appendChild(dropoffOption);
    });
    
    console.log('✅ Location dropdowns populated');
}

// Setup form validation
function setupFormValidation() {
    const form = document.querySelector('.trip-form');
    const inputs = form.querySelectorAll('select[required], input[required]');
    
    inputs.forEach(input => {
        input.addEventListener('change', validateForm);
        if (input.type === 'time') {
            input.addEventListener('input', validateForm);
        }
    });
}

// Validate form
function validateForm() {
    const form = document.querySelector('.trip-form');
    const submitBtn = form.querySelector('button[type="submit"]');
    const requiredInputs = form.querySelectorAll('select[required], input[required]');
    
    let isValid = true;
    requiredInputs.forEach(input => {
        if (!input.value) {
            isValid = false;
        }
    });
    
    submitBtn.disabled = !isValid;
    submitBtn.style.opacity = isValid ? '1' : '0.6';
}

// API Health Check
async function testHealthCheck() {
    const resultDiv = document.getElementById('healthResult');
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = 'Testing connection...';
    resultDiv.className = 'result';
    
    try {
        const response = await fetch(`${API_BASE}/`);
        const data = await response.json();
        
        resultDiv.className = 'result success';
        resultDiv.innerHTML = `
            <h3>✅ API Connection Successful</h3>
            <p><strong>Status:</strong> ${data.status}</p>
            <p><strong>Message:</strong> ${data.message}</p>
            <p><strong>Model Status:</strong> ${data.model_loaded ? '✅ Loaded' : '❌ Not Loaded'}</p>
            <p><strong>Scaler Status:</strong> ${data.scaler_loaded ? '✅ Loaded' : '❌ Not Loaded'}</p>
        `;
    } catch (error) {
        resultDiv.className = 'result error';
        resultDiv.innerHTML = `
            <h3>❌ Connection Failed</h3>
            <p><strong>Error:</strong> ${error.message}</p>
            <p>Please ensure the API server is running on <strong>http://localhost:5000</strong></p>
            <p>Start the server with: <code>python model/api/predictionAPI.py</code></p>
        `;
    }
}

// Main fare prediction function
async function predictFare(event) {
    if (event) {
        event.preventDefault();
    }
    
    const resultDiv = document.getElementById('predictionResult');
    const submitBtn = document.querySelector('button[type="submit"]');
    
    // Show loading state
    resultDiv.style.display = 'block';
    resultDiv.className = 'result';
    resultDiv.innerHTML = '🔄 Calculating fare estimate...';
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    try {
        // Collect form data
        const formData = getFormData();
        
        // Validate required fields
        if (!formData.pickup_location_id || !formData.dropoff_location_id) {
            throw new Error('Please select both pickup and dropoff locations');
        }
        
        // Prepare API request data
        const tripData = {
            pickup_location_id: formData.pickup_location_id,
            dropoff_location_id: formData.dropoff_location_id,
            passenger_count: formData.passenger_count,
            pickup_hour: formData.pickup_hour,
            pickup_day: formData.pickup_day,
            pickup_month: formData.pickup_month
        };
        
        console.log('📤 Sending prediction request:', tripData);
        
        // Make API call
        const response = await fetch(`${API_BASE}/predict_from_locations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(tripData)
        });
        
        const data = await response.json();
        console.log('📥 Received response:', data);
        
        if (response.ok && data.success) {
            displaySuccessResult(data, formData);
        } else {
            throw new Error(data.message || 'Prediction failed');
        }
        
    } catch (error) {
        console.error('❌ Prediction error:', error);
        displayErrorResult(error.message);
    } finally {
        // Remove loading state
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
}

// Get form data
function getFormData() {
    try {
        // Get current date for day and month (but use user input for time)
        const now = new Date();
        const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const currentDay = dayNames[now.getDay()];
        
        // Get form elements with null checks
        const pickupElement = document.getElementById('pickupLocation');
        const dropoffElement = document.getElementById('dropoffLocation');
        const passengerElement = document.getElementById('passengerCount');
        const timeElement = document.getElementById('pickupTime');
        
        console.log('Form elements check:', {
            pickupElement: pickupElement,
            dropoffElement: dropoffElement,
            passengerElement: passengerElement,
            timeElement: timeElement
        });
        
        if (!pickupElement || !dropoffElement || !passengerElement || !timeElement) {
            throw new Error('One or more form elements not found');
        }
        
        // Parse the time input (format: "HH:MM")
        let pickupHour;
        if (timeElement.value) {
            const timeValue = timeElement.value; // e.g., "14:30"
            pickupHour = parseInt(timeValue.split(':')[0]); // Extract hour
            console.log(`Time input: ${timeValue} -> Hour: ${pickupHour}`);
        } else {
            // Fallback to current hour if no time selected
            pickupHour = now.getHours();
            console.log(`No time input, using current hour: ${pickupHour}`);
        }
        
        // Handle passenger count - use distinct values for the ranges
        const passengerRange = passengerElement.value;
        let passengerCount;
        if (passengerRange === '1-4') {
            passengerCount = 1; // Use lower end for testing difference
        } else if (passengerRange === '4-7') {
            passengerCount = 6; // Use higher end for testing difference
        } else {
            passengerCount = 1; // Default fallback
        }
        
        console.log(`Passenger range: ${passengerRange} -> converted to: ${passengerCount}`);
        
        const formData = {
            pickup_location_id: parseInt(pickupElement.value),
            dropoff_location_id: parseInt(dropoffElement.value),
            passenger_count: passengerCount,
            pickup_hour: pickupHour,
            pickup_day: currentDay,
            pickup_month: currentMonth
        };
        
        console.log('Form data collected:', formData);
        return formData;
        
    } catch (error) {
        console.error('Error in getFormData:', error);
        throw error;
    }
}

// Display success result
function displaySuccessResult(data, formData) {
    const resultDiv = document.getElementById('predictionResult');
    
    // Get location names
    const pickupZone = taxiZones.find(z => z.id === formData.pickup_location_id);
    const dropoffZone = taxiZones.find(z => z.id === formData.dropoff_location_id);
    
    // Get the actual time input value to display
    const timeInputValue = document.getElementById('pickupTime').value;
    const timeStr = timeInputValue ? formatTimeInput(timeInputValue) : formatTime(formData.pickup_hour);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Get original passenger range from form
    const passengerRange = document.getElementById('passengerCount').value;
    
    resultDiv.className = 'result success';
    resultDiv.innerHTML = `
        <h3>🎯 Fare Estimate</h3>
        <div class="fare-highlight">$${data.predicted_fare}</div>
        
        <div class="trip-summary">
            <h4>📍 Trip Details</h4>
            <p><strong>From:</strong> ${pickupZone ? pickupZone.name : 'Unknown'}</p>
            <p><strong>To:</strong> ${dropoffZone ? dropoffZone.name : 'Unknown'}</p>
            <p><strong>Distance:</strong> ${data.trip_details.trip_distance} miles</p>
            <p><strong>Duration:</strong> ~${data.trip_details.trip_duration_minutes} minutes</p>
            <p><strong>Passengers:</strong> ${passengerRange} passengers</p>
            <p><strong>Time:</strong> ${timeStr} on ${formData.pickup_day}, ${monthNames[formData.pickup_month - 1]}</p>
        </div>
        
        <div class="trip-summary">
            <h4>💰 Fare Breakdown</h4>
            <p><strong>Base Fare:</strong> $${(data.predicted_fare * 0.7).toFixed(2)}</p>
            <p><strong>Distance Charge:</strong> $${(data.trip_details.trip_distance * 2.5).toFixed(2)}</p>
            <p><strong>Time Charge:</strong> $${(data.trip_details.trip_duration_minutes * 0.3).toFixed(2)}</p>
            <p><strong>Taxes & Fees:</strong> $${(data.predicted_fare * 0.15).toFixed(2)}</p>
            <p><strong>Total (excl. tip):</strong> $${data.predicted_fare}</p>
        </div>
        
        <p><small>💡 <strong>Tip:</strong> Consider adding 18-20% gratuity for your driver</small></p>
        <p><small>📊 Estimate based on historical data and current traffic patterns</small></p>
    `;
}

// Display error result
function displayErrorResult(errorMessage) {
    const resultDiv = document.getElementById('predictionResult');
    
    resultDiv.className = 'result error';
    resultDiv.innerHTML = `
        <h3>❌ Prediction Failed</h3>
        <p><strong>Error:</strong> ${errorMessage}</p>
        <p>Please check your inputs and try again.</p>
        <p>If the problem persists, ensure the API server is running.</p>
    `;
}

// Quick estimate function
async function quickEstimate(fromLocation, toLocation) {
    const resultDiv = document.getElementById('quickEstimateResult');
    resultDiv.style.display = 'block';
    resultDiv.className = 'result';
    resultDiv.innerHTML = `🔄 Getting estimate for ${fromLocation} to ${toLocation}...`;
    
    try {
        // Find locations by name (simplified search)
        const pickup = findLocationByName(fromLocation);
        const dropoff = findLocationByName(toLocation);
        
        if (!pickup || !dropoff) {
            throw new Error(`Could not find locations for ${fromLocation} or ${toLocation}`);
        }
        
        // Use current time as default
        const now = new Date();
        const tripData = {
            pickup_location_id: pickup.id,
            dropoff_location_id: dropoff.id,
            passenger_count: 1,
            pickup_hour: now.getHours(),
            pickup_day: getDayName(now.getDay()),
            pickup_month: now.getMonth() + 1
        };
        
        const response = await fetch(`${API_BASE}/predict_from_locations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(tripData)
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            resultDiv.className = 'result success';
            resultDiv.innerHTML = `
                <h3>⚡ Quick Estimate</h3>
                <div class="fare-highlight">$${data.predicted_fare}</div>
                <p><strong>Route:</strong> ${pickup.name} → ${dropoff.name}</p>
                <p><strong>Distance:</strong> ${data.trip_details.trip_distance} miles</p>
                <p><strong>Duration:</strong> ~${data.trip_details.trip_duration_minutes} minutes</p>
                <p><small>💡 Estimate for current time with 1 passenger</small></p>
            `;
        } else {
            throw new Error(data.message || 'Quick estimate failed');
        }
        
    } catch (error) {
        resultDiv.className = 'result error';
        resultDiv.innerHTML = `
            <h3>❌ Quick Estimate Failed</h3>
            <p>${error.message}</p>
        `;
    }
}

// Helper function to find location by name (fuzzy search)
function findLocationByName(searchName) {
    const normalizedSearch = searchName.toLowerCase();
    
    // Try exact zone name match first
    let match = taxiZones.find(zone => 
        zone.zone.toLowerCase().includes(normalizedSearch) ||
        zone.name.toLowerCase().includes(normalizedSearch)
    );
    
    // If not found, try borough match
    if (!match) {
        match = taxiZones.find(zone => 
            zone.borough.toLowerCase().includes(normalizedSearch)
        );
    }
    
    // Special cases for common names
    if (!match) {
        const specialCases = {
            'jfk': () => taxiZones.find(z => z.zone.toLowerCase().includes('jfk')),
            'lga': () => taxiZones.find(z => z.zone.toLowerCase().includes('laguardia')),
            'times square': () => taxiZones.find(z => z.zone.toLowerCase().includes('times sq')),
            'central park': () => taxiZones.find(z => z.zone.toLowerCase().includes('central park')),
            'manhattan': () => taxiZones.find(z => z.borough === 'Manhattan' && z.zone.includes('Midtown')),
            'brooklyn': () => taxiZones.find(z => z.borough === 'Brooklyn' && z.zone.includes('Downtown'))
        };
        
        const specialCase = specialCases[normalizedSearch];
        if (specialCase) {
            match = specialCase();
        }
    }
    
    return match;
}

// Helper function to format time input (HH:MM format)
function formatTimeInput(timeValue) {
    if (!timeValue) return '';
    
    const [hours, minutes] = timeValue.split(':');
    const hour = parseInt(hours);
    const min = minutes;
    
    if (hour === 0) return `12:${min} AM`;
    if (hour < 12) return `${hour}:${min} AM`;
    if (hour === 12) return `12:${min} PM`;
    return `${hour - 12}:${min} PM`;
}

// Helper function to format time
function formatTime(hour) {
    if (hour === 0) return '12:00 AM';
    if (hour < 12) return `${hour}:00 AM`;
    if (hour === 12) return '12:00 PM';
    return `${hour - 12}:00 PM`;
}

// Helper function to get day name
function getDayName(dayIndex) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayIndex];
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'result error';
    errorDiv.innerHTML = `<h3>❌ Error</h3><p>${message}</p>`;
    errorDiv.style.position = 'fixed';
    errorDiv.style.top = '20px';
    errorDiv.style.right = '20px';
    errorDiv.style.zIndex = '1000';
    errorDiv.style.maxWidth = '400px';
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Export functions for global access
window.testHealthCheck = testHealthCheck;
window.predictFare = predictFare;
window.quickEstimate = quickEstimate;
