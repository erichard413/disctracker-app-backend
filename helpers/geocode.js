"use strict"
require("dotenv").config();
const GEOAPIFY_BASE_URL = require('../apis/apis');
const {
    NotFoundError,
    BadRequestError,
    UnauthorizedError,
  } = require("../expressError");
const axios = require('axios');

async function geocode(courseName, city=null, state=null, zip=null) {
    let queryString='';
    if (courseName) {
        queryString += courseName.replace(' ', '%20') + '%20'
    }
    if (city) {
        queryString += city.replace(' ', '%20') + '%20'
    }
    if (state) {
        queryString += state.replace(' ', '%20') + '%20'
    }
    if (zip) {
        queryString += zip + '%20'
    }
    const result = await axios.get(`${GEOAPIFY_BASE_URL}${queryString}&apiKey=${process.env.GEOCODING_API_KEY}`);
    if (!result.data) throw new NotFoundError(`Could not find query!`)
    return {latitude: result.data.features[0].properties.lat,
            longitude: result.data.features[0].properties.lon}
}

module.exports = { geocode };