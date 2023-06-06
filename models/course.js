"use strict";

const db = require('../db');

const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

class course {
    static async addCourse({courseName, city, state, zip, country, holes}) {
        await db.query(`INSERT INTO courses (course_name, city, state, zip, country, holes) VALUES ($1, $2, $3, $4, $5, $6)`, [courseName, city, state, zip, country, holes]);
    }
    static async getCourseById(id) {
      const result = await db.query(`SELECT course_name AS "courseName", city, state, zip, country, holes FROM courses WHERE id=$1`, [id]);
      if (!result.rows[0]) throw new NotFoundError(`No course with id of ${id} found!`);
      return result.rows[0];
    }
    static async getCourses(courseName=null) {
      let queryString = `SELECT course_name AS "courseName", city, state, zip, country, holes, id FROM courses`
      let params = null;
      if (courseName) { 
        queryString += ' WHERE course_name ILIKE $1' 
        params = [`%${courseName}%`]
      }
      const result = await db.query(queryString, params);
      return result.rows
    }
}

module.exports = course;