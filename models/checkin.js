"use strict";

const db = require("../db");
const { sqlForPartialUpdate } = require("../helpers/sql");
const { geocode } = require("../helpers/geocode");
const { calcTotal } = require("../helpers/haversine");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

class checkIn {
  static async getAll(
    courseName = null,
    date = null,
    username = null,
    orderBy = "DESC"
  ) {
    const queryParams = [];
    let queryString = `SELECT username, id, disc_id AS "discId", course_name AS "courseName", city, state, zip, date, country, latitude, longitude, note FROM check_ins`;
    if (courseName) {
      queryParams.push(`%${courseName}%`);
      queryString += ` WHERE course_name ILIKE $${queryParams.length}`;
    }
    if (date) {
      queryParams.push(`%${date}%`);
      queryString += ` ${
        queryParams.length > 1 ? "AND" : "WHERE"
      } date ILIKE $${queryParams.length}`;
    }
    if (username) {
      queryParams.push(`%${username}%`);
      queryString += ` ${
        queryParams.length > 1 ? "AND" : "WHERE"
      } username ILIKE $${queryParams.length}`;
    }
    const result = await db.query(
      `${queryString} ORDER BY date ${orderBy}`,
      queryParams
    );
    return result.rows;
  }
  static async doCheckIn(
    discId,
    username,
    { courseName, city, state, zip, country, note }
  ) {
    const { latitude, longitude } = await geocode(courseName, city, state, zip);
    const result = await db.query(
      `INSERT INTO check_ins (username, disc_id, course_name, city, state, zip, date, country, latitude, longitude, note) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, $7, $8, $9, $10)
        RETURNING username, disc_id AS "discId", course_name AS "courseName", city, state, zip, date, country, latitude, longitude, note
        `,
      [
        username,
        discId,
        courseName,
        city,
        state,
        zip,
        country,
        latitude,
        longitude,
        note,
      ]
    );
    return result.rows[0];
  }
  static async getCheckInsByDisc(discId, direction = "DESC") {
    let queryString = `SELECT username, id, disc_id AS "discId", course_name AS "courseName", city, state, zip, date, country, latitude, longitude, note FROM check_ins WHERE disc_id=$1 ORDER BY date ${direction}`;
    const result = await db.query(queryString, [discId]);
    if (result.rows.length === 0)
      throw new NotFoundError(`No check ins for disc id ${discId} found!`);
    return result.rows;
  }
  static async deleteCheckIn(id) {
    const idCheck = await db.query(
      `SELECT disc_id FROM check_ins WHERE id=$1`,
      [id]
    );
    if (!idCheck.rows[0])
      throw new NotFoundError(`No check in found of id ${id}!`);

    await db.query(`DELETE FROM check_ins WHERE id=$1`, [id]);
    return;
  }
  static async updateCheckIn(
    id,
    {
      courseName = null,
      city = null,
      state = null,
      zip = null,
      country = null,
      note = null,
    }
  ) {
    let latitude;
    let longitude;
    const checkIn = await db.query(`SELECT * FROM check_ins WHERE id=$1`, [id]);
    if (!checkIn.rows[0])
      throw new NotFoundError(`No check in found of id ${id}!`);
    // if (!city || !zip || !state) throw new BadRequestError(`City, state & zip is required!`);
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
    if (country) currentInfo.country = country;
    if (note) currentInfo.note = note;

    const result = await db.query(
      `UPDATE check_ins SET course_name=$1, city=$2, state=$3, zip=$4, date=$5, latitude=$6, longitude=$7, country=$8, note=$9 WHERE id=$10 RETURNING
        username, disc_id AS "discId", course_name AS "courseName", city, state, zip, country, date, latitude, longitude, note, id`,
      [
        currentInfo.course_name,
        currentInfo.city,
        currentInfo.state,
        currentInfo.zip,
        currentInfo.date,
        currentInfo.latitude,
        currentInfo.longitude,
        currentInfo.country,
        currentInfo.note,
        id,
      ]
    );
    return result.rows[0];
  }
  static async getCheckInById(id) {
    const result = await db.query(
      `SELECT username, id, disc_id AS "discId", course_name AS "courseName", city, state, zip, date, country, latitude, longitude, note FROM check_ins WHERE id=$1`,
      [id]
    );
    if (!result.rows[0])
      throw new NotFoundError(`Cannot find check in with id: ${id}`);
    return result.rows[0];
  }
  static async getCheckInsByUser(username, dir = "DESC") {
    const userCheck = await db.query(
      `SELECT username FROM users WHERE username=$1 `,
      [username]
    );
    if (!userCheck.rows[0])
      throw new NotFoundError(
        `Cannot find check in with username: ${username}`
      );

    const result = await db.query(
      `SELECT username, id, disc_id AS "discId", course_name AS "courseName", city, state, zip, date, country, latitude, longitude, note FROM check_ins WHERE username=$1 ORDER BY date ${dir}`,
      [username]
    );
    return result.rows;
  }
  static async getDistanceForDisc(discId) {
    const discCheck = await db.query(`SELECT id FROM discs WHERE id=$1`, [
      discId,
    ]);
    if (!discCheck.rows[0])
      throw new NotFoundError(`Cannot find disc with id: ${discId}`);

    const result = await db.query(
      `SELECT username, id, disc_id AS "discId", course_name AS "courseName", city, state, zip, date, country, latitude, longitude FROM check_ins WHERE disc_id=$1`,
      [discId]
    );
    const distance = calcTotal(result.rows);
    return distance;
  }
  // I want to use this to provide basic stats -> total distance travelled, total # of check ins, # of states, cities, # of users checked in.
  static async getCheckinStats(discId) {
    const discCheck = await db.query(`SELECT id FROM discs WHERE id=$1`, [
      discId,
    ]);
    if (!discCheck.rows[0])
      throw new NotFoundError(`Cannot find disc with id: ${discId}`);

    const result = await db.query(
      `SELECT username, id, disc_id AS "discId", course_name AS "courseName", city, state, zip, date, country, latitude, longitude FROM check_ins WHERE disc_id=$1`,
      [discId]
    );
    return result.rows;
  }
}

module.exports = checkIn;
