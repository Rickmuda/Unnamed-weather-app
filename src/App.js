import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';

// Weather condition to icon mapping
const weatherIcons = {
  Clear: '☀️',
  Clouds: '☁️',
  Rain: '🌧️',
  Drizzle: '🌦️',
  Thunderstorm: '⛈️',
  Snow: '❄️',
  Mist: '🌫️',
  Fog: '🌫️',
  Haze: '🌫️',
  Smoke: '🌫️',
  Dust: '💨',
  Sand: '💨',
  Ash: '🌋',
  Squall: '💨',
  Tornado: '🌪️',
};

// Get theme based on temperature (matches the 2 mascot images)
// Cold/Dark theme for sad mascot (< 18°C)
// Warm/Bright theme for happy mascot (>= 18°C)
const getTheme = (weather) => {
  const temp = weather ? weather.main.temp - 273.15 : 20;

  // Cold/Dark theme - for temperatures below 18°C (sad mascot)
  if (temp < 18) {
    return {
      gradient: 'linear-gradient(135deg, #08001f 0%, #0d1b2a 30%, #1b263b 60%, #2d3a4a 100%)',
      cardBg: 'rgba(255, 255, 255, 0.08)',
      textPrimary: '#15788c',
      textSecondary: 'rgba(21, 120, 140, 0.8)',
      accent: '#00b9be',
      glow: 'rgba(0, 185, 190, 0.3)',
      mode: 'cold'
    };
  }

  // Warm/Bright theme - for temperatures 18°C and above (happy mascot)
  return {
    gradient: 'linear-gradient(135deg, #d5dd90 0%, #e8e4a0 30%, #f5eeb0 60%, #fffacd 100%)',
    cardBg: 'rgba(255, 255, 255, 0.25)',
    textPrimary: '#000000',
    textSecondary: 'rgba(0, 0, 0, 0.7)',
    accent: '#ff6973',
    glow: 'rgba(255, 105, 115, 0.3)',
    mode: 'warm'
  };
};

function App() {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchCity, setSearchCity] = useState('');
  const [locationName, setLocationName] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [theme, setTheme] = useState(getTheme(null));
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [unit, setUnit] = useState('C'); // C or F

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Update theme when weather changes
  useEffect(() => {
    if (weather) {
      setTheme(getTheme(weather));
    }
  }, [weather]);

  // Apply theme to body
  useEffect(() => {
    document.body.style.background = theme.gradient;
    document.body.style.transition = 'background 1s ease';
  }, [theme]);

  // Get geolocation on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
        },
        (err) => {
          setError('Location access denied. Please search for a city.');
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation not supported. Please search for a city.');
      setLoading(false);
    }
  }, []);

  const fetchWeatherByCoords = async (lat, lon) => {
    setLoading(true);
    setError(null);
    const apiKey = process.env.REACT_APP_OPENWEATHERMAP_API_KEY;
    
    try {
      const [weatherRes, forecastRes] = await Promise.all([
        axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`),
        axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&cnt=8`)
      ]);
      
      setWeather(weatherRes.data);
      setForecast(forecastRes.data);
      setLocationName(weatherRes.data.name);
    } catch (err) {
      setError('Failed to fetch weather data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherByCity = async (city) => {
    if (!city.trim()) return;
    
    setLoading(true);
    setError(null);
    const apiKey = process.env.REACT_APP_OPENWEATHERMAP_API_KEY;
    
    try {
      const weatherRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`
      );
      const { lat, lon } = weatherRes.data.coord;
      
      const forecastRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&cnt=8`
      );
      
      setWeather(weatherRes.data);
      setForecast(forecastRes.data);
      setLocationName(weatherRes.data.name);
      setSearchCity('');
    } catch (err) {
      setError('City not found. Please check the spelling and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchWeatherByCity(searchCity);
  };

  const formatTemp = useCallback((kelvin) => {
    const celsius = kelvin - 273.15;
    if (unit === 'F') {
      return `${((celsius * 9/5) + 32).toFixed(0)}°F`;
    }
    return `${celsius.toFixed(0)}°C`;
  }, [unit]);

  const formatTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getWindDirection = (deg) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return directions[Math.round(deg / 45) % 8];
  };

  const getImage = (temp) => {
    const tempInCelsius = temp - 273.15;
    return tempInCelsius < 18 
      ? require('./images/sad-weather-app.png')
      : require('./images/happy-weather-app.png');
  };

  return (
    <div className={`app ${theme.mode}`} style={{ '--glow-color': theme.glow }}>
      {/* Animated background particles */}
      <div className="particles">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="particle" style={{
            '--delay': `${Math.random() * 5}s`,
            '--duration': `${15 + Math.random() * 10}s`,
            '--x-start': `${Math.random() * 100}%`,
            '--x-end': `${Math.random() * 100}%`,
            '--size': `${2 + Math.random() * 4}px`
          }} />
        ))}
      </div>

      {/* Header with search */}
      <header className="header">
        <div className="logo">
          <span className="logo-icon">🌤️</span>
          <span className="logo-text">WeatherVibe</span>
        </div>
        
        <form className={`search-form ${isSearchFocused ? 'focused' : ''}`} onSubmit={handleSearch}>
          <div className="search-container">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search city..."
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="search-input"
            />
            {searchCity && (
              <button type="button" className="clear-btn" onClick={() => setSearchCity('')}>
                ✕
              </button>
            )}
          </div>
          <button type="submit" className="search-btn">
            Search
          </button>
        </form>

        <button 
          className="unit-toggle"
          onClick={() => setUnit(u => u === 'C' ? 'F' : 'C')}
          aria-label="Toggle temperature unit"
        >
          °{unit === 'C' ? 'F' : 'C'}
        </button>
      </header>

      <main className="main-content">
        {loading ? (
          <div className="loading-container">
            <div className="loading-card glass-card">
              <div className="skeleton skeleton-city"></div>
              <div className="skeleton skeleton-temp"></div>
              <div className="skeleton skeleton-icon"></div>
              <div className="skeleton-row">
                <div className="skeleton skeleton-detail"></div>
                <div className="skeleton skeleton-detail"></div>
                <div className="skeleton skeleton-detail"></div>
              </div>
            </div>
            <p className="loading-text">
              <span className="loading-dot">.</span>
              <span className="loading-dot">.</span>
              <span className="loading-dot">.</span>
              Fetching your weather
            </p>
          </div>
        ) : error ? (
          <div className="error-container glass-card">
            <div className="error-icon">🌧️</div>
            <h2 className="error-title">Oops!</h2>
            <p className="error-message">{error}</p>
            <button 
              className="retry-btn"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        ) : weather ? (
          <>
            {/* Main weather card */}
            <div className="weather-card glass-card">
              <div className="weather-header">
                <div className="location-info">
                  <h1 className="city-name">
                    <span className="location-pin">📍</span>
                    {weather.name}, {weather.sys.country}
                  </h1>
                  <p className="current-time">
                    {currentTime.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>

              <div className="weather-main">
                <div className="temp-section">
                  <div className="main-temp">{formatTemp(weather.main.temp)}</div>
                  <div className="feels-like">
                    Feels like {formatTemp(weather.main.feels_like)}
                  </div>
                  <div className="condition">
                    <span className="condition-icon">
                      {weatherIcons[weather.weather[0].main] || '🌡️'}
                    </span>
                    <span className="condition-text">
                      {weather.weather[0].description}
                    </span>
                  </div>
                </div>

                <div className="mascot-section">
                  <img 
                    src={getImage(weather.main.temp)} 
                    alt="Weather mascot" 
                    className="mascot-img"
                  />
                </div>
              </div>

              <div className="weather-details">
                <div className="detail-item">
                  <span className="detail-icon">💧</span>
                  <span className="detail-value">{weather.main.humidity}%</span>
                  <span className="detail-label">Humidity</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">💨</span>
                  <span className="detail-value">
                    {(weather.wind.speed * 3.6).toFixed(1)} km/h
                  </span>
                  <span className="detail-label">Wind {getWindDirection(weather.wind.deg)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">👁️</span>
                  <span className="detail-value">
                    {(weather.visibility / 1000).toFixed(1)} km
                  </span>
                  <span className="detail-label">Visibility</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">🌡️</span>
                  <span className="detail-value">{weather.main.pressure} hPa</span>
                  <span className="detail-label">Pressure</span>
                </div>
              </div>
            </div>

            {/* Sun times card */}
            <div className="sun-card glass-card">
              <div className="sun-item">
                <span className="sun-icon">🌅</span>
                <span className="sun-label">Sunrise</span>
                <span className="sun-time">{formatTime(weather.sys.sunrise)}</span>
              </div>
              <div className="sun-divider"></div>
              <div className="sun-item">
                <span className="sun-icon">🌇</span>
                <span className="sun-label">Sunset</span>
                <span className="sun-time">{formatTime(weather.sys.sunset)}</span>
              </div>
            </div>

            {/* Forecast section */}
            {forecast && (
              <div className="forecast-section">
                <h2 className="section-title">Next Hours</h2>
                <div className="forecast-cards">
                  {forecast.list.slice(0, 6).map((item, index) => (
                    <div key={index} className="forecast-card glass-card">
                      <span className="forecast-time">
                        {new Date(item.dt * 1000).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          hour12: true
                        })}
                      </span>
                      <span className="forecast-icon">
                        {weatherIcons[item.weather[0].main] || '🌡️'}
                      </span>
                      <span className="forecast-temp">{formatTemp(item.main.temp)}</span>
                      <span className="forecast-condition">{item.weather[0].main}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Temperature range card */}
            <div className="temp-range-card glass-card">
              <div className="temp-range-item">
                <span className="range-icon">🔺</span>
                <span className="range-label">High</span>
                <span className="range-value">{formatTemp(weather.main.temp_max)}</span>
              </div>
              <div className="temp-range-bar">
                <div 
                  className="temp-range-fill"
                  style={{
                    '--fill-percent': `${Math.min(100, Math.max(0, ((weather.main.temp - 273.15 + 20) / 60) * 100))}%`
                  }}
                ></div>
              </div>
              <div className="temp-range-item">
                <span className="range-icon">🔻</span>
                <span className="range-label">Low</span>
                <span className="range-value">{formatTemp(weather.main.temp_min)}</span>
              </div>
            </div>
          </>
        ) : null}
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>Data from OpenWeatherMap • Made with ❤️</p>
      </footer>
    </div>
  );
}

export default App;
