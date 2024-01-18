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

/************************************** GET /checkin */

describe("GET /checkin", function () {
  test("works: should retrieve all checkins", async function () {
    const resp = await request(app).get("/checkin");
    expect(resp.statusCode).toBe(200);
    expect(resp.body.results.length).toEqual(3);
  });
});

/************************************** GET /checkin/:discId */

describe("GET /checkin/:discId", function () {
  test("works: should retrieve checkin data for disc id", async function () {
    const resp = await request(app).get("/checkin/12345");
    expect(resp.statusCode).toBe(200);
    expect(resp.body.results[0]).toEqual({
      id: expect.any(Number),
      username: "u1",
      courseName: "Course1",
      discId: "12345",
      date: expect.any(String),
      state: "State1",
      zip: "11111",
      city: "City1",
      country: "United States",
      latitude: expect.any(String),
      longitude: expect.any(String),
      note: null,
    });
  });
  test("404 when bad disc id", async function () {
    const resp = await request(app).get(`/checkin/0`);
    expect(resp.statusCode).toBe(404);
  });
});

/************************************** GET /checkin/id/:id */

describe("GET /checkin/id/:id", function () {
  test("works: should retrieve check in data based on id", async function () {
    const checkins = await request(app).get("/checkin");
    const id = checkins.body.results[checkins.body.results.length - 1].id;
    const resp = await request(app).get(`/checkin/id/${id}`);
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toEqual({
      username: "u1",
      id: id,
      discId: "12345",
      courseName: "Course1",
      city: "City1",
      state: "State1",
      zip: "11111",
      date: expect.any(String),
      country: "United States",
      latitude: expect.any(String),
      longitude: expect.any(String),
      note: null,
    });
  });
  test("404 when bad id", async function () {
    const resp = await request(app).get(`/checkin/id/0`);
    expect(resp.statusCode).toBe(404);
  });
});

/************************************** GET /checkin/user/:username */

describe("GET /checkin/user/:username", function () {
  test("works: should retrieve check in data based on username", async function () {
    const resp = await request(app).get(`/checkin/user/u1`);
    expect(resp.body).toEqual([
      {
        username: "u1",
        id: expect.any(Number),
        discId: "12345",
        courseName: "Course1",
        city: "City1",
        state: "State1",
        zip: "11111",
        date: expect.any(String),
        country: "United States",
        latitude: expect.any(String),
        longitude: expect.any(String),
        note: null,
      },
    ]);
  });
});

/************************************** DELETE /checkin/:id */

describe("DELETE /checkin/:id", function () {
  test("works for admin: should delete check in", async function () {
    const checkins = await request(app).get("/checkin");
    const id = checkins.body.results[0].id;
    const doDelete = await request(app)
      .delete(`/checkin/${id}`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(doDelete.statusCode).toBe(204);
    // be sure it's deleted!
    const resp = await request(app).get(`/checkin/id/${id}`);
    expect(resp.statusCode).toBe(404);
  });
  test("unauth for non-admin", async function () {
    const checkins = await request(app).get("/checkin");
    const id = checkins.body.results[0].id;
    const resp = await request(app)
      .delete(`/checkin/${id}`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toBe(401);
  });
  test("unauth for non-admin", async function () {
    const checkins = await request(app).get("/checkin");
    const id = checkins.body.results[0].id;
    const resp = await request(app).delete(`/checkin/${id}`);
    expect(resp.statusCode).toBe(401);
  });
});
