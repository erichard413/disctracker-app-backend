"use strict";

const jsonschema = require("jsonschema");
const checkIn = require('../models/checkin');
const express = require('express');
const router = new express.Router();
const userAuthSchema = require('../schema/userAuth.json');
const {BadRequestError} = require('../expressError');

// GET /checkin
// Retrieves all check ins
router.get('/', async function(req, res, next){
    const result = await checkIn.getAll();
    return res.json({result})
})

// POST /checkin
// Creates a new check in.
// req.body must include:
// {
//     course_name,
//     city,
//     state,
//     zip
// }
router.post('/:discId', async function(req, res, next) {
    const username = res.locals.user.username || 'Anonymous';
    try {
        // ADD JSON SCHEMA VALIDATION HERE ---------
        const result = await checkIn.doCheckIn(req.params.discId, username, req.body);
        return res.json(result);
    } catch(err) {
        return next(err);
    }
})

module.exports = router;