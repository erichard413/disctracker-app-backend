"use strict";

const jsonschema = require("jsonschema");
const checkIn = require('../models/checkin');
const express = require('express');
const router = new express.Router();
const checkInNewSchema = require('../schema/checkInNew.json');
const {BadRequestError} = require('../expressError');
const {paginatedResults} = require('../helpers/paginatedResults');
const {ensureCorrectUserOrAdmin, ensureAdmin} = require('../middleware/auth');

// GET /checkin
// Retrieves all check ins
router.get('/', async function(req, res, next){
    const page = parseInt(req.query.page)
    const limit = parseInt(req.query.limit)
    const result = await checkIn.getAll();
    return res.json(paginatedResults(result, page, limit))
})

// GET /checkin/:discId
// Retrieves all check ins for requested discId
// Query options: direction (ASC/DESC), limit (integer);
router.get('/:discId', async function(req, res, next){
    const page = parseInt(req.query.page)
    const limit = parseInt(req.query.limit)
    let orderBy = req.query.direction === 'DESC' ? 'DESC' : 'ASC';
    try {
        const result = await checkIn.getCheckInsByDisc(req.params.discId, orderBy);
        return res.json(paginatedResults(result, page, limit));
    } catch (err) {
        return next(err);
    }
})

// GET /checkin/id/:id
// Retrieves single check in with id
router.get('/id/:id', async function (req, res, next){
    try {
        const result = await checkIn.getCheckInById(req.params.id);
        return res.json(result);
    } catch(err) {
        return next(err);
    }
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
    let username = null;
   if (res.locals.user) {
        username = res.locals.user.username
   } 
    try {
        const validator = jsonschema.validate(req.body, checkInNewSchema);
        if (!validator.valid) {
          const errs = validator.errors.map(e => e.stack);
          throw new BadRequestError(errs);
        }
        const result = await checkIn.doCheckIn(req.params.discId, username, req.body);
        return res.json(result);
    } catch(err) {
        return next(err);
    }
})

// DELETE /checkin/:id
// Deletes a check in.
// AUTH REQUIRED: Admin
router.delete('/:id', ensureAdmin, async function(req, res, next) {
    try {
        await checkIn.deleteCheckIn(req.params.id);
        return res.status(204).json({message: `Check in id ${req.params.id} deleted successfully!`});
    } catch (err) {
        return next(err);
    }
})

// PATCH /checkin/:id
// updates a check in.
// AUTH REQUIRED: Admin
// body can include: disc_id, course_name, city, state, zip 
router.patch('/:id', ensureAdmin, async function(req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, checkInNewSchema);
        if (!validator.valid) {
          const errs = validator.errors.map(e => e.stack);
          throw new BadRequestError(errs);
        }
        const result = await checkIn.updateCheckIn(req.params.id, req.body);
        return res.json({updated: result});
    } catch(err) {
        return next(err);
    }
})


module.exports = router;