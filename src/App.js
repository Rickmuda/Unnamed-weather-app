import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [weather, setWeather] = useState(null);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [isEvening, setIsEvening] = useState(false);
  const [image, setImage] = useState(null);

  useEffect(() => {
    const hours = new Date().getHours();
    setIsEvening(hours >= 18); // Check if it's 6 PM or later
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
      setImage(getImage(weather.main.temp));
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
    if (isEvening && temp < 20) {
      return 'https://i.ytimg.com/vi/rXYm8YLrZwU/maxresdefault.jpg'; // avond warm
    } else if (isEvening && temp >= 20) {
      return 'https://i.ytimg.com/vi/0ZRqrphDQWA/maxresdefault.jpg'; // avond koud
    } else if (!isEvening && temp < 20) {
      return 'https://hetweermagazine.nl/sites/default/files/styles/schermbreed/public/field/image/pexels-porapak-apichodilok-348523.jpg?itok=wXGyFdrf'; //dag warm
    } else {
      return 'https://kalmeleon.nl/wp-content/uploads/2023/03/koude-dag.jpg'; //dag koud
    }
  };

  return (
    <div style={{ 
      backgroundColor: isEvening ? '#46425e' : '#ffeecc', 
      height: '100vh', 
      color: isEvening ? '#15788c' : '#ffb0a3',
      WebkitTextStroke: isEvening ? '1px #00b9be' : '1px #ff6973' }}>
      {weather ? (
        <div  className='parent'>

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