"use strict";

require("dotenv").config();
require("colors");

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "secret-dev";

const PORT = +process.env.PORT || 3001;

// use testing database if node env is "test"

function getDatabaseUri() {
  return process.env.NODE_ENV === "test"
    ? `postgres://${process.env.PG_USER}:${process.env.PG_PASSWORD}@localhost:5432/disctracker_test`
    : process.env.DATABASE_URL ||
        `postgres://${process.env.PG_USER}:${process.env.PG_PASSWORD}@localhost:5432/disctracker`;
}

const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12;

console.log("disctracker config:".green);
console.log("SECRET_KEY:".yellow, ACCESS_TOKEN_SECRET);
console.log("PORT:".yellow, PORT.toString());
console.log("BCRYPT_WORK_FACTOR".yellow, BCRYPT_WORK_FACTOR);
console.log("Database:".yellow, getDatabaseUri());
console.log("---");

module.exports = {
  ACCESS_TOKEN_SECRET,
  PORT,
  BCRYPT_WORK_FACTOR,
  getDatabaseUri,
};
