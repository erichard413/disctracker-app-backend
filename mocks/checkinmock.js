"use strict";

const db = require('../db');

const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

class checkInMock {
    static async doCheckIn(discId, username, {courseName, city, state, zip, country, note}) {
        console.log('doing geocode');
        let latitude = '42.1015'
        let longitude = '-72.5898'
        const result = await db.query(`INSERT INTO check_ins (username, disc_id, course_name, city, state, zip, date, country, latitude, longitude, note) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, $7, $8, $9, $10)
        RETURNING username, disc_id AS "discId", course_name AS "courseName", city, state, zip, date, country, latitude, longitude, note
        `, [username, discId, courseName, city, state, zip, country, latitude, longitude, note]);
        return result.rows[0];
    }

    static async updateCheckIn(id, {courseName=null, city=null, state=null, zip=null, note=null}) {

        const checkIn = await db.query(`SELECT * FROM check_ins WHERE id=$1`, [id]);
        if (!checkIn.rows[0]) throw new NotFoundError(`No check in found of id ${id}!`);
        if (!city || !zip || !state) throw new BadRequestError(`City, state & zip is required!`);

        console.log('doing geocode...')
        let latitude = '42.1015'
        let longitude = '-72.5898'

        const currentInfo = checkIn.rows[0];
        if (latitude) currentInfo.latitude = latitude;
        if (longitude) currentInfo.longitude = longitude;
        if (courseName) currentInfo.course_name = courseName;
        if (city) currentInfo.city = city;
        if (state) currentInfo.state = state;
        if (zip) currentInfo.zip = zip;
        if (note) currentInfo.note = note;
        
        const result = await db.query(`UPDATE check_ins SET course_name=$1, city=$2, state=$3, zip=$4, date=$5, latitude=$6, longitude=$7, note=$8 WHERE id=$9 RETURNING
        username, disc_id AS discId, course_name AS courseName, city, state, zip, date, latitude, longitude, id, note`, [currentInfo.course_name, currentInfo.city, currentInfo.state, currentInfo.zip, currentInfo.date, currentInfo.latitude, currentInfo.longitude, currentInfo.note, id])
        return result.rows[0];
    }
}

module.exports = checkInMock;