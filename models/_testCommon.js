"use strict";

const db = require('../db');
const user = require('./user');
const Disc = require('./disc');
const Course = require('./course');
const {createToken} = require('../helpers/tokens');

async function commonBeforeAll() {
    //delete from discs
    await db.query('DELETE FROM discs');
    //delete from users
    await db.query('DELETE FROM users');
    //delete from courses
    await db.query('DELETE FROM courses');
    //register test users
    await user.register({
        username: "u1",
        firstName: "U1F",
        lastName: "U1L",
        email: "user1@user.com",
        password: "password1"
    });
    await user.register({
        username: "u2",
        firstName: "U2F",
        lastName: "U2L",
        email: "user2@user.com",
        favTeamId: 1,
        password: "password2"
    });
    await user.register({
        username: "u3",
        firstName: "U3F",
        lastName: "U3L",
        favTeamId: 1,
        email: "user3@user.com",
        password: "password3"
    });
      //create test discs
    await Disc.createDisc({
        id: "12345",
        manufacturer: "Manufacturer1",
        plastic: "Plastic1",
        name: "Name1"
    })
    await Disc.createDisc({
        id: "67891",
        manufacturer: "Manufacturer2",
        plastic: "Plastic2",
        name: "Name2"
    })
    await Disc.createDisc({
        id: "23456",
        manufacturer: "Manufacturer3",
        plastic: "Plastic3",
        name: "Name3"
    })
    await Course.addCourse({
        courseName: "Course1",
        city: "City1",
        state: "State1",
        zip: "11111",
        country: "United States",
        holes: 18
    })
    await Course.addCourse({
        courseName: "Course2",
        city: "City2",
        state: "State2",
        zip: "11112",
        country: "United States",
        holes: 18
    })
    await Course.addCourse({
        courseName: "Course3",
        city: "City3",
        state: "State3",
        zip: "11113",
        country: "United States",
        holes: 18
    })
}

async function commonBeforeEach() {
    await db.query("BEGIN");
}
  
async function commonAfterEach() {
    await db.query("ROLLBACK");
}
  
async function commonAfterAll() {
    await db.end();
}

const u1Token = createToken({ username: "u1", isAdmin: false });
const u2Token = createToken({ username: "u2", isAdmin: false });
const adminToken = createToken({ username: "admin", isAdmin: true });

module.exports = {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    u1Token,
    u2Token,
    adminToken,
  };