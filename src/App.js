import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [weather, setWeather] = useState(null);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [isEvening, setIsEvening] = useState(false);
  const [image, setImage] = useState(null);
  const [textColor, setTextColor] = useState('#ffb0a3');
  const [textStroke, setTextStroke] = useState('1px #ff6973');

  useEffect(() => {
    const hours = new Date().getHours();
    setIsEvening(hours >= 18);
  }, []);

  useEffect(() => {
    if (latitude && longitude) {
      fetchWeather(latitude, longitude);
    }
  }, [latitude, longitude]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      position => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
      },
      error => {
        console.error("Error getting geolocation: ", error);
      }
    );
  }, []);

  useEffect(() => {
    if (weather) {
      const tempInKelvin = weather.main.temp;
      setImage(getImage(tempInKelvin));
      updateBackgroundColor(tempInKelvin);
    }
  }, [weather]);

  const fetchWeather = async (lat, lon) => {
    const apiKey = process.env.REACT_APP_OPENWEATHERMAP_API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    try {
      const response = await axios.get(url);
      setWeather(response.data);
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  };

  const getImage = (temp) => {
    const tempInCelsius = temp - 273.15;
    return tempInCelsius < 18 
        ? require('./images/sad-weather-app.png') // Below 20°C
        : require('./images/happy-weather-app.png'); // Above 20°C
  };

  const updateBackgroundColor = (temp) => {
    const tempInCelsius = temp - 273.15;
    const backgroundColor = tempInCelsius <   18 ? "#08001f" : "#d5dd90";
    
    // Update text color and stroke based on temperature
    if (tempInCelsius < 18) {
      setTextColor('#15788c'); // Light color for cold
      setTextStroke('1px #00b9be');
    } else {
      setTextColor('#ffb0a3'); // Dark color for warm
      setTextStroke('1px #ff6973');
    }

    // Apply the background color
    document.body.style.backgroundColor = backgroundColor;
  };

  return (
    <div style={{ 
      height: '100vh', 
      color: textColor,
      WebkitTextStroke: textStroke,
      transition: 'color 0.5s, background-color 0.5s' // Smooth transitions
    }}>
      {weather ? (
        <div className='parent'>
          <div className='city'>
            <h1>{weather.name}</h1>
          </div>
          <div className='temp'> 
            <p>{(weather.main.temp - 273.15).toFixed(2)}°C</p>
          </div>
          <div className='img'>
            {image && <img src={image} alt="Weather" />}
          </div>
        </div>
      ) : (
        <p>Loading weather data...</p>
      )}
    </div>
  );
}

export default App;
