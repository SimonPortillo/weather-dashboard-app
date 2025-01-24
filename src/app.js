import { fetchWeatherData, geocodeLocation } from './utils/api.js';

class WeatherApp {
    constructor() {
        this.weatherContainer = document.getElementById('weather-info');
        this.locationInput = document.getElementById('location');
        this.fetchButton = document.getElementById('fetch-weather');
        
        this.setupEventListeners();
        this.initMap();
    }

    setupEventListeners() {
        this.fetchButton.addEventListener('click', () => this.handleLocationSearch());
        document.getElementById('use-current-location').addEventListener('click', () => this.useCurrentLocation());
    }

    async handleLocationSearch() {
        const searchText = this.locationInput.value.trim();
        if (!searchText) return;

        try {
            this.setLoading(true);
            const location = await geocodeLocation(searchText);
            await this.fetchAndDisplayWeather(location);
        } catch (error) {
            this.showError(error.message);
        } finally {
            this.setLoading(false);
        }
    }

    async useCurrentLocation() {
        if (!navigator.geolocation) {
            this.showError('Geolocation is not supported by your browser');
            return;
        }

        try {
            this.setLoading(true);
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });

            const location = {
                lat: position.coords.latitude,
                lon: position.coords.longitude,
                displayName: 'Current Location'
            };

            await this.fetchAndDisplayWeather(location);
        } catch (error) {
            this.showError('Error getting location');
        } finally {
            this.setLoading(false);
        }
    }

    async fetchAndDisplayWeather(location) {
        const weather = await fetchWeatherData(location);
        this.updateWeatherUI(weather, location.displayName);
        this.updateMap(location.lat, location.lon);
        document.querySelector('.content-wrapper').classList.add('visible');
    }

    setLoading(isLoading) {
        const fetchButton = document.getElementById('fetch-weather');
        const searchIcon = '<span class="material-symbols-rounded">travel_explore</span>';
        
        fetchButton.disabled = isLoading;
        fetchButton.innerHTML = isLoading ? 
            `${searchIcon}Loading...` : 
            `${searchIcon}Search`;
    }

    showError(message) {
        const errorDiv = document.getElementById('error-message');
        errorDiv.innerHTML = `
            <span class="material-icons-round">error_outline</span>
            ${message}
        `;
        errorDiv.style.display = 'block';
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 3000);
    }

    getWeatherIcon(weather) {
        // Heavy rain
        if (weather.rain > 4) {
            return 'thunderstorm';
        }
        // Light to moderate rain
        if (weather.rain > 0) {
            return weather.cloudiness > 80 ? 'rainy' : 'grain';
        }
        // Very cloudy
        if (weather.cloudiness > 80) {
            return 'cloud';
        }
        // Partly cloudy
        if (weather.cloudiness > 20) {
            return 'partly_cloudy_day';
        }
        // Cold and clear
        if (weather.temperature < 0) {
            return 'ac_unit';
        }
        // Warm and clear
        if (weather.temperature > 25) {
            return 'wb_sunny';
        }
        // Default clear sky
        return 'light_mode';
    }

    updateWeatherUI(weather, locationName) {
        const locationIcon = '<span class="material-symbols-rounded">location_on</span>';
        const tempIcon = '<span class="material-symbols-rounded">device_thermostat</span>';
        const rainIcon = '<span class="material-symbols-rounded">water_drop</span>';
        const cloudIcon = '<span class="material-symbols-rounded">cloud</span>';

        // Update location name
        document.getElementById('location-name').innerHTML = `
            ${locationIcon}<span class="location-text">${locationName}</span>
        `;

        // Update weather summary icon with explicit classes
        document.getElementById('weather-summary').innerHTML = `
            <span class="material-symbols-rounded weather-summary-icon">${this.getWeatherIcon(weather)}</span>
        `;

        // Update weather details
        document.getElementById('temperature').innerHTML = `${tempIcon}<span>Temperature: ${weather.temperature}°C</span>`;
        document.getElementById('rain').innerHTML = `${rainIcon}<span>Rain: ${weather.rain}mm</span>`;
        document.getElementById('cloudiness').innerHTML = `${cloudIcon}<span>Cloudiness: ${weather.cloudiness}%</span>`;
    }

    initMap() {
        this.map = L.map('map').setView([0, 0], 2);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);
    }

    updateMap(lat, lon) {
        const position = [parseFloat(lat), parseFloat(lon)];
        this.map.setView(position, 13);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new WeatherApp();
});