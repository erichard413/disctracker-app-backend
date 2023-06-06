"use strict";

const db = require('../db');
const bcrypt = require("bcrypt");
const { sqlForPartialUpdate } = require("../helpers/sql");

const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

const { BCRYPT_WORK_FACTOR } = require("../config.js");
const randomstring = require('randomstring');

class UserMock {
    static async resetPassword(username) {
        const email = await db.query(`SELECT email FROM users WHERE username=$1`,[username]);
        if (!email.rows[0]) throw new NotFoundError(`Couldn't find username of ${username}`);
    
        const newPassword = randomstring.generate({
          length: 8,
          charset: 'alphabetic'
        })
    
        const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_WORK_FACTOR);
        await db.query(`UPDATE users SET password=$1 WHERE username=$2`, [hashedPassword, username]);
    
        console.log(`Send email to email address ${email.rows[0].email}`)
      }
}

module.exports = UserMock;