import { fetchWeatherData, geocodeLocation } from './utils/api.js';

class WeatherApp {
    constructor() {
        this.weatherContainer = document.getElementById('weather-info');
        this.locationInput = document.getElementById('location');
        this.fetchButton = document.getElementById('fetch-weather');
        
        this.setupEventListeners();
        this.marker = null;
        this.mapLayer = null;
        this.initMap();
        this.initTheme();
    }

    setupEventListeners() {
        this.fetchButton.addEventListener('click', () => this.handleLocationSearch());
        document.getElementById('use-current-location').addEventListener('click', () => this.useCurrentLocation());
        
        // Add enter key listener
        this.locationInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                this.handleLocationSearch();
            }
        });

        // Add theme toggle listener
        document.querySelector('.theme-toggle').addEventListener('click', () => this.toggleTheme());
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
            <span class="material-symbols-rounded" style="color: white; font-size: 24px; 
            vertical-align: middle; margin-right: 0px; margin-bottom: 4px;">error</span>${message}`;
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

    async updateWeatherUI(weather, locationName) {
        const elements = [
            document.getElementById('location-name'),
            document.getElementById('weather-summary'),
            document.querySelector('.weather-details')
        ];
        
        // Fade out
        elements.forEach(el => el.classList.add('fade-out'));
        
        // Wait for fade out
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const locationIcon = '<span class="material-symbols-rounded">location_on</span>';
        const tempIcon = '<span class="material-symbols-rounded">device_thermostat</span>';
        const rainIcon = '<span class="material-symbols-rounded">water_drop</span>';
        const cloudIcon = '<span class="material-symbols-rounded">cloud</span>';

        // Update content
        document.getElementById('location-name').innerHTML = `
            ${locationIcon}<span class="location-text">${locationName}</span>
        `;
        document.getElementById('weather-summary').innerHTML = `
            <span class="material-symbols-rounded weather-summary-icon">${this.getWeatherIcon(weather)}</span>
        `;
        document.getElementById('temperature').innerHTML = `${tempIcon}<span>Temperature: ${weather.temperature}°C</span>`;
        document.getElementById('rain').innerHTML = `${rainIcon}<span>Rain: ${weather.rain}mm</span>`;
        document.getElementById('cloudiness').innerHTML = `${cloudIcon}<span>Cloudiness: ${weather.cloudiness}%</span>`;

        // Fade in
        setTimeout(() => {
            elements.forEach(el => el.classList.remove('fade-out'));
        }, 50);
    }

    initMap() {
        this.map = L.map('map').setView([0, 0], 2);
        this.updateMapTheme(localStorage.getItem('theme') || 'light');
    }

    updateMap(lat, lon) {
        const position = [parseFloat(lat), parseFloat(lon)];
        
        // Remove existing marker if any
        if (this.marker) {
            this.map.removeLayer(this.marker);
        }
        
        // Add new marker
        this.marker = L.marker(position).addTo(this.map);
        this.map.setView(position, 10);
    }

    updateMapTheme(theme) {
        const lightStyle = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
        const darkStyle = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
        
        // Remove existing layer if any
        if (this.mapLayer) {
            this.map.removeLayer(this.mapLayer);
        }

        // Add new layer with appropriate style
        this.mapLayer = L.tileLayer(theme === 'dark' ? darkStyle : lightStyle, {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(this.map);
    }

    initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        this.updateThemeIcon(newTheme);
        this.updateMapTheme(newTheme);
    }

    updateThemeIcon(theme) {
        const themeIcon = document.querySelector('.theme-toggle .material-symbols-rounded');
        themeIcon.textContent = theme === 'dark' ? 'dark_mode' : 'light_mode';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new WeatherApp();
});