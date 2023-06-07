"use strict";

const db = require('../db');
const user = require('../models/user');
const Disc = require('../models/disc');
const Course = require('../models/course');
const CheckIn = require('../models/checkin');
const CheckInMock = require("../mocks/checkinmock.js");
const {createToken} = require('../helpers/tokens');

async function commonBeforeAll() {
    //delete from discs
    await db.query('DELETE FROM discs');
    //delete from users
    await db.query('DELETE FROM users');
    //delete from courses
    await db.query('DELETE FROM courses');
    //delete from check_ins
    await db.query('DELETE FROM check_ins');
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
        password: "password2"
    });
    await user.register({
        username: "u3",
        firstName: "U3F",
        lastName: "U3L",
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
    await CheckInMock.doCheckIn('12345', 'u1', {courseName: "Course1", state: "State1", zip: "11111", city: "City1", country: "United States"});
    await CheckInMock.doCheckIn('67891', 'u2', {courseName: "Course2", state: "State2", zip: "11112", city: "City2", country: "United States"});
    await CheckInMock.doCheckIn('23456', 'u3', {courseName: "Course3", state: "State3", zip: "11113", city: "City3", country: "United States"});
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