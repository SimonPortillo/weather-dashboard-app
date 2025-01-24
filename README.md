# Weather Dashboard

This project is a simple weather dashboard that utilizes the Yr API to display current weather information such as temperature, rain, and cloudiness.

## Project Structure

```
weather-dashboard
├── src
│   ├── app.js          # Main JavaScript file for fetching and displaying weather data
│   ├── index.html      # Main HTML file for the weather dashboard
│   ├── style.css       # CSS file for styling the dashboard
│   └── utils
│       └── api.js      # Utility functions for interacting with the Yr API
├── package.json        # Configuration file for npm
└── README.md           # Documentation for the project
```

## Getting Started

To set up the project locally, follow these steps:

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd weather-dashboard
   ```

2. **Install dependencies:**
   ```
   npm install
   ```

3. **Open the `index.html` file in your browser to view the dashboard.**

## Usage

The weather dashboard fetches data from the Yr API based on the user's location. It displays:

- Current temperature
- Rain status
- Cloudiness

## API Information

The project uses the Yr API to retrieve weather data. Ensure you have access to the API and follow their documentation for any specific requirements or limitations.

## License

This project is licensed under the MIT License.