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

function Weather(query, weatherData) {
  this.search_query = query;
  this.latitude = query.latitude;
  this.longitude = query.longitude;
  this.forecast = weatherData.daily.data;
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

let searchWeather = (query) => {
  const weatherData = require('./data/darksky.json');
  // const weather = new Weather(searchCoords(query), weatherData);

  return weather.forecast.map((element) => {
    let myDate = new Date(element.time * 1000).toDateString();
    let tempObj = {
      forecast: element['summary'],
      time: myDate,
    };

    return tempObj;
  });
};

//--------------------------------
// Routes
//--------------------------------
app.get('/weather', (request, response) => {
  // try {
  //   const weatherData = searchWeather(request.query.data);
  //   response.send(weatherData);
  // }
  // catch(error) {
  //   console.error(error);
  //   let message = errorMessage();
  //   response.status(message.status).send(message.responseText);
  // }
});

// app.get('/location', (request, response) => {
//   try {
//     const locationData = searchCoords(request.query.data);
//     response.send(locationData);
//   }
//   catch(error) {
//     console.error(error);
//     let message = errorMessage();
//     response.status(message.status).send(message.responseText);
//   }
// });

app.get('/location', searchCoords);

//--------------------------------
// Error Message
//--------------------------------
let errorMessage = () => {
  let errorObj = {
    status: 500,
    responseText: 'Sorry something went wrong',
  };
  console.log(errorObj);
  return errorObj;
};

//--------------------------------
// Power On
//--------------------------------
app.listen(PORT, () => console.log(`app is listening ${PORT}`));
