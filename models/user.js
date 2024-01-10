"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");
const { sqlForPartialUpdate } = require("../helpers/sql");
const { sendEmail } = require("../helpers/sendEmail");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

const { BCRYPT_WORK_FACTOR } = require("../config.js");
const randomstring = require("randomstring");

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
            FROM users WHERE username = $1`,
      [username]
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
  static async register({ username, password, firstName, lastName, email }) {
    const duplicateCheck = await db.query(
      `SELECT username FROM users WHERE username=$1`,
      [username.toLowerCase()]
    );

    const emailCheck = await db.query(
      `SELECT username FROM users WHERE email=$1`,
      [email.toLowerCase()]
    );
    if (emailCheck.rows[0])
      throw new BadRequestError(
        `Email ${email.toLowerCase()} is already associated with an account!`
      );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(
        `Username ${username.toLowerCase()} already exists!`
      );
    }

    if (username.toLowerCase() === "anonymous")
      throw new BadRequestError(`Invalid username, please choose another.`);

    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    const result = await db.query(
      `INSERT INTO users (username, password, first_name, last_name, email, join_date, is_admin) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, false) RETURNING username, first_name AS "firstName", last_name AS "lastName", email, join_date AS "joinDate", is_admin AS "isAdmin"`,
      [
        username.toLowerCase(),
        hashedPassword,
        firstName,
        lastName,
        email.toLowerCase(),
      ]
    );
    const user = result.rows[0];
    return user;
  }
  // for admin creation of users route
  static async adminRegister({
    username,
    password,
    firstName,
    lastName,
    email,
    isAdmin = false,
  }) {
    const duplicateCheck = await db.query(
      `SELECT username FROM users WHERE username=$1`,
      [username.toLowerCase()]
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(
        `Username ${username.toLowerCase()} already exists!`
      );
    }

    const emailCheck = await db.query(
      `SELECT username FROM users WHERE email=$1`,
      [email.toLowerCase()]
    );
    if (emailCheck.rows[0])
      throw new BadRequestError(
        `Email ${email} is already associated with an account!`
      );

    if (username.toLowerCase() === "anonymous")
      throw new BadRequestError(`Invalid username, please choose another.`);

    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    const result = await db.query(
      `INSERT INTO users (username, password, first_name, last_name, email, join_date, is_admin) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, $6) RETURNING username, first_name AS "firstName", last_name AS "lastName", email, join_date AS "joinDate", is_admin AS "isAdmin"`,
      [
        username.toLowerCase(),
        hashedPassword,
        firstName,
        lastName,
        email.toLowerCase(),
        isAdmin,
      ]
    );
    const user = result.rows[0];
    return user;
  }
  static async getAll(nameLike) {
    let params = [];
    let queryString = `SELECT username, first_name AS "firstName", last_name AS "lastName", join_date AS "joinDate", email, is_admin AS "isAdmin" FROM users`;
    if (nameLike) queryString += ` WHERE username ILIKE $1`;
    if (nameLike) params.push(`%${nameLike}%`);
    queryString += ` ORDER BY username ASC`;
    const result = await db.query(queryString, params);
    return result.rows;
  }
  //This is to retrieve user data as an ADMIN -> admins get access to full account information
  static async adminGetUser(username) {
    const result = await db.query(
      `SELECT username, first_name AS "firstName", last_name AS "lastName", join_date AS "joinDate", email, is_admin AS "isAdmin" FROM users WHERE username=$1`,
      [username]
    );
    if (!result.rows[0])
      throw new NotFoundError(`Username ${username} not found!`);
    return result.rows[0];
  }
  //This is to get another user's data - limited information
  static async getUser(username) {
    const result = await db.query(
      `SELECT username, first_name AS "firstName", last_name AS "lastName", join_date AS "joinDate" FROM users WHERE username=$1`,
      [username]
    );
    if (!result.rows[0])
      throw new NotFoundError(`Username ${username} not found!`);
    return result.rows[0];
  }
  static async updateUser(username, data) {
    // delete data.is_admin, to prevent from SQL attacks - users shouldn't be able to use this to make themselves admin.
    delete data.is_admin;
    // encrypt the password, if data contains it.
    if (data.password) {
      data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
    }
    if (data.email) {
      const emailCheck = await db.query(
        `SELECT username FROM users WHERE email=$1`,
        [data.email.toLowerCase()]
      );
      if (emailCheck.rows[0])
        throw new BadRequestError(
          `Email ${data.email.toLowerCase()} is already associated with an account!`
        );
    }

    const { setCols, values } = sqlForPartialUpdate(data, {
      firstName: "first_name",
      lastName: "last_name",
      email: "email",
    });
    const usernameVarIdx = "$" + (values.length + 1);
    const querySQL = `UPDATE users SET ${setCols} WHERE username=${usernameVarIdx} RETURNING username, first_name AS "firstName", last_name AS "lastName", email, join_date AS "joinDate", is_admin AS "isAdmin"`;
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
    // check to see if email already exists
    if (data.email) {
      const emailCheck = await db.query(
        `SELECT username FROM users WHERE email=$1`,
        [data.email.toLowerCase()]
      );
      if (emailCheck.rows[0])
        throw new BadRequestError(
          `Email ${data.email} is already associated with an account!`
        );
    }

    const { setCols, values } = sqlForPartialUpdate(data, {
      firstName: "first_name",
      lastName: "last_name",
      email: "email",
      isAdmin: "is_admin",
    });
    const usernameVarIdx = "$" + (values.length + 1);
    const querySQL = `UPDATE users SET ${setCols} WHERE username=${usernameVarIdx} RETURNING username, first_name AS "firstName", last_name AS "lastName", email, join_date AS "joinDate", is_admin AS "isAdmin"`;
    const result = await db.query(querySQL, [...values, username]);
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    delete user.password;
    return user;
  }
  static async deleteUser(username) {
    const userCheck = await db.query(
      `SELECT first_name FROM users WHERE username=$1`,
      [username]
    );
    if (!userCheck.rows[0])
      throw new NotFoundError(`Couldn't find username of ${username}`);
    await db.query(`DELETE FROM users WHERE username=$1`, [username]);
    return;
  }
  static async resetPassword(username) {
    const email = await db.query(`SELECT email FROM users WHERE username=$1`, [
      username,
    ]);
    if (!email.rows[0])
      throw new NotFoundError(`Couldn't find username of ${username}`);

    const newPassword = randomstring.generate({
      length: 8,
      charset: "alphabetic",
    });

    const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_WORK_FACTOR);
    await db.query(`UPDATE users SET password=$1 WHERE username=$2`, [
      hashedPassword,
      username,
    ]);

    sendEmail(email.rows[0].email, newPassword);
  }
  static async forgotUserId(email, firstName) {
    const result = await db.query(
      `SELECT username, first_name AS "firstName" FROM users WHERE email=$1`,
      [email]
    );
    if (!result.rows[0])
      throw new NotFoundError(`Cannot find account for email ${email}`);
    const retrievedUser = result.rows[0];
    if (retrievedUser.firstName.toLowerCase() !== firstName.toLowerCase())
      throw new BadRequestError(`First name could not be verified!`);
    return retrievedUser.username;
  }
  static async changePassword(username, password) {
    const userCheck = await db.query(
      `SELECT first_name FROM users WHERE username=$1`,
      [username]
    );
    if (!userCheck.rows[0])
      throw new NotFoundError(`Couldn't find username of ${username}`);
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    await db.query(`UPDATE users SET password=$1 WHERE username=$2`, [
      hashedPassword,
      username,
    ]);
    return;
  }
}

module.exports = User;
