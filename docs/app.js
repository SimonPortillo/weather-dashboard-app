import { fetchWeatherData, geocodeLocation } from './utils/api.js';
import { translations } from './utils/translations.js';

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
        this.currentLang = localStorage.getItem('lang') || 'en';
        this.translations = translations;
        this.initLanguage();
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
        document.querySelector('.lang-toggle').addEventListener('click', () => this.toggleLanguage());
    }

    async handleLocationSearch() {
        const searchText = this.locationInput.value.trim();
        if (!searchText) return;

        try {
            this.setLoading(true);
            const location = await geocodeLocation(searchText);
            await this.fetchAndDisplayWeather(location);
        } catch (error) {
            const errorKey = error.message.includes('Location not found') ? 'location' : 
                           error.message.includes('Network') ? 'network' : error.message;
            this.showError(errorKey);
        } finally {
            this.setLoading(false);
        }
    }

    async useCurrentLocation() {
        if (!navigator.geolocation) {
            this.showError('geolocation');
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
                displayName: this.translations[this.currentLang].currentLocation
            };

            await this.fetchAndDisplayWeather(location);
        } catch (error) {
            this.showError('geoError');
        } finally {
            this.setLoading(false);
        }
    }

    async fetchAndDisplayWeather(location) {
        const weather = await fetchWeatherData(location);
        this.updateWeatherUI(weather, location.displayName);
        this.updateMap(location.lat, location.lon);
        document.querySelector('.content-wrapper').classList.add('visible');
        document.querySelector('.forecast-card').classList.add('visible');
    }

    setLoading(isLoading) {
        const fetchButton = document.getElementById('fetch-weather');
        const searchIcon = '<span class="material-symbols-rounded">travel_explore</span>';
        
        fetchButton.disabled = isLoading;
        fetchButton.innerHTML = isLoading ? 
            `${searchIcon}Loading...` : 
            `${searchIcon}Search`;
    }

    showError(errorKey) {
        const errorDiv = document.getElementById('error-message');
        const errorMessage = this.translations[this.currentLang].error[errorKey] || errorKey;
        
        errorDiv.innerHTML = `
            <span class="material-symbols-rounded" style="color: white; font-size: 24px; 
            vertical-align: middle; margin-right: 0px; margin-bottom: 4px;">error</span>${errorMessage}`;
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

        const t = this.translations[this.currentLang];
        
        // Format values with defaults
        const formattedData = {
            temperature: weather.temperature?.toFixed(1) || 'N/A',
            windSpeed: weather.windSpeed?.toFixed(1) || 'N/A',
            humidity: weather.humidity || 'N/A',
            pressure: weather.pressure || 'N/A',
            rain: weather.rain?.toFixed(1) || '0',
            cloudiness: weather.cloudiness || '0'
        };
        
        const locationIcon = '<span class="material-symbols-rounded">location_on</span>';
        const tempIcon = '<span class="material-symbols-rounded">device_thermostat</span>';
        const windIcon = '<span class="material-symbols-rounded">air</span>';
        const humidityIcon = '<span class="material-symbols-rounded">humidity_percentage</span>';
        const pressureIcon = '<span class="material-symbols-rounded">speed</span>';
        const rainIcon = '<span class="material-symbols-rounded">water_drop</span>';
        const cloudIcon = '<span class="material-symbols-rounded">cloud</span>';

        // Update content with translated labels
        document.getElementById('location-name').innerHTML = `
            ${locationIcon}<span class="location-text">${locationName}</span>
        `;
        document.getElementById('weather-summary').innerHTML = `
            <span class="material-symbols-rounded weather-summary-icon">${this.getWeatherIcon(weather)}</span>
        `;
        document.getElementById('temperature').innerHTML = `${tempIcon}<span>${t.temperature}: ${formattedData.temperature}°C</span>`;
        document.getElementById('wind').innerHTML = `${windIcon}<span>${t.wind}: ${formattedData.windSpeed} m/s</span>`;
        document.getElementById('humidity').innerHTML = `${humidityIcon}<span>${t.humidity}: ${formattedData.humidity}%</span>`;
        document.getElementById('pressure').innerHTML = `${pressureIcon}<span>${t.pressure}: ${formattedData.pressure} hPa</span>`;
        document.getElementById('rain').innerHTML = `${rainIcon}<span>${t.rain}: ${formattedData.rain}mm</span>`;
        document.getElementById('cloudiness').innerHTML = `${cloudIcon}<span>${t.cloudiness}: ${formattedData.cloudiness}%</span>`;

        // Update forecast
        const forecastContainer = document.getElementById('forecast-container');
        forecastContainer.innerHTML = weather.forecast.map(item => {
            const hour = item.time.getHours().toString().padStart(2, '0');
            const icon = this.getWeatherIcon({
                temperature: item.temperature,
                rain: item.precipitation,
                cloudiness: item.cloudiness
            });
            
            return `
                <div class="forecast-item">
                    <span class="time">${hour}:00</span>
                    <span class="material-symbols-rounded">${icon}</span>
                    <span class="temp">${item.temperature.toFixed(1)}°</span>
                </div>
            `;
        }).join('');

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

    initLanguage() {
        document.documentElement.setAttribute('lang', this.currentLang);
        this.updateLanguageUI();
        this.translatePage();
    }

    toggleLanguage() {
        this.currentLang = this.currentLang === 'en' ? 'no' : 'en';
        localStorage.setItem('lang', this.currentLang);
        this.updateLanguageUI();
        this.translatePage();
    }

    updateLanguageUI() {
        const langButton = document.querySelector('.lang-toggle .current-lang');
        langButton.textContent = this.currentLang.toUpperCase();
    }

    translatePage() {
        const t = this.translations[this.currentLang];
        
        // Update static content
        document.title = t.title;
        const logoLink = document.querySelector('h1 .logo-link').outerHTML; // Preserve logo
        document.querySelector('h1').innerHTML = `${logoLink} ${t.title}`; // Add logo back with title
        this.locationInput.placeholder = t.searchPlaceholder;
        document.querySelector('#fetch-weather').innerHTML = 
            `<span class="material-symbols-rounded">travel_explore</span>${t.searchButton}`;
        document.querySelector('#use-current-location').innerHTML = 
            `<span class="material-symbols-rounded">my_location</span>${t.currentLocation}`;
        document.querySelector('.forecast-card h3').textContent = t.forecast;

        // Update location text if it's current location
        const locationText = document.querySelector('.location-text');
        if (locationText && locationText.textContent === 'Current Location') {
            locationText.textContent = t.currentLocation;
        }
        
        // Update footer text
        const footerText = document.querySelector('.footer p');
        footerText.innerHTML = `
            <span class="material-symbols-rounded">fingerprint</span>
            ${t.createdBy} <strong>Simon Portillo</strong>
        `;
        
        // Update weather details if they exist
        if (document.querySelector('.content-wrapper').classList.contains('visible')) {
            this.updateWeatherLabels();
        }
    }

    updateWeatherLabels() {
        const t = this.translations[this.currentLang];
        document.querySelector('#temperature span:last-child').textContent = 
            `${t.temperature}: ${document.querySelector('#temperature span:last-child').textContent.split(': ')[1]}`;
        document.querySelector('#wind span:last-child').textContent = 
            `${t.wind}: ${document.querySelector('#wind span:last-child').textContent.split(': ')[1]}`;
        document.querySelector('#humidity span:last-child').textContent = 
            `${t.humidity}: ${document.querySelector('#humidity span:last-child').textContent.split(': ')[1]}`;
        document.querySelector('#pressure span:last-child').textContent = 
            `${t.pressure}: ${document.querySelector('#pressure span:last-child').textContent.split(': ')[1]}`;
        document.querySelector('#rain span:last-child').textContent = 
            `${t.rain}: ${document.querySelector('#rain span:last-child').textContent.split(': ')[1]}`;
        document.querySelector('#cloudiness span:last-child').textContent = 
            `${t.cloudiness}: ${document.querySelector('#cloudiness span:last-child').textContent.split(': ')[1]}`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new WeatherApp();
});