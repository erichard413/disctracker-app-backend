"use strict";

const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");
const db = require("../db.js");
const User = require("./user.js");
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

/************************************** authenticate */

describe("authenticate", function () {
    test("works", async function (){
        const result = await User.authenticate("u1", "password1");
        expect(result).toEqual({
            username: "u1",
            firstName: "U1F",
            lastName: "U1L",
            email: "user1@user.com",
            isAdmin: false
        });
    });
    test("unauth if no such user", async function () {
        try {
            await User.authenticate("nope", "password");
            fail();
        } catch (err) {
            expect(err instanceof UnauthorizedError).toBeTruthy();
        }
    });
    test("unauth if wrong password", async function () {
        try {
          await User.authenticate("c1", "wrong");
          fail();
        } catch (err) {
          expect(err instanceof UnauthorizedError).toBeTruthy();
        }
      }); 
});

/************************************** register */

describe("register", function () {
    const newUser = {
      username: "new",
      firstName: "Test",
      lastName: "Tester",
      email: "test@test.com",
    };
  
    test("works", async function () {
      let user = await User.register({
        ...newUser,
        password: "password",
      });
      expect(user).toEqual({...newUser, joinDate: expect.any(String), isAdmin: false          
      });
      const found = await db.query("SELECT * FROM users WHERE username = 'new'");
      expect(found.rows.length).toEqual(1);
      expect(found.rows[0].is_admin).toEqual(false);
      expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
    });
  
    test("bad request with dup data", async function () {
      try {
        await User.register({
          ...newUser,
          password: "password",
        });
        await User.register({
          ...newUser,
          password: "password",
        });
        fail();
      } catch (err) {
        expect(err instanceof BadRequestError).toBeTruthy();
      }
    });
    test("admin register", async function(){
        const newAdminUser = {
            username: "newadmin",
            firstName: "Test",
            lastName: "Admin",
            email: "admin@email.com",
            isAdmin: true,
        }
        let adminUser = await User.adminRegister({...newAdminUser, password: "password" });
        expect(adminUser).toEqual({...newAdminUser, joinDate: expect.any(String), isAdmin: true});
    })
  }); 
/************************************** update user */

describe("works: updates user", function(){
    test("should update information for user", async function(){
      let data = {
      firstName: "U1F-UPDATE",
      lastName: "U1L",
      email: "update@user.com"
      }
      const result = await User.updateUser("u1", data);
      expect(result).toEqual({
        username: "u1",
        firstName: "U1F-UPDATE",
        lastName: "U1L",
        email: "update@user.com",
        joinDate: expect.any(String),
        isAdmin: false
      })
    })
    test("should throw error if no user", async function(){
      let data = {
        firstName: "U1F-UPDATE",
        lastName: "U1L",
        email: "update@user.com",
        }
        try {
          await User.updateUser("blah", data);
        } catch(err) {
          expect(err instanceof NotFoundError).toBeTruthy();
        }
    })
    test("admin update user - can change passwords & set admin status", async function(){
        let data = {
            isAdmin: true
        }
        const user = await User.getUser("u1");
        expect(user.isAdmin).not.toBeTruthy();
        const result = await User.adminUpdateUser("u1", data);
        expect(result.isAdmin).toBeTruthy();
    })
})

/************************************** get user data */

describe("works: retrieves user data for username", function (){
    test("should retrieve data for user", async function(){
      const result = await User.getUser("u1");
      expect(JSON.stringify(result)).toContain("u1")
    })
    test("should throw error if no username exists", async function(){
      try {
        await User.getUser("blah");
      } catch(err) {
        expect(err instanceof NotFoundError);
      }
    })
  })

/************************************** get ALL users */

describe("works: gets all user data", function() {
    test("should retrieve all users", async function() {
        const result = await User.getAll();
        expect(result.length).toBeGreaterThan(1)
        expect(result).toEqual(expect.any(Array));
    })
})

/************************************** delete user */

describe("works: deletes user by username", function(){
    test("should delete user", async function() {
        //verify that user exists
        const user = await User.getUser("u1");
        expect(user.username).toEqual("u1");
        await User.deleteUser("u1");
        //now this user will not be retrieved, and throw an error.
        try {
           await User.getUser("u1"); 
        } catch (err) {
            expect(err);
        }    
    })
    test("throws error if user not found", async function() {
        try {
            await User.deleteUser("blahhh")
        } catch(err) {
            expect(err)
        }
    })
})

/************************************** reset password */

describe("works: reset password to random string", function(){
    test("should reset the password", async function(){
        const newUser = {
            username: "newuser",
            firstName: "Test",
            lastName: "Tester",
            email: "test@test.com",
            password: "password"
        };
        const createdUser = await User.register(newUser);
        // using UserMock, so email is not sent.
        await UserMock.resetPassword("newuser");
        // password was changed, so user should now not be able to get logged in with "password"
        try {
            await User.authenticate("newuser", "password");
            fail();
        } catch (err) {
            expect(err instanceof UnauthorizedError).toBeTruthy();
        }
    })
})

/************************************** retrieve user ID */

describe("works: retrieves user id with given email & first name", function () {
    test("should retrieve username on verification", async function(){
        const result = await User.forgotUserId("user1@user.com", "U1F");
        expect(result).toEqual('u1');
    });
    test("should throw error if data is not valid", async function () {
        try {
            await User.forgotUserId("user1@user.com", "bad");
        } catch(err) {
            expect(err).toBeInstanceOf(BadRequestError)
        }
    })
    test("throws error on email not found", async function(){
        try {
            await User.forgotUserId("blah@blah.com", "U1F");
        } catch(err) {
            expect(err).toBeInstanceOf(NotFoundError);
        } 
    })
})

/************************************** change password */

describe("works: resets password for user", function() {
    test("should reset the password", async function(){
        //verify that user auth works with "password"
        const auth = await User.authenticate("u1", "password1");
        expect(auth);
        //now change password
        await User.changePassword("u1", "newpassword");
        //now log in with old password - this will fail
        try {
            await User.authenticate("u1", "password1");
        } catch(err) {
            expect(err);
        }
        //log in with new password
        const loggedIn = await User.authenticate("u1", "newpassword");
        expect(loggedIn.username).toBe("u1");
    })
})




