"use strict";

const request = require("supertest");

const db = require("../db.js");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token,
  adminToken,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** GET /courses */

describe("GET /courses", function(){
    test("works: retrieves courses with pagination", async function(){
        const resp = await request(app).get("/courses");
        expect(resp.statusCode).toBe(200);
        expect(resp.body.results.length).toEqual(3);
    })
    test("works: query search test", async function(){
        const resp = await request(app).get("/courses?courseName=Course3");
        expect(resp.statusCode).toBe(200);
        // test should be in results somewhere.
        console.log(resp.body);
        expect(JSON.stringify(resp.body.results).includes("Course3")).toBeTruthy();
    })
})