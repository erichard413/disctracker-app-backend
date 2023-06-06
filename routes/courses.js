"use strict";

const express = require('express');
const {paginatedResults} = require('../helpers/paginatedResults');
const router = new express.Router();
const course = require('../models/course');
const {BadRequestError} = require('../expressError');

//GET /courses
//this route will return courses based on query 
router.get('/', async function(req, res, next) {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 15 
    const result = await course.getCourses(req.query.courseName);
    return res.json(paginatedResults(result, page, limit));
})

module.exports = router;