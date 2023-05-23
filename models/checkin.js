"use strict";

const db = require('../db');
const { sqlForPartialUpdate } = require("../helpers/sql");
const { geocode } = require('../helpers/geocode');
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

class checkIn {
    static async getAll() {
        const result = await db.query(`SELECT * FROM check_ins`);
        return result.rows;
    }
    static async doCheckIn(discId, username, {courseName, city, state, zip}) {
        const {latitude, longitude} = await geocode(courseName, city, state, zip);
        const result = await db.query(`INSERT INTO check_ins (username, disc_id, course_name, city, state, zip, date, latitude, longitude) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, $7, $8)
        RETURNING username, disc_id AS discId, course_name AS courseName, city, state, zip, date, latitude, longitude
        `, [username, discId, courseName, city, state, zip, latitude, longitude]);
        return result.rows[0];
    }
}

module.exports = checkIn;