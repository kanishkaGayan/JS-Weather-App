// Weather API configuration
const API_KEY = 'f9bd2dd3df2b4869b3822631252708';
const BASE_URL = 'https://api.weatherapi.com/v1';

// DOM elements
const weatherForm = document.getElementById('weatherForm');
const locationInput = document.getElementById('locationInput');
const searchBtn = document.getElementById('searchBtn');
const refreshBtn = document.getElementById('refreshBtn');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');
const weatherData = document.getElementById('weatherData');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

// Weather data elements
const locationName = document.getElementById('locationName');
const localTime = document.getElementById('localTime');
const temperature = document.getElementById('temperature');
const condition = document.getElementById('condition');
const feelsLike = document.getElementById('feelsLike');
const weatherIcon = document.getElementById('weatherIcon');
const visibility = document.getElementById('visibility');
const humidity = document.getElementById('humidity');
const wind = document.getElementById('wind');
const pressure = document.getElementById('pressure');
const uv = document.getElementById('uv');
const precipitation = document.getElementById('precipitation');
const cloud = document.getElementById('cloud');
const windDir = document.getElementById('windDir');

// Store current location for refresh functionality
let currentLocation = '';

// Event listeners
weatherForm.addEventListener('submit', handleFormSubmit);
refreshBtn.addEventListener('click', handleRefresh);
themeToggle.addEventListener('click', toggleTheme);

// Dark mode functionality
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Update icon
    if (newTheme === 'dark') {
        themeIcon.className = 'fas fa-sun';
        themeToggle.title = 'Switch to light mode';
    } else {
        themeIcon.className = 'fas fa-moon';
        themeToggle.title = 'Switch to dark mode';
    }
}

// Initialize theme
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');
    
    document.documentElement.setAttribute('data-theme', theme);
    
    if (theme === 'dark') {
        themeIcon.className = 'fas fa-sun';
        themeToggle.title = 'Switch to light mode';
    } else {
        themeIcon.className = 'fas fa-moon';
        themeToggle.title = 'Switch to dark mode';
    }
}

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
        const theme = e.matches ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        
        if (theme === 'dark') {
            themeIcon.className = 'fas fa-sun';
            themeToggle.title = 'Switch to light mode';
        } else {
            themeIcon.className = 'fas fa-moon';
            themeToggle.title = 'Switch to dark mode';
        }
    }
});

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();
    const location = locationInput.value.trim();
    
    if (!location) {
        showError('Please enter a location');
        return;
    }
    
    await fetchWeatherData(location);
}

// Handle refresh button click
async function handleRefresh() {
    if (currentLocation) {
        await fetchWeatherData(currentLocation);
    }
}

// Fetch weather data from API
async function fetchWeatherData(location) {
    try {
        showLoading();
        hideError();
        hideWeatherData();
        
        const response = await fetch(`${BASE_URL}/current.json?key=${API_KEY}&q=${encodeURIComponent(location)}&aqi=yes`);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Failed to fetch weather data');
        }
        
        const data = await response.json();
        displayWeatherData(data);
        currentLocation = location;
        
    } catch (error) {
        console.error('Error fetching weather data:', error);
        showError(error.message);
    } finally {
        hideLoading();
    }
}

// Display weather data
function displayWeatherData(data) {
    const { location, current } = data;
    
    // Location and time
    locationName.textContent = `${location.name}, ${location.region}, ${location.country}`;
    localTime.textContent = `Local time: ${formatDateTime(location.localtime)}`;
    
    // Main weather info
    temperature.textContent = Math.round(current.temp_c);
    condition.textContent = current.condition.text;
    feelsLike.textContent = Math.round(current.feelslike_c);
    weatherIcon.src = `https:${current.condition.icon}`;
    weatherIcon.alt = current.condition.text;
    
    // Weather details
    visibility.textContent = `${current.vis_km} km`;
    humidity.textContent = `${current.humidity}%`;
    wind.textContent = `${current.wind_kph} km/h`;
    pressure.textContent = `${current.pressure_mb} mb`;
    uv.textContent = getUVIndexText(current.uv);
    precipitation.textContent = `${current.precip_mm} mm`;
    cloud.textContent = `${current.cloud}%`;
    windDir.textContent = current.wind_dir;
    
    // Show weather data with animation
    weatherData.classList.remove('d-none');
    weatherData.classList.add('fade-in');
    
    // Update input value to show what was searched
    locationInput.value = location.name;
}

// Format date and time
function formatDateTime(dateTimeString) {
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Get UV index description
function getUVIndexText(uvIndex) {
    if (uvIndex <= 2) return `${uvIndex} (Low)`;
    if (uvIndex <= 5) return `${uvIndex} (Moderate)`;
    if (uvIndex <= 7) return `${uvIndex} (High)`;
    if (uvIndex <= 10) return `${uvIndex} (Very High)`;
    return `${uvIndex} (Extreme)`;
}

// Show loading state
function showLoading() {
    loading.classList.remove('d-none');
    searchBtn.disabled = true;
    searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
}

// Hide loading state
function hideLoading() {
    loading.classList.add('d-none');
    searchBtn.disabled = false;
    searchBtn.innerHTML = '<i class="fas fa-search"></i>';
}

// Show error message
function showError(message) {
    errorText.textContent = message;
    errorMessage.classList.remove('d-none');
    
    // Auto-hide error after 5 seconds
    setTimeout(() => {
        hideError();
    }, 5000);
}

// Hide error message
function hideError() {
    errorMessage.classList.add('d-none');
}

// Hide weather data
function hideWeatherData() {
    weatherData.classList.add('d-none');
    weatherData.classList.remove('fade-in');
}

// Get user's location and fetch weather data
async function getUserLocation() {
    if ('geolocation' in navigator) {
        try {
            showLoading();
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000
                });
            });
            
            const { latitude, longitude } = position.coords;
            const location = `${latitude},${longitude}`;
            await fetchWeatherData(location);
            
        } catch (error) {
            console.error('Error getting user location:', error);
            showError('Unable to get your location. Please enter a location manually.');
        }
    } else {
        showError('Geolocation is not supported by this browser.');
    }
}

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Press Ctrl/Cmd + Enter to search
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        weatherForm.dispatchEvent(new Event('submit'));
    }
    
    // Press F5 to refresh (if weather data is shown)
    if (e.key === 'F5' && !weatherData.classList.contains('d-none')) {
        e.preventDefault();
        handleRefresh();
    }
});

// Auto-focus on input when page loads
window.addEventListener('load', () => {
    // Initialize theme first
    initializeTheme();
    
    locationInput.focus();
    
    // Add placeholder suggestions
    const suggestions = [
        'New York',
        'London',
        'Tokyo',
        'Paris',
        'Sydney',
        'Mumbai',
        'Dubai',
        'Los Angeles'
    ];
    
    let currentSuggestion = 0;
    const rotatePlaceholder = () => {
        locationInput.placeholder = `Try "${suggestions[currentSuggestion]}"...`;
        currentSuggestion = (currentSuggestion + 1) % suggestions.length;
    };
    
    // Rotate placeholder every 3 seconds when input is empty
    setInterval(() => {
        if (!locationInput.value && document.activeElement !== locationInput) {
            rotatePlaceholder();
        }
    }, 3000);
});

// Add a button to get user's current location
function addLocationButton() {
    const locationBtn = document.createElement('button');
    locationBtn.type = 'button';
    locationBtn.className = 'btn btn-outline-secondary';
    locationBtn.innerHTML = '<i class="fas fa-location-arrow"></i>';
    locationBtn.title = 'Use my current location';
    locationBtn.onclick = getUserLocation;
    
    const searchContainer = document.querySelector('.search-container .d-flex');
    searchContainer.insertBefore(locationBtn, searchBtn);
}

// Initialize location button
addLocationButton();

// Handle online/offline status
window.addEventListener('online', () => {
    if (errorMessage.textContent.includes('offline') || errorMessage.textContent.includes('network')) {
        hideError();
    }
});

window.addEventListener('offline', () => {
    showError('You are offline. Please check your internet connection.');
});

// Error handling for fetch requests
function handleFetchError(error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return 'Network error. Please check your internet connection.';
    }
    if (error.message.includes('404')) {
        return 'Location not found. Please check the spelling and try again.';
    }
    if (error.message.includes('401')) {
        return 'API key error. Please contact the administrator.';
    }
    if (error.message.includes('403')) {
        return 'Access denied. API key may have exceeded its quota.';
    }
    return error.message || 'An unexpected error occurred.';
}
