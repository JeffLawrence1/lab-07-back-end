'use strict';

//--------------------------------
// Load Enviroment Variables from the .env file
//--------------------------------
require('dotenv').config();

//--------------------------------
// Application Dependencies
//--------------------------------
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');

//--------------------------------
//Application setup
//--------------------------------
const PORT = process.env.PORT;
const app = express();
app.use(cors());

//--------------------------------
// Constructors Functions
//--------------------------------
function Location(query, geoData) {
  this.search_query = query;
  this.formatted_query = geoData.formatted_address;
  this.latitude = geoData.geometry.location.lat;
  this.longitude = geoData.geometry.location.lng;
}

function Weather(day) {
  this.forecast = day.summary;
  this.time = new Date(day.time * 1000).toDateString();
}

//--------------------------------
// Route Callbacks
//--------------------------------
let searchCoords = (request, response) => {
  const data = request.query.data;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${data}&key=${process.env.GEOCODE_API_KEY}`;

  return superagent.get(url)
    .then(result => {
      response.send(new Location(data, result.body.results[0]));
    })
    .catch(() => errorMessage());
};

let searchWeather = (request, response) => {
  const data = request.query.data;
  const url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${data.latitude},${data.longitude}`;

  return superagent.get(url)
    .then(result => {
      const dailyWeather = result.body.daily.data.map(day => {
        return new Weather(day);
      });

      response.send(dailyWeather);
    })
    .catch(() => errorMessage());
};

//--------------------------------
// Routes
//--------------------------------
app.get('/location', searchCoords);
app.get('/weather', searchWeather);

//--------------------------------
// Error Message
//--------------------------------
let errorMessage = () => {
  let errorObj = {
    status: 500,
    responseText: 'Sorry something went wrong',
  };
  return errorObj;
};

//--------------------------------
// Power On
//--------------------------------
app.listen(PORT, () => console.log(`app is listening ${PORT}`));
