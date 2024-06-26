/* eslint-disable no-alert */
document.addEventListener('DOMContentLoaded', function () {
  // console.log('JavaScript is loaded and working!');
  // Loading spinner
  function showLoadingSpinner () {
    $('#loading-spinner').show();
  }

  function hideLoadingSpinner () {
    $('#loading-spinner').hide();
  }

  // Function to get weather data using coordinates
  function getWeatherByCoords (lat, lon) {
    showLoadingSpinner();
    $.ajax({
      url: '/get_weather_by_coords',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        latitude: lat,
        longitude: lon
      }),
      success: function (data) {
        hideLoadingSpinner();
        if (data.error) {
          alert('Error fetching weather data: ' + data.error);
        } else {
          displayWeatherData(data);
          getForecastByCoords(lat, lon);
        }
      },
      error: function (error) {
        hideLoadingSpinner();
        console.error('Error:', error);
        alert('Error fetching weather data. Please try again.');
      }
    });
  }

  // Function to get forecast data using coordinates
  function getForecastByCoords (lat, lon) {
    showLoadingSpinner();
    $.ajax({
      url: '/forecast',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        lat,
        lon
      }),
      success: function (data) {
        hideLoadingSpinner();
        if (data.error) {
          alert('Error fetching forecast data: ' + data.error);
        } else {
          displayForecastData(data);
        }
      },
      error: function (error) {
        hideLoadingSpinner();
        console.error('Error:', error);
        alert('Error fetching forecast data. Please try again.');
      }
    });
  }

  // function to capitalise the first letter of each word in a string
  // using the replace method with regex (regular expression)
  // The function takes a string and uses the replace method to pass the
  // regex matched characters to the callback function, toUpperCase().
  // \b: Word Boundary - Matches a word boundary position between a word
  // character and non-word character or position (start / end of string)
  // [a-zA-Z0-9_]: - Matches any word character (alphanumeric & underscore).
  function capitaliseWords (str) {
    return str.replace(/\b[a-zA-Z]/g, function (char) {
      return char.toUpperCase();
    });
  }

  // Function to display weather data
  function displayWeatherData (data) {
    // console.log(data);
    const iconCode = data.weather[0].icon;
    const icon = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
    const date = new Date(data.dt * 1000); // convert timestamp (unix) into date object (seconds since the epoch)
    const dateString = date.toLocaleDateString('en-Us', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    const sunriseTime = new Date(data.sys.sunrise * 1000);
    const sunsetTime = new Date(data.sys.sunset * 1000);
    const sunrise = sunriseTime.toLocaleTimeString('en-Us', { hour: '2-digit', minute: '2-digit' });
    const sunset = sunsetTime.toLocaleTimeString('en-Us', { hour: '2-digit', minute: '2-digit' });
    const weatherInfo = `
        <div class="text-center forecast-item-current">
            <img id="weather-icon" alt="${data.weather[0].description}" src="${icon}">
            <p><strong>${data.name}, ${data.sys.country}</strong></p>
            <p>${dateString}</p>
            <h1 class="be-vietnam-pro-thin">${Math.floor(data.main.temp)}&deg;</h1>
            <p>${capitaliseWords(data.weather[0].description)}<p>
            <p>H:${Math.floor(data.main.temp_max)}&deg; L:${Math.floor(data.main.temp_min)}&deg;</p>
            <p></p>
            <p class="mt-3"><strong>Feels like: ${Math.floor(data.main.feels_like)}&deg;</strong></p>
            <div class="mt-3 pad-bottom">
                <p>Humidity: ${Math.floor(data.main.humidity)}%</p>
                <p>Wind Speed: ${Math.floor(data.wind.speed)} m/s</p>
                <p>Sunrise: ${sunrise} - Sunset: ${sunset}</p>
            </div>
        </div>`;
    $('#weather-info').html(weatherInfo);
  }

  // Function to display forecast data
  function displayForecastData (data) {
    let hourlyForecastInfo = '<p class="text-left">24-Hours, 3-Hour Interval Forecast</p>';
    let forecastInfo = '<p class="text-left">5-Day Forecast</p>';
    const today = new Date();
    today.setDate(today.getDate()); // get today's date

    // Filter forecast data for the next five days and hourly data for tomorrow
    const dailyForecastData = data.list.filter(item => {
      const date = new Date(item.dt_txt);
      return date.getHours() === 12 && date.getDate() !== today.getDate(); // filter 12 noon data for the next five days except today
    });

    // Get the first 8 items for today's hourly forecast
    const hourlyForecastData = data.list.slice(0, 8);

    // Display hourly forecast for today
    hourlyForecastInfo += '<div class="scrollable-horizontal">';
    hourlyForecastData.forEach(item => {
      const date = new Date(item.dt_txt);
      const iconCode = item.weather[0].icon;
      const icon = `https://openweathermap.org/img/wn/${iconCode}.png`
      const dateString = date.toLocaleDateString('en-US', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
      hourlyForecastInfo += `
            <div class="forecast-item">
                <p class="text-center">${dateString}</p>
                <img src="${icon}" alt="${item.weather[0].description}">
                <p class="text-center">${Math.floor(item.main.temp)}&deg;</p>
                <p class="text-center">${capitaliseWords(item.weather[0].description)}</p>
            </div>`;
    });
    hourlyForecastInfo += '</div>';

    // Display daily forecast for the next five days
    forecastInfo += '<div class="scrollable-horizontal">'
    dailyForecastData.forEach(item => {
      const date = new Date(item.dt_txt);
      const iconCode = item.weather[0].icon;
      const icon = `https://openweathermap.org/img/wn/${iconCode}.png`
      const dateString = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
      forecastInfo += `
        <div class="forecast-item">
            <p class="text-center">${dateString}</p>
            <img src="${icon}" alt="${item.weather[0].description}">
            <p class="text-center">${Math.floor(item.main.temp)}&deg;</p>
            <p class="text-center">${capitaliseWords(item.weather[0].description)}</p>
        </div>`;
    });
    $('#forecast-info').html(hourlyForecastInfo + forecastInfo);
  }

  // Function to handle geolocation success
  function showPosition (position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    getWeatherByCoords(lat, lon);
  }

  // Function to handle geolocation error
  function showError (error) {
    hideLoadingSpinner();
    switch (error.code) {
      case error.PERMISSION_DENIED:
        alert('User denied the request for Geolocation.');
        break;
      case error.POSITION_UNAVAILABLE:
        alert('Cannot determine location.');
        break;
      case error.TIMEOUT:
        alert('The request to get user location timed out.');
        break;
      case error.UNKNOWN_ERROR:
        alert('An unknown error occured.');
        break;
    }
  }

  // Check if geolocation is supported by the browser
  if (navigator.geolocation) {
    // Request geolocation
    navigator.geolocation.getCurrentPosition(showPosition, showError);
  } else {
    alert('Geolocation is not supported by this browser.');
  }

  // Handle form on submission
  $('form').on('submit', function (event) {
    event.preventDefault();
    showLoadingSpinner();
    const city = $('input[name="city"]').val();
    // console.log(city);
    if (city) {
      $.ajax({
        url: '/search',
        type: 'POST',
        data: { city },
        success: function (data) {
          hideLoadingSpinner();
          if (data.error) {
            alert('Encountered an error: ' + data.error);
          } else {
            displayWeatherData(data);
            const lat = data.coord.lat;
            const lon = data.coord.lon;
            getForecastByCoords(lat, lon);
          }
        },
        error: function (error) {
          hideLoadingSpinner();
          // test error that occured
          // console.error('Error:', error);
          alert('Please enter a valid city name!');
        }
      });
    }
  });
});
