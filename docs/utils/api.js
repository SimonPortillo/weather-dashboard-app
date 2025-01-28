const NOMINATIM_API = 'https://nominatim.openstreetmap.org/search';

export async function geocodeLocation(searchText) {
    const response = await fetch(`${NOMINATIM_API}?format=json&q=${encodeURIComponent(searchText)}`);
    const data = await response.json();
    if (data.length === 0) throw new Error('Location not found!');
    return {
        lat: data[0].lat,
        lon: data[0].lon,
        displayName: data[0].display_name
    };
}

export const fetchWeatherData = async (location) => {
    const url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?altitude=1&lat=${location.lat}&lon=${location.lon}`;

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'weather-dashboard/1.0'
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        const currentData = data.properties.timeseries[0].data.instant.details;
        const nextHour = data.properties.timeseries[0].data.next_1_hours;
        
        // Get next 24 hours forecast
        const forecast = data.properties.timeseries
            .slice(0, 24)
            .map(entry => ({
                time: new Date(entry.time),
                temperature: entry.data.instant.details.air_temperature,
                precipitation: entry.data.next_1_hours?.details.precipitation_amount || 0,
                cloudiness: entry.data.instant.details.cloud_area_fraction
            }));

        const weather = {
            temperature: currentData.air_temperature,
            windSpeed: currentData.wind_speed,
            humidity: currentData.relative_humidity,
            pressure: currentData.air_pressure_at_sea_level,
            rain: nextHour ? nextHour.details.precipitation_amount : 0,
            cloudiness: currentData.cloud_area_fraction,
            forecast: forecast
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
