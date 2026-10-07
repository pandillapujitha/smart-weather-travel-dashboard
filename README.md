# Skyline: Smart Weather & Travel Dashboard

## 🔗 Live Demo

The project is deployed using GitHub Pages and is available here:

👉 [**Smart Weather & Travel Dashboard – Live Demo**](https://pandillapujitha.github.io/smart-weather-travel-dashboard/)

** A responsive weather dashboard that shows live conditions, a 5-day forecast and weather-based travel suggestions for any city. Built with plain HTML, CSS and Vanilla JavaScript. No backend, no build step.

## Features

- Live weather from the OpenWeatherMap API
- City search, recent searches and "Near me" geolocation
- Current details: temperature, feels like, humidity, wind, pressure, visibility, sunrise and sunset (in the city's local time)
- Weather icons and a 5-day forecast with daily high and low
- Smart travel suggestions: a verdict, things to do and a packing list based on conditions, temperature and wind
- °C / °F toggle (remembered between visits)
- Background sky changes with the weather and time of day
- Loading, empty and error states with clear next steps
- Responsive layout for mobile, tablet and desktop; respects reduced-motion settings

## Project structure

```
weather-dashboard/
├── index.html
├── css/style.css
├── js/script.js
└── README.md
```

## Setup

1. Create a free account at [openweathermap.org](https://openweathermap.org/api) and copy your API key (My API keys). New keys can take up to two hours to activate.
2. Open `js/script.js` and paste your key at the top:
   ```js
   const API_KEY = "YOUR_API_KEY_HERE";
   ```
3. Open `index.html` in a browser, or serve the folder locally:
   ```bash
   python3 -m http.server 8000   # then visit http://localhost:8000
   ```
   Geolocation needs `https://` or `localhost`.

## Deploy to GitHub Pages

1. Create a repository and push these files to the `main` branch.
2. Go to **Settings → Pages**, set the source to **Deploy from a branch**, choose `main` and `/ (root)`, then save.
3. Your site will be live at `https://<username>.github.io/<repo>/`.

## A note on the API key

Because this is a front-end only app, the key is visible in the browser. That is acceptable for a learning project on OpenWeatherMap's free tier, but:

- never commit a paid or sensitive key
- consider regenerating the key if it is abused
- a production app should route requests through a server or proxy

## APIs used

- Current weather: `GET /data/2.5/weather`
- 5 day / 3 hour forecast: `GET /data/2.5/forecast`

## Possible improvements

- Hourly forecast chart
- City autocomplete using the Geocoding API
- Air quality index and UV data
- Offline caching with a service worker

## License

MIT. Free to use for learning and portfolios.
