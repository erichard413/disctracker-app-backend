// routes for users

const jsonschema = require("jsonschema");
const userNew = require('../schema/userNew.json');
const express = require("express");
const {ensureCorrectUserOrAdmin, ensureAdmin} = require('../middleware/auth');
const {BadRequestError} = require('../expressError');
const User = require('../models/user');
const {createToken} = require('../helpers/tokens');
const router = new express.Router();

// GET /all
// Gets list of all users, admin required
router.get('/', ensureAdmin, async function(req, res, next) {
    try {
        const result = await User.getAll();
        return res.json(result);
    } catch (err) {
        return next(err);
    }
})

// GET /:username
// Gets user data, admin OR that logged in user
router.get('/:username', ensureCorrectUserOrAdmin, async function(req, res, next) {
    try {
        const result = await User.getUser(req.params.username);
        return res.json(result);
    } catch (err) {
        return next(err);
    }
})

// PATCH /:username
// Edit user data, admin required or logged in user
router.patch('/:username', ensureCorrectUserOrAdmin, async function(req, res, next) {
    try {
        const result = await User.updateUser(req.params.username, req.body);
        return res.json(result);
    } catch (err) {
        return next(err);
    }
})
// PATCH /:username/admin
// Edit user data, admin required
router.patch('/:username/admin', ensureAdmin, async function(req, res, next) {
    try {
        const result = await User.adminUpdateUser(req.params.username, req.body);
        return res.json(result);
    } catch (err) {
        return next(err);
    }
})

// POST /new
// --- THIS IS NOT THE ROUTE FOR USERS TO REGISTER. THIS IS FOR ADMINS TO EXPLICITLY CREATE USERS & ADMIN USERS.
// Auth: Admin ONLY
router.post('/new', ensureAdmin, async function(req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, userNew);
        if(!validator.valid) {
            const errs = validator.errors.map(e=>e.stack);
            throw new BadRequestError(errs);
        }
        const user = await User.adminRegister(req.body);
        const token = createToken(user);
        return res.status(201).json({user, token});
    } catch (err) {
        return next(err);
    }
})

// DELETE /:username
// Deletes user from DB.
// Auth required: Admin ONLY
router.delete('/:username', ensureAdmin, async function(req, res, next) {
    try {
        await User.deleteUser(req.params.username);
        return res.status(200).json({message: `User of username ${req.params.username} deleted!`});
    } catch(err) {
        return next(err);
    }
})

// PATCH /:username/auth/reset
// reset PW, send temporary password to user
router.patch('/:username/auth/reset', async function (req, res, next) {
    try {
        await User.resetPassword(req.params.username);
        return res.json({message: "Password sent to email on file."});
    } catch (err) {
        return next(err);
    }
})

// PATCH /:username/changepassword
// change password
// Auth required: ADMIN/that logged in user only
router.patch('/:username/auth/change', ensureCorrectUserOrAdmin, async function (req, res, next) {
    try {
        await User.changePassword(req.params.username, req.body.password);
        return res.status(201).json({message: `Password change successful!`})
    } catch(err) {
        return next(err);
    }
});

module.exports = router;