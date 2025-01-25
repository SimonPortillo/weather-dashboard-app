# Weather Dashboard

A modern weather dashboard that combines data from MET Norway with Windy's visualization capabilities.
![image](https://github.com/user-attachments/assets/1796369c-8e37-4eba-887c-12a40a218f16)

## Live Demo
[View Demo](https://simonportillo.github.io/weather-dashboard-app/)

## Features
- Real-time weather data
- Interactive wind, temperature, and pressure visualizations
- 24-hour forecast
- Dark/Light theme
- Multi-language support (English/Norwegian)
- Responsive design

## Setup

1. Clone the repository:
```bash
git clone https://github.com/SimonPortillo/weather-dashboard-app.git
cd weather-dashboard-app
```

2. Set up Windy API:
   - Sign up for a Windy API key at [https://api.windy.com/](https://api.windy.com/)
   - Copy `docs/config.example.js` to `docs/config.js`
   - Add your Windy API key to `config.js`:
```javascript
export const config = {
    windyApiKey: 'your_api_key_here'
};
```

3. Serve the application:
   - Use a local server (e.g., Live Server in VS Code)
   - Or use Python: `python -m http.server`
   - Open `http://localhost:8000` in your browser

## Weather Data Sources
- Weather data: [MET Norway Weather API](https://api.met.no/)
- Map visualization: [Windy API](https://api.windy.com/)
- Geocoding: OpenStreetMap Nominatim

## Windy API Features
The dashboard uses Windy's advanced visualization features:
- Wind patterns with particle animation
- Temperature distribution
- Pressure systems
- Multiple altitude levels for wind data
- Interactive timeline
- Distance measurement tools

## Notes
- The Windy API key must be kept private
- The free tier of Windy API has usage limits
- `config.js` is gitignored to protect your API key

## Development
- `config.example.js` provides a template for the API configuration
- The Windy map settings can be customized in `app.js`
- Style customization available in `style.css`

## License
MIT License - See LICENSE file for details

## Developer

Created by [Simon Portillo](https://github.com/SimonPortillo)
