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

/************************************** GET /discs */

describe("GET /discs", function () {
  test("works: retrieves all discs", async function () {
    const resp = await request(app).get("/discs");
    expect(resp.statusCode).toBe(200);
    expect(resp.body.length).toBe(3);
  });
  test("works: retrieves all discs with id query param", async function () {
    const resp = await request(app).get("/discs?id=12345");
    expect(resp.statusCode).toBe(200);
    expect(resp.body.length).toBe(1);
  });
  test("works: retrieves all discs with manufacturer query param", async function () {
    const resp = await request(app).get("/discs?manufacturer=Manufacturer3");
    expect(resp.statusCode).toBe(200);
    expect(resp.body.length).toBe(1);
  });
  test("works: retrieves all discs with plastic query param", async function () {
    const resp = await request(app).get("/discs?plastic=Plastic1");
    expect(resp.statusCode).toBe(200);
    expect(resp.body.length).toBe(1);
  });
});

/************************************** GET /discs/:id */

describe("GET /discs/:id", function () {
  test("works: retrieves disc", async function () {
    const resp = await request(app).get("/discs/12345");
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toEqual({
      id: "12345",
      manufacturer: "Manufacturer1",
      plastic: "Plastic1",
      name: "Name1",
      imgUrl: null,
    });
  });
  test("errors on invalid id", async function () {
    const resp = await request(app).get("/discs/0");
    expect(resp.statusCode).toBe(404);
  });
});

/************************************** PATCH /discs/:id */

describe("PATCH /discs/:id", function () {
  test("works for admin: updates disc info", async function () {
    const resp = await request(app)
      .patch("/discs/12345")
      .send({
        manufacturer: "Manufacturer1-update",
        plastic: "Plastic1-update",
        name: "Name1-update",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toEqual({
      message: expect.any(String),
    });
    const updatedDiscResp = await request(app).get("/discs/12345");
    expect(updatedDiscResp.body).toEqual({
      id: "12345",
      manufacturer: "Manufacturer1-update",
      plastic: "Plastic1-update",
      name: "Name1-update",
      imgUrl: null,
    });
  });
  test("unauth for non admins", async function () {
    const resp = await request(app)
      .patch("/discs/12345")
      .send({
        name: "Name1-update",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toBe(401);
  });
  test("unauth for anon user", async function () {
    const resp = await request(app).patch("/discs/12345").send({
      name: "Name1-update",
    });
    expect(resp.statusCode).toBe(401);
  });
});

/************************************** POST /discs */

describe("POST /discs", function () {
  const newDisc = {
    id: "101010",
    name: "test-name",
    manufacturer: "test-manufacturer",
    plastic: "test-plastic",
  };
  test("works for admin: creates disc", async function () {
    const resp = await request(app)
      .post("/discs")
      .send(newDisc)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toBe(201);
    expect(resp.body).toEqual({ Created: { ...newDisc, imgUrl: null } });
  });
  test("unauth for non-admins", async function () {
    const resp = await request(app)
      .post("/discs")
      .send(newDisc)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toBe(401);
  });
  test("unauth for anon user", async function () {
    const resp = await request(app).post("/discs").send(newDisc);
    expect(resp.statusCode).toBe(401);
  });
});

describe("DELETE /discs", function () {
  test("works for admin: disc is deleted", async function () {
    const resp = await request(app)
      .delete("/discs/12345")
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toBe(204);
    // ensure it's deleted
    const result = await request(app).get("/discs/12345");
    expect(result.statusCode).toBe(404);
  });
  test("unauth for non-admins", async function () {
    const resp = await request(app)
      .delete("/discs/12345")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toBe(401);
  });
  test("unauth for anon user", async function () {
    const resp = await request(app).delete("/discs/12345");
    expect(resp.statusCode).toBe(401);
  });
});
