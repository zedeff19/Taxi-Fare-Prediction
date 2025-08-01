// const API_BASE = 'http://localhost:5000';
const API_BASE = 'https://tanaysriva19-trafficprediction.hf.space';
let taxiZones = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Initializing Taxi Fare Predictor...');
    
    await loadTaxiZones();
    initializeTimeField();
    initializeDateField();
    setupFormValidation();
    initializeFareTrendCharts();
    
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

// Initialize date field with current date and set minimum date
function initializeDateField() {
    const dateElement = document.getElementById('pickupDate');
    if (dateElement) {
        const now = new Date();
        const today = now.toISOString().split('T')[0]; // Format: YYYY-MM-DD
        
        // Set current date as default
        dateElement.value = today;
        
        // Set minimum date to today (prevent booking in the past)
        dateElement.min = today;
        
        // Set maximum date to 1 year from now (reasonable booking limit)
        const maxDate = new Date();
        maxDate.setFullYear(maxDate.getFullYear() + 1);
        dateElement.max = maxDate.toISOString().split('T')[0];
        
        console.log(`📅 Date field initialized to: ${dateElement.value} (min: ${today})`);
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
        if (input.type === 'time' || input.type === 'date') {
            input.addEventListener('input', validateForm);
        }
    });
    
    // Add specific validation for date input
    const dateInput = document.getElementById('pickupDate');
    if (dateInput) {
        dateInput.addEventListener('change', validatePickupDate);
    }
}

// Validate pickup date
function validatePickupDate() {
    const dateInput = document.getElementById('pickupDate');
    const selectedDate = new Date(dateInput.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time for accurate comparison
    
    if (selectedDate < today) {
        alert('⚠️ Please select today\'s date or a future date. You cannot book rides for past dates.');
        dateInput.value = today.toISOString().split('T')[0];
        return false;
    }
    
    return true;
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
    
    // Additional validation: Check if pickup and dropoff are the same
    const pickupLocation = document.getElementById('pickupLocation');
    const dropoffLocation = document.getElementById('dropoffLocation');
    
    if (pickupLocation && dropoffLocation && 
        pickupLocation.value && dropoffLocation.value && 
        pickupLocation.value === dropoffLocation.value) {
        isValid = false;
        
        // Show a visual indication that locations are the same
        if (!document.getElementById('sameLocationWarning')) {
            const warningDiv = document.createElement('div');
            warningDiv.id = 'sameLocationWarning';
            warningDiv.style.color = '#e74c3c';
            warningDiv.style.fontSize = '14px';
            warningDiv.style.marginTop = '10px';
            warningDiv.style.padding = '8px';
            warningDiv.style.backgroundColor = '#ffeaa7';
            warningDiv.style.border = '1px solid #fdcb6e';
            warningDiv.style.borderRadius = '4px';
            warningDiv.innerHTML = '⚠️ Pickup and dropoff locations must be different';
            
            dropoffLocation.parentElement.appendChild(warningDiv);
        }
    } else {
        // Remove warning if locations are different
        const existingWarning = document.getElementById('sameLocationWarning');
        if (existingWarning) {
            existingWarning.remove();
        }
    }
    
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
        console.log('🔍 Testing API connection to:', API_BASE);
        
        // First try the root endpoint
        const response = await fetch(`${API_BASE}/`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            mode: 'cors' // Explicitly set CORS mode
        });
        
        console.log('📡 Response status:', response.status);
        console.log('📡 Response headers:', [...response.headers.entries()]);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('📥 Response data:', data);
        
        resultDiv.className = 'result success';
        resultDiv.innerHTML = `
            <h3>✅ API Connection Successful</h3>
            <p><strong>Status:</strong> ${data.status || 'Connected'}</p>
            <p><strong>Message:</strong> ${data.message || 'API is working'}</p>
            <p><strong>Model Status:</strong> ${data.model_loaded ? '✅ Loaded' : '❓ Unknown'}</p>
            <p><strong>Scaler Status:</strong> ${data.scaler_loaded ? '✅ Loaded' : '❓ Unknown'}</p>
            <p><strong>API URL:</strong> ${API_BASE}</p>
        `;
    } catch (error) {
        console.error('❌ API Health Check Error:', error);
        
        // Try alternative endpoints
        resultDiv.innerHTML = 'Trying alternative endpoints...';
        
        try {
            // Try without trailing slash
            const altResponse = await fetch(`${API_BASE}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
                mode: 'cors'
            });
            
            if (altResponse.ok) {
                const altData = await altResponse.json();
                resultDiv.className = 'result success';
                resultDiv.innerHTML = `
                    <h3>✅ API Connection Successful (Alternative)</h3>
                    <p><strong>Status:</strong> Connected</p>
                    <p><strong>Response:</strong> ${JSON.stringify(altData)}</p>
                `;
                return;
            }
        } catch (altError) {
            console.error('Alternative endpoint also failed:', altError);
        }
        
        resultDiv.className = 'result error';
        resultDiv.innerHTML = `
            <h3>❌ Connection Failed</h3>
            <p><strong>Error:</strong> ${error.message}</p>
            <p><strong>API URL:</strong> ${API_BASE}</p>
            <div style="margin-top: 15px;">
                <h4>🔧 Possible Solutions:</h4>
                <ul style="text-align: left; margin: 10px 0;">
                    <li>Check if your Hugging Face Space is running</li>
                    <li>Verify the Space URL is correct</li>
                    <li>Ensure your Space allows CORS requests</li>
                    <li>Check if the Space is in "Building" or "Error" state</li>
                </ul>
                <p><strong>Debug Info:</strong></p>
                <pre style="background: #f8f9fa; padding: 10px; border-radius: 4px; text-align: left; font-size: 12px;">
Error Type: ${error.name}
Error Message: ${error.message}
Stack: ${error.stack?.slice(0, 200)}...
                </pre>
            </div>
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
        
        // Check if pickup and dropoff locations are the same
        if (formData.pickup_location_id === formData.dropoff_location_id) {
            throw new Error('Pickup and dropoff locations cannot be the same. Please select different locations for your trip.');
        }
        
        // Try to get real distance from Google Maps
        let realDistance = null;
        if (window.getGoogleMapsIntegration && window.getGoogleMapsIntegration()) {
            resultDiv.innerHTML = '🗺️ Getting real distance from Google Maps...';
            try {
                const mapsIntegration = window.getGoogleMapsIntegration();
                realDistance = await mapsIntegration.getDistanceForPrediction(
                    formData.pickup_location_id,
                    formData.dropoff_location_id,
                    taxiZones
                );
                console.log(`📏 Google Maps distance: ${realDistance} miles`);
            } catch (error) {
                console.warn('Google Maps distance failed, using fallback:', error.message);
            }
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
        
        // Add real distance if available
        if (realDistance) {
            tripData.real_distance = realDistance;
        }
        
        console.log('📤 Sending prediction request:', tripData);
        
        resultDiv.innerHTML = '🤖 Getting AI prediction...';
        
        // Make API call with improved error handling
        const response = await fetch(`${API_BASE}/predict_from_locations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(tripData),
            mode: 'cors'
        });
        
        console.log('📡 Prediction response status:', response.status);
        console.log('📡 Prediction response headers:', [...response.headers.entries()]);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ API Error Response:', errorText);
            throw new Error(`API Error ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        console.log('📥 Received response:', data);
        
        if (response.ok && data.success) {
            displaySuccessResult(data, formData, realDistance);
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
        // Get form elements with null checks
        const pickupElement = document.getElementById('pickupLocation');
        const dropoffElement = document.getElementById('dropoffLocation');
        const passengerElement = document.getElementById('passengerCount');
        const timeElement = document.getElementById('pickupTime');
        const dateElement = document.getElementById('pickupDate');
        
        console.log('Form elements check:', {
            pickupElement: !!pickupElement,
            dropoffElement: !!dropoffElement,
            passengerElement: !!passengerElement,
            timeElement: !!timeElement,
            dateElement: !!dateElement
        });
        
        if (!pickupElement || !dropoffElement || !passengerElement || !timeElement || !dateElement) {
            throw new Error('One or more form elements not found');
        }
        
        // Parse the selected date
        const selectedDate = new Date(dateElement.value);
        if (isNaN(selectedDate.getTime())) {
            throw new Error('Invalid date selected');
        }
        
        // Get day of week and month from selected date
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const selectedDay = dayNames[selectedDate.getDay()];
        const selectedMonth = selectedDate.getMonth() + 1; // JavaScript months are 0-indexed
        
        // Parse the time input (format: "HH:MM")
        let pickupHour;
        if (timeElement.value) {
            const timeValue = timeElement.value; // e.g., "14:30"
            pickupHour = parseInt(timeValue.split(':')[0]); // Extract hour
            console.log(`Time input: ${timeValue} -> Hour: ${pickupHour}`);
        } else {
            // Fallback to current hour if no time selected
            pickupHour = new Date().getHours();
            console.log(`No time input, using current hour: ${pickupHour}`);
        }
        
        // Handle passenger count - use distinct values for the ranges
        const passengerRange = passengerElement.value;
        let passengerCount;
        if (passengerRange === '1-4') {
            passengerCount = 3; // Use middle value for testing difference
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
            pickup_day: selectedDay,
            pickup_month: selectedMonth,
            pickup_date: dateElement.value, // Store the actual date for display
            pickup_time: timeElement.value  // Store the actual time for display
        };
        
        console.log('Form data collected:', formData);
        console.log(`Selected date: ${dateElement.value} -> Day: ${selectedDay}, Month: ${selectedMonth}`);
        
        return formData;
        
    } catch (error) {
        console.error('Error in getFormData:', error);
        throw error;
    }
}

// Display success result
function displaySuccessResult(data, formData, realDistance = null) {
    const resultDiv = document.getElementById('predictionResult');
    
    // Get location names
    const pickupZone = taxiZones.find(z => z.id === formData.pickup_location_id);
    const dropoffZone = taxiZones.find(z => z.id === formData.dropoff_location_id);
    
    // Format the selected date and time for display
    const selectedDate = new Date(formData.pickup_date);
    const formattedDate = selectedDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const formattedTime = formatTimeInput(formData.pickup_time);
    
    // Get original passenger range from form
    const passengerRange = document.getElementById('passengerCount').value;
    
    // Display distance source
    const distanceSource = realDistance ? 
        `${data.trip_details.trip_distance} miles (Google Maps: ${realDistance} miles)` :
        `${data.trip_details.trip_distance} miles (estimated)`;
    
    // Determine if this is a future prediction
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isToday = selectedDate.getTime() === today.getTime();
    const isFuture = selectedDate > today;
    
    let dateTimeDisplay = `${formattedTime} on ${formattedDate}`;
    if (isToday) {
        dateTimeDisplay += " (Today)";
    } else if (isFuture) {
        dateTimeDisplay += " (Future Booking)";
    }
    
    resultDiv.className = 'result success';
    resultDiv.innerHTML = `
        <h3>🎯 Predicted Fare for ${formattedDate} at ${formattedTime}</h3>
        <div class="fare-highlight">$${data.predicted_fare}</div>
        
        <div class="trip-summary">
            <h4>📍 Trip Details</h4>
            <p><strong>From:</strong> ${pickupZone ? pickupZone.name : 'Unknown'}</p>
            <p><strong>To:</strong> ${dropoffZone ? dropoffZone.name : 'Unknown'}</p>
            <p><strong>Distance:</strong> ${distanceSource}</p>
            <p><strong>Duration:</strong> ~${data.trip_details.trip_duration_minutes} minutes</p>
            <p><strong>Passengers:</strong> ${passengerRange} passengers</p>
            <p><strong>Scheduled:</strong> ${dateTimeDisplay}</p>
            <p><strong>Day of Week:</strong> ${formData.pickup_day} ${isFuture ? '(affects pricing)' : ''}</p>
        </div>
        
        <p><small>💡 <strong>Tip:</strong> Consider adding 18-20% gratuity for your driver</small></p>
        <p><small>📊 Estimate considers day of week and time for accurate pricing</small></p>
        ${isFuture ? '<p><small>🔮 <strong>Future Booking:</strong> Prices may vary based on actual demand and traffic</small></p>' : ''}
        ${realDistance ? '<p><small>🗺️ Distance calculated using Google Maps with real-time traffic</small></p>' : ''}
    `;
}

// Display error result
function displayErrorResult(errorMessage) {
    const resultDiv = document.getElementById('predictionResult');
    
    // Check if it's the same location error for special handling
    if (errorMessage.includes('cannot be the same')) {
        resultDiv.className = 'result error';
        resultDiv.innerHTML = `
            <h3>⚠️ Same Location Selected</h3>
            <p><strong>Issue:</strong> Pickup and dropoff locations are identical</p>
            <p>Please select different locations to get a valid fare estimate.</p>
            <div style="margin-top: 15px; padding: 10px; background-color: #e8f4fd; border-left: 4px solid #3498db; border-radius: 4px;">
                <p><strong>💡 Did you know?</strong></p>
                <ul style="margin: 5px 0; padding-left: 20px;">
                    <li>NYC taxis have a minimum fare even for very short trips</li>
                    <li>If you need to wait at the same location, consider asking the driver to wait</li>
                    <li>For pickups at the same building, try selecting a nearby location</li>
                </ul>
            </div>
        `;
    } else {
        // Regular error display
        resultDiv.className = 'result error';
        resultDiv.innerHTML = `
            <h3>❌ Prediction Failed</h3>
            <p><strong>Error:</strong> ${errorMessage}</p>
            <p>Please check your inputs and try again.</p>
            <p>If the problem persists, ensure the API server is running.</p>
        `;
    }
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
        
        // Check if pickup and dropoff are the same
        if (pickup.id === dropoff.id) {
            resultDiv.className = 'result error';
            resultDiv.innerHTML = `
                <h3>⚠️ Same Location Selected</h3>
                <p>Both pickup and dropoff are set to: <strong>${pickup.name}</strong></p>
                <p>Please select different locations for a valid trip estimate.</p>
                <p><small>💡 Tip: NYC taxi minimum fare applies even for very short trips</small></p>
            `;
            return;
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

// ============================================
// FARE TREND CHARTS FUNCTIONALITY
// ============================================

let dayOfWeekChart = null;
let timeOfDayChart = null;

// Initialize fare trend charts
function initializeFareTrendCharts() {
    console.log('📊 Initializing fare trend charts...');
    
    try {
        // Generate realistic NYC taxi fare data
        const fareData = generateRealisticFareData();
        
        // Create day of week chart
        createDayOfWeekChart(fareData.dayOfWeek);
        
        // Create time of day chart
        createTimeOfDayChart(fareData.timeOfDay);
        
        // Generate insights
        generateFareInsights(fareData);
        
        console.log('✅ Fare trend charts initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing charts:', error);
    }
}

// Generate realistic NYC taxi fare data based on actual patterns
function generateRealisticFareData() {
    // Simple day of week data - realistic NYC patterns
    const dayOfWeek = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        data: [12.50, 12.30, 12.20, 12.80, 15.20, 17.50, 16.80]
    };
    
    // Simple time of day data - 6 time periods
    const timeOfDay = {
        labels: ['6AM', '9AM', '12PM', '3PM', '6PM', '9PM'],
        data: [11.80, 14.20, 12.60, 12.40, 16.50, 13.90]
    };
    
    return { dayOfWeek, timeOfDay };
}

// Create day of week chart
function createDayOfWeekChart(data) {
    const ctx = document.getElementById('dayOfWeekChart');
    if (!ctx) return;
    
    dayOfWeekChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Average Fare ($)',
                data: data.data,
                backgroundColor: '#3498db80',
                borderColor: '#3498db',
                borderWidth: 2,
                borderRadius: 4,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `$${context.parsed.y.toFixed(2)} average fare`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    min: 10,
                    max: 20,
                    ticks: {
                        callback: function(value) {
                            return '$' + value;
                        }
                    }
                }
            }
        }
    });
}

// Create time of day chart
function createTimeOfDayChart(data) {
    const ctx = document.getElementById('timeOfDayChart');
    if (!ctx) return;
    
    timeOfDayChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Average Fare ($)',
                data: data.data,
                backgroundColor: '#e74c3c30',
                borderColor: '#e74c3c',
                borderWidth: 3,
                fill: true,
                tension: 0.3,
                pointBackgroundColor: '#e74c3c',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 4,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `$${context.parsed.y.toFixed(2)} average fare`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    min: 10,
                    max: 20,
                    ticks: {
                        callback: function(value) {
                            return '$' + value;
                        }
                    }
                }
            }
        }
    });
}

// Generate insights and tips based on fare data
function generateFareInsights(fareData) {
    // Day insights
    const dayData = fareData.dayOfWeek.data;
    const cheapestDay = fareData.dayOfWeek.labels[dayData.indexOf(Math.min(...dayData))];
    const expensiveDay = fareData.dayOfWeek.labels[dayData.indexOf(Math.max(...dayData))];
    
    document.getElementById('dayInsights').innerHTML = 
        `<strong>Cheapest:</strong> ${cheapestDay} ($${Math.min(...dayData).toFixed(2)}) | 
         <strong>Most expensive:</strong> ${expensiveDay} ($${Math.max(...dayData).toFixed(2)})`;
    
    // Time insights
    const timeData = fareData.timeOfDay.data;
    const cheapestTime = fareData.timeOfDay.labels[timeData.indexOf(Math.min(...timeData))];
    const expensiveTime = fareData.timeOfDay.labels[timeData.indexOf(Math.max(...timeData))];
    
    document.getElementById('timeInsights').innerHTML = 
        `<strong>Cheapest:</strong> Around ${cheapestTime} ($${Math.min(...timeData).toFixed(2)}) | 
         <strong>Most expensive:</strong> Around ${expensiveTime} ($${Math.max(...timeData).toFixed(2)})`;
    
    // Generate all possible money-saving tips
    const allTips = [
        `Book rides on ${cheapestDay} to save up to $${(Math.max(...dayData) - Math.min(...dayData)).toFixed(2)} per trip`,
        `Avoid weekend nights (Friday-Sunday) when fares are 20-40% higher`,
        `Travel around ${cheapestTime} for the lowest fares of the day`,
        `Rush hours (7-9 AM, 5-8 PM) typically cost 15-25% more`,
        `Late night rides (12-4 AM) have surge pricing due to limited availability`,
        `Wednesday is typically the cheapest day for NYC taxi rides`,
        `Large groups (5+ passengers) require bigger vehicles with 35% surcharge`,
        `Pre-book your rides during peak hours to avoid surge pricing`,
        `Consider walking short distances (under 0.5 miles) to save on minimum fare`,
        `Airport trips during off-peak hours can save you 20-30%`,
        `Sharing rides with apps can reduce costs for longer trips`,
        `Bad weather increases demand - plan accordingly or use public transport`
    ];
    
    // Randomly select 3-4 tips
    const numTips = Math.random() > 0.5 ? 3 : 4;
    const shuffledTips = [...allTips].sort(() => Math.random() - 0.5);
    const selectedTips = shuffledTips.slice(0, numTips);
    
    document.getElementById('savingTips').innerHTML = 
        selectedTips.map(tip => `<li>${tip}</li>`).join('');
}

// Export functions for global access
window.testHealthCheck = testHealthCheck;
window.predictFare = predictFare;
window.quickEstimate = quickEstimate;
