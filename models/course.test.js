"use strict";

const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");
const db = require("../db.js");
const Course = require("./course.js");
const UserMock = require("../mocks/usermock.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** add course */

describe("works: adds course to courses", function(){
    test("should add course", async function(){
        const newCourse = {
            courseName: "newname",
            city: "newcity",
            state: "newstate",
            zip: "11111",
            country: "United States",
            holes: 18
        }
        await Course.addCourse(newCourse);
        const result = await Course.getCourses();
        expect(result[result.length-1]).toEqual({...newCourse, id : expect.any(Number)});
    })
})

/************************************** get all courses */

describe("works: get all courses", function(){
    test("should get courses", async function(){
        const result = await Course.getCourses();
        expect(result.length).toBe(3);
    })
})

/************************************** get course by id */

describe("works: get course by ID", function(){
    test("should get course from ID", async function(){
        const course = await Course.getCourses();
        const testCourse = course[course.length-1];
        const result = await Course.getCourseById(testCourse.id);
        expect(result).toEqual({
            courseName: "Course3",
            city: "City3",
            state: "State3",
            zip: "11113",
            country: "United States",
            holes: 18
        })
    })
})

