/* ==========================================================
   Smart Weather & Travel Dashboard
   Vanilla JS + OpenWeatherMap
   Current Weather + 5 Day Forecast
   ========================================================== */

// ==========================================================
// 1. OPENWEATHERMAP API KEY
// ==========================================================

const API_KEY = "11db3763a24ff3a9d66043c9210b8ea7";

const BASE = "https://api.openweathermap.org/data/2.5";

const ICON = (code) =>
  `https://openweathermap.org/img/wn/${code}@2x.png`;


// ==========================================================
// 2. DOM ELEMENTS
// ==========================================================

const $ = (id) => document.getElementById(id);

const els = {
  form: $("searchForm"),
  input: $("cityInput"),
  locate: $("locateBtn"),
  status: $("status"),
  dashboard: $("dashboard"),
  recent: $("recent")
};


// ==========================================================
// 3. GLOBAL VARIABLES
// ==========================================================

let unit = localStorage.getItem("unit") || "metric";

let data = null;


// ==========================================================
// 4. UNIT HELPERS
// ==========================================================

const temp = (c) =>
  unit === "metric"
    ? `${Math.round(c)}°C`
    : `${Math.round((c * 9) / 5 + 32)}°F`;

const speed = (ms) =>
  unit === "metric"
    ? `${Math.round(ms * 3.6)} km/h`
    : `${Math.round(ms * 2.237)} mph`;

const dist = (m) =>
  unit === "metric"
    ? `${(m / 1000).toFixed(1)} km`
    : `${(m / 1609.34).toFixed(1)} mi`;


// ==========================================================
// 5. STATUS PANEL
// ==========================================================

function showStatus(type, title, message = "") {

  els.dashboard.hidden = true;

  els.status.hidden = false;

  els.status.className = `status ${type}`;

  els.status.innerHTML =
    (type === "loading"
      ? '<div class="spinner"></div>'
      : "") +
    `<h2>${title}</h2><p>${message}</p>`;
}

const hideStatus = () => {
  els.status.hidden = true;
};


// ==========================================================
// 6. API REQUEST
// ==========================================================

async function getJSON(path, query) {

  // Check whether API key exists
  if (!API_KEY || API_KEY === "YOUR_API_KEY") {
    throw new Error(
      "Add your OpenWeatherMap API key in js/script.js to get started."
    );
  }

  let res;

  try {

    const url =
      `${BASE}/${path}?${query}` +
      `&units=metric&appid=${encodeURIComponent(API_KEY)}`;

    res = await fetch(url);

  } catch (error) {

    throw new Error(
      "Can't reach the weather service. Check your internet connection and try again."
    );
  }


  // Handle API errors

  if (res.status === 404) {

    throw new Error(
      "City not found. Check the spelling or try adding a country code, like Paris,FR."
    );

  }


  if (res.status === 401) {

    throw new Error(
      "The OpenWeatherMap API key was rejected. Make sure the key is active and correct."
    );

  }


  if (res.status === 429) {

    throw new Error(
      "Too many requests. Please wait a minute and try again."
    );

  }


  if (!res.ok) {

    throw new Error(
      "Something went wrong with the weather service. Please try again shortly."
    );

  }


  return res.json();
}


// ==========================================================
// 7. LOAD WEATHER
// ==========================================================

async function load(query, label) {

  showStatus(
    "loading",
    "Loading weather",
    label || "Fetching the latest conditions..."
  );

  try {

    const [current, forecast] = await Promise.all([

      getJSON("weather", query),

      getJSON("forecast", query)

    ]);

    data = {
      current,
      forecast
    };

    saveRecent(current.name);

    render();

  } catch (err) {

    console.error("Weather API Error:", err);

    showStatus(
      "error",
      "Couldn't load the weather",
      err.message
    );
  }
}


// ==========================================================
// 8. WEATHER SKY TYPE
// ==========================================================

function skyFor(w, isNight) {

  const id = w.id;

  if (id >= 200 && id < 300) return "storm";

  if (id >= 300 && id < 600) return "rain";

  if (id >= 600 && id < 700) return "snow";

  if (id >= 700 && id < 800) return "mist";

  if (isNight) return "night";

  return id === 800 ? "clear" : "clouds";
}


// ==========================================================
// 9. CITY TIME
// ==========================================================

function cityTime(c) {

  return (secs) => {

    return new Date(
      (secs + c.timezone) * 1000
    ).toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC"
      }
    );

  };
}


// ==========================================================
// 10. RENDER CURRENT WEATHER
// ==========================================================

function render() {

  const c = data.current;

  const w = c.weather[0];

  const t = cityTime(c);

  const nowLocal =
    Math.floor(Date.now() / 1000);

  const isNight =
    w.icon.endsWith("n");


  // Background weather type

  document.body.dataset.sky =
    skyFor(w, isNight);


  // City

  $("cityName").textContent =
    `${c.name}, ${c.sys.country}`;


  // Local time

  $("localTime").textContent =
    `Local time ${t(nowLocal)}`;


  // Temperature

  $("temp").textContent =
    temp(c.main.temp);


  // Description

  $("desc").textContent =
    w.description;


  // Feels like / High / Low

  $("feels").textContent =
    `Feels like ${temp(c.main.feels_like)} · ` +
    `High ${temp(c.main.temp_max)} · ` +
    `Low ${temp(c.main.temp_min)}`;


  // Weather icon

  const icon = $("heroIcon");

  icon.src = ICON(w.icon);

  icon.alt = w.description;


  // Weather details

  $("humidity").textContent =
    `${c.main.humidity}%`;

  $("wind").textContent =
    speed(c.wind.speed);

  $("pressure").textContent =
    `${c.main.pressure} hPa`;

  $("visibility").textContent =
    dist(c.visibility ?? 10000);

  $("sunrise").textContent =
    t(c.sys.sunrise);

  $("sunset").textContent =
    t(c.sys.sunset);


  // Travel suggestions

  renderTravel(c);


  // Forecast

  renderForecast(data.forecast);


  // Show dashboard

  hideStatus();

  els.dashboard.hidden = false;

  els.dashboard.classList.remove("reveal");

  void els.dashboard.offsetWidth;

  els.dashboard.classList.add("reveal");
}


// ==========================================================
// 11. 5-DAY FORECAST
// ==========================================================

function renderForecast(f) {

  const byDay = {};


  f.list.forEach((item) => {

    const d =
      new Date(
        (item.dt + f.city.timezone) * 1000
      );

    const key =
      d.toISOString().slice(0, 10);


    (byDay[key] ||= {
      date: d,
      items: []
    }).items.push(item);

  });


  const today =
    new Date(
      (Date.now() / 1000 + f.city.timezone) * 1000
    )
      .toISOString()
      .slice(0, 10);


  const days =
    Object.entries(byDay)
      .filter(([key]) => key !== today)
      .slice(0, 5);


  $("forecast").innerHTML =
    days
      .map(([, day]) => {

        const hi =
          Math.max(
            ...day.items.map(
              (i) => i.main.temp_max
            )
          );


        const lo =
          Math.min(
            ...day.items.map(
              (i) => i.main.temp_min
            )
          );


        // Find forecast closest to midday

        const mid =
          day.items.reduce((a, b) => {

            const aHour =
              new Date(
                (a.dt + f.city.timezone) * 1000
              )
                .getUTCHours();

            const bHour =
              new Date(
                (b.dt + f.city.timezone) * 1000
              )
                .getUTCHours();


            return Math.abs(bHour - 12) <
              Math.abs(aHour - 12)
              ? b
              : a;

          });


        const name =
          day.date.toLocaleDateString(
            [],
            {
              weekday: "short",
              timeZone: "UTC"
            }
          );


        return `
          <article class="day">

            <h3>${name}</h3>

            <img
              src="${ICON(
                mid.weather[0].icon.replace("n", "d")
              )}"
              alt="${mid.weather[0].description}"
              loading="lazy"
            >

            <p class="hi">${temp(hi)}</p>

            <p class="lo">${temp(lo)}</p>

            <p class="cond">
              ${mid.weather[0].description}
            </p>

          </article>
        `;

      })
      .join("");
}


// ==========================================================
// 12. SMART TRAVEL SUGGESTIONS
// ==========================================================

function renderTravel(c) {

  const t = c.main.temp;

  const id = c.weather[0].id;

  const wind = c.wind.speed;


  const rain =
    id >= 300 && id < 600;

  const storm =
    id >= 200 && id < 300;

  const snow =
    id >= 600 && id < 700;

  const mist =
    id >= 700 && id < 800;

  const clear =
    id === 800;


  let verdict;

  let acts = [];

  let pack = [];


  // Thunderstorm

  if (storm) {

    verdict =
      "Stay flexible today. Thunderstorms make outdoor plans risky.";

    acts = [
      "Visit a museum or gallery",
      "Try a local café or cooking class",
      "Catch a film or browse indoor markets"
    ];

    pack = [
      "Waterproof jacket",
      "Power bank",
      "Offline maps"
    ];

  }


  // Snow

  else if (snow) {

    verdict =
      "Snowy conditions: great for winter fun, tricky for long drives.";

    acts = [
      "Go skiing, sledding or build a snowman",
      "Warm up with hot chocolate in town",
      "Take photos of snow-covered landmarks"
    ];

    pack = [
      "Insulated waterproof boots",
      "Thermal layers",
      "Gloves and hat"
    ];

  }


  // Rain

  else if (rain) {

    verdict =
      "Rain is on the way. Plan for covered activities.";

    acts = [
      "Explore museums and covered arcades",
      "Spend an afternoon at a spa or café",
      "Do a food tour indoors"
    ];

    pack = [
      "Umbrella",
      "Water-resistant shoes",
      "Light rain jacket"
    ];

  }


  // Mist

  else if (mist) {

    verdict =
      "Low visibility. Fine for the city, not for viewpoints.";

    acts = [
      "Wander old-town streets and markets",
      "Visit indoor attractions",
      "Save scenic viewpoints for a clearer day"
    ];

    pack = [
      "Light layers",
      "Reflective item if walking at dusk"
    ];

  }


  // Very hot

  else if (t >= 32) {

    verdict =
      "Very hot. Keep outdoor plans to early morning or evening.";

    acts = [
      "Swim at a beach or pool",
      "Visit air-conditioned attractions at midday",
      "Enjoy a sunset stroll"
    ];

    pack = [
      "Sunscreen SPF 50",
      "Reusable water bottle",
      "Hat and sunglasses",
      "Breathable clothing"
    ];

  }


  // Clear and comfortable

  else if (t >= 22 && clear) {

    verdict =
      "Excellent weather for being outside. Make the most of it.";

    acts = [
      "Hike or cycle a scenic route",
      "Have a picnic or beach day",
      "Join an open-air tour or festival"
    ];

    pack = [
      "Sunscreen",
      "Sunglasses",
      "Light clothing",
      "Water bottle"
    ];

  }


  // Comfortable

  else if (t >= 12) {

    verdict =
      "Comfortable for sightseeing, with a layer for later.";

    acts = [
      "Walk a city or old-town route",
      "Visit parks and gardens",
      "Sit at an outdoor café"
    ];

    pack = [
      "Light jacket",
      "Comfortable walking shoes"
    ];

  }


  // Chilly

  else if (t >= 2) {

    verdict =
      "Chilly. Good for cosy indoor stops between outdoor sights.";

    acts = [
      "Mix short walks with museum visits",
      "Try local hot food and drinks",
      "Visit a historic site"
    ];

    pack = [
      "Warm coat",
      "Scarf and gloves",
      "Closed shoes"
    ];

  }


  // Freezing

  else {

    verdict =
      "Freezing. Limit time outside and dress in layers.";

    acts = [
      "Visit indoor attractions",
      "Book a thermal bath or sauna",
      "Keep outdoor stops short"
    ];

    pack = [
      "Heavy winter coat",
      "Thermal base layer",
      "Hat, gloves and scarf"
    ];

  }


  // Wind warning

  if (wind >= 10 && !storm) {

    acts.push(
      "Skip boat trips and high viewpoints, as it is windy"
    );

    pack.push(
      "Windproof outer layer"
    );

  }


  // Humidity

  if (c.main.humidity >= 80 && t >= 24) {

    pack.push(
      "Moisture-wicking clothes (it's humid)"
    );

  }


  $("verdict").textContent =
    verdict;

  $("activities").innerHTML =
    acts
      .map((a) => `<li>${a}</li>`)
      .join("");

  $("packing").innerHTML =
    pack
      .map((p) => `<li>${p}</li>`)
      .join("");
}


// ==========================================================
// 13. RECENT SEARCHES
// ==========================================================

function saveRecent(name) {

  let list =
    JSON.parse(
      localStorage.getItem("recent") || "[]"
    )
      .filter((n) => n !== name);


  list.unshift(name);


  localStorage.setItem(
    "recent",
    JSON.stringify(list.slice(0, 5))
  );


  renderRecent();
}


function renderRecent() {

  const list =
    JSON.parse(
      localStorage.getItem("recent") || "[]"
    );


  els.recent.innerHTML =
    list
      .map(
        (n) =>
          `<button type="button" class="chip">${n}</button>`
      )
      .join("");
}


// ==========================================================
// 14. SEARCH EVENT
// ==========================================================

if (els.form) {

  els.form.addEventListener(
    "submit",
    (e) => {

      e.preventDefault();

      const city =
        els.input.value.trim();


      if (city) {

        load(
          `q=${encodeURIComponent(city)}`,
          `Looking up ${city}...`
        );

      }

    }
  );

}


// ==========================================================
// 15. RECENT SEARCH CLICK
// ==========================================================

if (els.recent) {

  els.recent.addEventListener(
    "click",
    (e) => {

      if (
        e.target.classList.contains("chip")
      ) {

        els.input.value =
          e.target.textContent;

        load(
          `q=${encodeURIComponent(
            e.target.textContent
          )}`
        );

      }

    }
  );

}


// ==========================================================
// 16. USE MY LOCATION
// ==========================================================

if (els.locate) {

  els.locate.addEventListener(
    "click",
    () => {

      if (!navigator.geolocation) {

        return showStatus(
          "error",
          "Location not supported",
          "Your browser can't share your location. Search for a city instead."
        );

      }


      showStatus(
        "loading",
        "Finding your location",
        "Allow location access when your browser asks."
      );


      navigator.geolocation.getCurrentPosition(

        (p) => {

          load(
            `lat=${p.coords.latitude}&lon=${p.coords.longitude}`
          );

        },

        () => {

          showStatus(
            "error",
            "Location blocked",
            "Allow location access in your browser settings, or search for a city."
          );

        }

      );

    }
  );

}


// ==========================================================
// 17. °C / °F UNIT SWITCH
// ==========================================================

const unitControl =
  document.querySelector(".unit");


if (unitControl) {

  unitControl.addEventListener(
    "click",
    (e) => {

      const btn =
        e.target.closest(
          "button[data-unit]"
        );


      if (!btn) return;


      unit =
        btn.dataset.unit;


      localStorage.setItem(
        "unit",
        unit
      );


      document
        .querySelectorAll(
          ".unit button"
        )
        .forEach(
          (b) =>
            b.classList.toggle(
              "active",
              b === btn
            )
        );


      if (data) {

        render();

      }

    }
  );

}


// ==========================================================
// 18. INITIALIZE APPLICATION
// ==========================================================

document
  .querySelectorAll(".unit button")
  .forEach(
    (b) =>
      b.classList.toggle(
        "active",
        b.dataset.unit === unit
      )
  );


renderRecent();


const last =
  JSON.parse(
    localStorage.getItem("recent") || "[]"
  )[0];


if (last) {

  load(
    `q=${encodeURIComponent(last)}`
  );

} else {

  showStatus(
    "empty",
    "Where to next?",
    "Search for a city to see live weather, a 5-day forecast and travel tips."
  );

}
