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
    static async getCheckInsByDisc(discId, direction) {
        let queryString = `SELECT * FROM check_ins WHERE disc_id=$1 ORDER BY date ${direction}`
        const result = await db.query(queryString, [discId]);
        if (!result.rows) throw new NotFoundError(`No check ins for disc id ${discId} found!`);
        return result.rows;
    }
    static async deleteCheckIn(id) {
        const idCheck = await db.query(`SELECT disc_id FROM check_ins WHERE id=$1`, [id]);
        if (!idCheck.rows[0]) throw new NotFoundError(`No check in found of id ${id}!`);

        await db.query(`DELETE FROM check_ins WHERE id=$1`, [id]);
        return;
    }
    static async updateCheckIn(id, {courseName=null, city=null, state=null, zip=null}) {
        let latitude;
        let longitude;
        const checkIn = await db.query(`SELECT * FROM check_ins WHERE id=$1`, [id]);
        if (!checkIn.rows[0]) throw new NotFoundError(`No check in found of id ${id}!`);
        if (!city || !zip || !state) throw new BadRequestError(`City, state & zip is required!`);
        if (city && state && zip && courseName) {
            const result = await geocode(courseName, city, state, zip);
            latitude = result.latitude;
            longitude = result.longitude;
        }

        const currentInfo = checkIn.rows[0];
        if (latitude) currentInfo.latitude = latitude;
        if (longitude) currentInfo.longitude = longitude;
        if (courseName) currentInfo.course_name = courseName;
        if (city) currentInfo.city = city;
        if (state) currentInfo.state = state;
        if (zip) currentInfo.zip = zip;
        
        const result = await db.query(`UPDATE check_ins SET course_name=$1, city=$2, state=$3, zip=$4, date=$5, latitude=$6, longitude=$7 WHERE id=$8 RETURNING
        username, disc_id AS discId, course_name AS courseName, city, state, zip, date, latitude, longitude, id`, [currentInfo.course_name, currentInfo.city, currentInfo.state, currentInfo.zip, currentInfo.date, currentInfo.latitude, currentInfo.longitude, id])
        return result.rows[0];
    }
    static async getCheckInById(id) {
        const result = await db.query(`SELECT * FROM check_ins WHERE id=$1`, [id]);
        if (!result.rows[0]) throw new NotFoundError(`Cannot find check in with id: ${id}`);
        return result.rows[0];
    }
}

module.exports = checkIn;