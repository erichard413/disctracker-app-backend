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

/** Related functions for users. */

class User {
  static async authenticate(username, password) {
    const result = await db.query(
        `SELECT username,
            password, 
            first_name AS "firstName", 
            last_name AS "lastName",
            email,
            is_admin AS "isAdmin" 
            FROM users WHERE username = $1`, [username]
    );
    const user = result.rows[0];

    if (user) {
        //validate hash password to user inputted password
        const isValid = await bcrypt.compare(password, user.password);
        if (isValid === true) {
            delete user.password;
            return user;
        }
    }
    // if not, return error for invalid password/username
    throw new UnauthorizedError("Invalid username/password");
  }
  static async register ({username, password, firstName, lastName, email}) {
    const duplicateCheck = await db.query(
      `SELECT username FROM users WHERE username=$1`, [username]
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Username ${username} already exists!`);
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    const result = await db.query(
      `INSERT INTO users (username, password, first_name, last_name, email, join_date, is_admin) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, false) RETURNING username, first_name AS firstName, last_name AS lastName, email, join_date AS joinDate, is_admin AS isAdmin`, [username, hashedPassword, firstName, lastName, email]
    );
    const user = result.rows[0];
    return user;
  }
  // for admin creation of users route
  static async adminRegister ({username, password, firstName, lastName, email, isAdmin=false}) {
    const duplicateCheck = await db.query(
      `SELECT username FROM users WHERE username=$1`, [username]
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Username ${username} already exists!`);
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    const result = await db.query(
      `INSERT INTO users (username, password, first_name, last_name, email, join_date, is_admin) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, $6) RETURNING username, first_name AS firstName, last_name AS lastName, email, join_date AS joinDate, is_admin AS isAdmin`, [username, hashedPassword, firstName, lastName, email, isAdmin]
    );
    const user = result.rows[0];
    return user;
  }
  static async getAll() {
    const result = await db.query(`SELECT username, first_name AS firstName, last_name AS lastName, join_date AS joinDate, email, is_admin AS isAdmin FROM users`);
    return result.rows;
  }
  static async getUser(username) {
    const result = await db.query(`SELECT username, first_name AS firstName, last_name AS lastName, join_date AS joinDate, email, is_admin AS isAdmin FROM users WHERE username=$1`, [username]);
    if (!result.rows[0]) throw new NotFoundError(`Username ${username} not found!`);
    return result.rows[0];
  }
  static async updateUser(username, data) {
    // delete data.is_admin, to prevent from SQL attacks - users shouldn't be able to use this to make themselves admin.
    delete data.is_admin
    // encrypt the password, if data contains it.
    if (data.password) {
        data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
    }
    const { setCols, values } = sqlForPartialUpdate(data, 
        {
            firstName: "first_name",
            lastName: "last_name",
            email: "email"
        });
    const usernameVarIdx = "$"+(values.length+1);
    const querySQL = `UPDATE users SET ${setCols} WHERE username=${usernameVarIdx} RETURNING username, first_name AS "firstName", last_name AS "lastName", email, join_date AS joinDate, is_admin AS "isAdmin"`;
    const result = await db.query(querySQL, [...values, username]);
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    delete user.password;
    return user;
}
static async adminUpdateUser(username, data) {
    // encrypt the password, if data contains it.
    if (data.password) {
        data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
    }
    const { setCols, values } = sqlForPartialUpdate(data, 
        {
            firstName: "first_name",
            lastName: "last_name",
            email: "email"
        });
    const usernameVarIdx = "$"+(values.length+1);
    const querySQL = `UPDATE users SET ${setCols} WHERE username=${usernameVarIdx} RETURNING username, first_name AS "firstName", last_name AS "lastName", email, join_date AS joinDate, is_admin AS "isAdmin"`;
    const result = await db.query(querySQL, [...values, username]);
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    delete user.password;
    return user;
}
  static async deleteUser(username) {
    const userCheck = await db.query(`SELECT first_name FROM users WHERE username=$1`,[username]);
    if (!userCheck.rows[0]) throw new NotFoundError(`Couldn't find username of ${username}`);
    await db.query(`DELETE FROM users WHERE username=$1`, [username]);
    return;
  }
}



module.exports = User;