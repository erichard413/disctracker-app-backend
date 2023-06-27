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

/************************************** GET /users */

describe("GET /users", function(){
    test("works for admins: gets list of all users", async function () {
        const resp = await request(app).get("/users").set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toBe(200);
        expect(resp.body.results.length).toEqual(3);
    })
    test("unauth for non-admins", async function() {
        const resp = await request(app).get("/users").set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toBe(401);
    })
    test("unauth for no token", async function() {
        const resp = await request(app).get("/users")
        expect(resp.statusCode).toBe(401);
    })
})

/************************************** GET /users/:username */

describe("GET /users/:username", function(){
    test("works for admins: gets single user data", async function() {
        const resp = await request(app).get("/users/u1").set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({
            username: 'u1',
            firstName: 'U1F',
            lastName: 'U1L',
            joinDate: expect.any(String),
            email: 'user1@user.com',
            isAdmin: false
          })
    })
    test("works for correct user: gets data", async function() {
        const resp = await request(app).get("/users/u1").set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({
            username: 'u1',
            firstName: 'U1F',
            lastName: 'U1L',
            joinDate: expect.any(String),
            email: 'user1@user.com',
            isAdmin: false
        })
    })
    test("unauth for non-user", async function() {
        const resp = await request(app).get("/users/u1").set("authorization", `Bearer ${u2Token}`);
        expect(resp.statusCode).toBe(401);
    })
    test("unauth for anon", async function() {
        const resp = await request(app).get("/users/u1");
        expect(resp.statusCode).toBe(401);
    })
})

/************************************** PATCH /users/:username */

describe("PATCH /users/:username", function(){
    test("works for admins: updates user data", async function(){
        const resp = await request(app).patch("/users/u1").send({
            firstName: 'U1F-updated',
            lastName: 'U1L-updated',
            email: 'user1updated@user.com'
        }).set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({
            username: 'u1',
            firstName: 'U1F-updated',
            lastName: 'U1L-updated',
            joinDate: expect.any(String),
            email: 'user1updated@user.com',
            isAdmin: false
        })
    })
    test("works for that user", async function(){
        const resp = await request(app).patch("/users/u1").send({
            firstName: 'U1F-updated',
            lastName: 'U1L-updated',
            email: 'user1updated@user.com'
        }).set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({
            username: 'u1',
            firstName: 'U1F-updated',
            lastName: 'U1L-updated',
            joinDate: expect.any(String),
            email: 'user1updated@user.com',
            isAdmin: false
        })
    })
    test("unauth for non-user", async function(){
        const resp = await request(app).patch("/users/u1").send({
            firstName: 'U1F-updated',
            lastName: 'U1L-updated',
            email: 'user1updated@user.com'
        }).set("authorization", `Bearer ${u2Token}`);
        expect(resp.statusCode).toBe(401);
    })
    test("unauth for anon", async function(){
        const resp = await request(app).patch("/users/u1").send({
            firstName: 'U1F-updated',
            lastName: 'U1L-updated',
            email: 'user1updated@user.com'
        })
        expect(resp.statusCode).toBe(401);
    })
})

/************************************** PATCH /users/:username/admin */

describe("PATCH /users/:username/admin", function(){
    test("works for admins: set user as admin", async function(){
        const resp = await request(app).patch("/users/u1/admin").send({
            isAdmin: true
        }).set('authorization', `Bearer ${adminToken}`);
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({
            username: 'u1',
            firstName: 'U1F',
            lastName: 'U1L',
            joinDate: expect.any(String),
            email: 'user1@user.com',
            isAdmin: true
        })
    })
    test("unauth for that non-admin user", async function(){
        const resp = await request(app).patch("/users/u1/admin").send({
            isAdmin: true
        }).set('authorization', `Bearer ${u1Token}`);
        expect(resp.statusCode).toBe(401);
    })
    test("unauth for non-admin user", async function(){
        const resp = await request(app).patch("/users/u1/admin").send({
            isAdmin: true
        }).set('authorization', `Bearer ${u2Token}`);
        expect(resp.statusCode).toBe(401);
    })
    test("unauth for non user", async function (){
        const resp = await request(app).patch("/users/u1/admin")
        expect(resp.statusCode).toBe(401);
    })
})

/************************************** POST /users/new */

describe("POST /users/new", function () {
    test("works for admins: create non-admin", async function () {
      const resp = await request(app)
          .post("/users/new")
          .send({
            username: "u-new",
            firstName: "First-new",
            lastName: "Last-newL",
            password: "password-new",
            email: "new@email.com",
            isAdmin: false,
          })
          .set("authorization", `Bearer ${adminToken}`);
      expect(resp.statusCode).toEqual(201);
      expect(resp.body).toEqual({
        user: {
          username: "u-new",
          firstName: "First-new",
          lastName: "Last-newL",
          email: "new@email.com",
          joinDate: expect.any(String),
          isAdmin: false,
        }, token: expect.any(String),
      });
    });
  
    test("works for admins: create admin", async function () {
      const resp = await request(app)
          .post("/users/new")
          .send({
            username: "u-new",
            firstName: "First-new",
            lastName: "Last-newL",
            password: "password-new",
            email: "new@email.com",
            isAdmin: true,
          })
          .set("authorization", `Bearer ${adminToken}`);
      expect(resp.statusCode).toEqual(201);
      expect(resp.body).toEqual({
        user: {
          username: "u-new",
          firstName: "First-new",
          joinDate: expect.any(String),
          lastName: "Last-newL",
          email: "new@email.com",
          isAdmin: true,
        }, token: expect.any(String),
      });
    });
  
    test("unauth for users", async function () {
      const resp = await request(app)
          .post("/users/new")
          .send({
            username: "u-new",
            firstName: "First-new",
            lastName: "Last-newL",
            password: "password-new",
            email: "new@email.com",
            isAdmin: true,
          })
          .set("authorization", `Bearer ${u1Token}`);
      expect(resp.statusCode).toEqual(401);
    });
  
    test("unauth for anon", async function () {
      const resp = await request(app)
          .post("/users/new")
          .send({
            username: "u-new",
            firstName: "First-new",
            lastName: "Last-newL",
            password: "password-new",
            email: "new@email.com",
            isAdmin: true,
          });
      expect(resp.statusCode).toEqual(401);
    });
  
    test("bad request if missing data", async function () {
      const resp = await request(app)
          .post("/users/new")
          .send({
            username: "u-new",
          })
          .set("authorization", `Bearer ${adminToken}`);
      expect(resp.statusCode).toEqual(400);
    });
  
    test("bad request if invalid data", async function () {
      const resp = await request(app)
          .post("/users/new")
          .send({
            username: "u-new",
            firstName: "First-new",
            lastName: "Last-newL",
            password: "password-new",
            email: "not-an-email",
            isAdmin: true,
          })
          .set("authorization", `Bearer ${adminToken}`);
      expect(resp.statusCode).toEqual(400);
    });
  });

/************************************** DELETE /users/:username */

describe("should delete user from db", function(){
    test("works for admins: should delete user from db", async function(){
        await request(app).delete("/users/u1").set("authorization", `Bearer ${adminToken}`);
        const resp = await request(app).get("/users/u1").set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toBe(404);
    })
    test("unauth for that non-admin user", async function() {
        const resp = await request(app).delete("/users/u1").set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toBe(401);
    })
    test("unauth for other non-admin user", async function() {
        const resp = await request(app).delete("/users/u1").set("authorization", `Bearer ${u2Token}`);
        expect(resp.statusCode).toBe(401);
    })
    test("unauth for anon user", async function() {
        const resp = await request(app).delete("/users/u1")
        expect(resp.statusCode).toBe(401);
    })
})

