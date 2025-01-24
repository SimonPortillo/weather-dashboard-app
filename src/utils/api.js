const NOMINATIM_API = 'https://nominatim.openstreetmap.org/search';

export async function geocodeLocation(searchText) {
    const response = await fetch(`${NOMINATIM_API}?format=json&q=${encodeURIComponent(searchText)}`);
    const data = await response.json();
    if (data.length === 0) throw new Error('Location not found');
    return {
        lat: data[0].lat,
        lon: data[0].lon,
        displayName: data[0].display_name
    };
}

export const fetchWeatherData = async (location) => {
    const url = `https://api.met.no/weatherapi/locationforecast/2.0/mini?altitude=1&lat=${location.lat}&lon=${location.lon}`;

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'YourAppName/1.0 (your.email@example.com)' // Replace with your app name and email
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        const weather = {
            temperature: data.properties.timeseries[0].data.instant.details.air_temperature,
            rain: data.properties.timeseries[0].data.next_1_hours ? data.properties.timeseries[0].data.next_1_hours.details.precipitation_amount : 0,
            cloudiness: data.properties.timeseries[0].data.instant.details.cloud_area_fraction
        };

        return weather;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        throw error;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const weatherContainer = document.getElementById('weather-info');
    const fetchButton = document.getElementById('fetch-weather');

    fetchButton.addEventListener('click', () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const location = {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                };
                fetchWeatherData(location).then(weather => {
                    updateWeatherUI(weather);
                }).catch(error => {
                    console.error('Error fetching weather data:', error);
                });
            }, error => {
                console.error('Error getting location:', error);
            });
        } else {
            console.error('Geolocation is not supported by this browser.');
        }
    });
});

function updateWeatherUI(weather) {
    const temperature = weather.temperature;
    const rain = weather.rain;
    const cloudiness = weather.cloudiness;

    document.getElementById('temperature').textContent = `Temperature: ${temperature} °C`;
    document.getElementById('rain').textContent = `Rain: ${rain} mm`;
    document.getElementById('cloudiness').textContent = `Cloudiness: ${cloudiness} %`;
}
