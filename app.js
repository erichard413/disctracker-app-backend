"use strict";
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { authenticateJWT } = require("./middleware/auth");
const authRoutes = require("./routes/auth");
const discRoutes = require('./routes/disc');
const userRoutes = require('./routes/users');
const checkinRoutes = require('./routes/checkin');
const courseRoutes = require('./routes/courses');

const {NotFoundError} = require("./expressError");

// routes go here

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));
app.use(authenticateJWT);

app.use("/auth", authRoutes);
app.use('/discs', discRoutes);
app.use('/users', userRoutes);
app.use('/checkin', checkinRoutes);
app.use('/courses', courseRoutes);

// handle 404 errors

app.use(function (req, res, next) {
    return next(new NotFoundError());
});

// generic error - anything unhandled goes here

app.use(function (err, req, res, next) {
    if (process.env.NODE_ENV !== "test") console.error(err.stack);
    const status = err.status || 500;
    const message = err.message;

    return res.status(status).json({
        error: {message, status}
    })
})

module.exports = app;