"use strict";

const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");
const db = require("../db.js");
const CheckIn = require("./checkin.js");
const CheckInMock = require("../mocks/checkinmock.js");

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

/************************************** get check ins */

describe("works: should retrieve all check ins", function () {
  test("should retrieve check ins", async function () {
    const result = await CheckIn.getAll();
    expect(result.length).toEqual(3);
  });
});

/************************************** do check in */
describe("works: should do check in", function () {
  test("should add check in", async function () {
    const newCheckIn = {
      courseName: "NewCheckIn",
      city: "NewCity",
      state: "NewState",
      zip: "NewZip",
      country: "NewCountry",
      note: "I am a note",
    };
    await CheckInMock.doCheckIn("12345", "u1", newCheckIn);
    // now check to see if new entry exists in db.
    const result = await CheckIn.getAll();
    expect(result[0]).toEqual({
      ...newCheckIn,
      id: expect.any(Number),
      username: "u1",
      discId: "12345",
      date: expect.any(String),
      latitude: expect.any(String),
      longitude: expect.any(String),
    });
  });
});

/************************************** get check in by disc id */
describe("works: should retrieve all check ins for disc id", function () {
  test("should get all check ins for disc id", async function () {
    const result = await CheckIn.getCheckInsByDisc("12345");
    // should only be one check in, so check for that.
    expect(result.length).toEqual(1);
  });
  test("should throw error on incorrect disc id", async function () {
    try {
      await CheckIn.getCheckInsByDisc("00000");
    } catch (err) {
      expect(err).toBeInstanceOf(NotFoundError);
    }
  });
});

/************************************** delete check in by id */
describe("works: should delete check in", function () {
  test("should delete check in", async function () {
    const newCheckIn = {
      courseName: "NewCheckIn",
      city: "NewCity",
      state: "NewState",
      zip: "NewZip",
      country: "NewCountry",
    };
    await CheckInMock.doCheckIn("12345", "u1", newCheckIn);
    const checkins = await CheckIn.getAll();
    // now let's delete it.
    await CheckIn.deleteCheckIn(checkins[checkins.length - 1].id);
    // now check to make sure it's deleted - should error
    try {
      await CheckIn.getCheckInById(checkins[checkins.length - 1].id);
    } catch (err) {
      expect(err).toBeInstanceOf(NotFoundError);
    }
  });
  test("should throw error if ID does not exist", async function () {
    try {
      await CheckIn.deleteCheckIn("0");
    } catch (err) {
      expect(err).toBeInstanceOf(NotFoundError);
    }
  });
});

/************************************** update check in */
describe("works: should update check in", function () {
  test("should update check in", async function () {
    const checkins = await CheckIn.getAll();
    await CheckInMock.updateCheckIn(checkins[checkins.length - 1].id, {
      courseName: "updatedCourseName",
      city: "updatedCity",
      state: "updatedState",
      zip: "11111",
    });
    const result = await CheckIn.getCheckInById(
      checkins[checkins.length - 1].id
    );
    expect(result.courseName).toEqual("updatedCourseName");
    expect(result.city).toEqual("updatedCity");
    expect(result.state).toEqual("updatedState");
  });
  test("should throw error if not existing id", async function () {
    try {
      await CheckInMock.updateCheckIn("0", {});
    } catch (err) {
      expect(err).toBeInstanceOf(NotFoundError);
    }
  });
  test("should throw error if no city, state & zip are provided", async function () {
    const checkins = await CheckIn.getAll();
    try {
      await CheckInMock.updateCheckIn(checkins[checkins.length - 1].id, {
        courseName: "test",
      });
    } catch (err) {
      expect(err).toBeInstanceOf(BadRequestError);
    }
  });
});

/************************************** get check in by id */
describe("works: should retrieve check in by id", function () {
  test("retrieves check in of id", async function () {
    const checkins = await CheckIn.getAll();
    const result = await CheckIn.getCheckInById(checkins[0].id);
    expect(result.courseName).toEqual("Course3");
    expect(result.city).toEqual("City3");
    expect(result.state).toEqual("State3");
  });
  test("errors when bad id", async function () {
    try {
      await CheckIn.getCheckInById("0");
    } catch (err) {
      expect(err).toBeInstanceOf(NotFoundError);
    }
  });
});

/************************************** get check in by id */
describe("works: should retrieve check in by username", function () {
  test("retrieves check in of username", async function () {
    const result = await CheckIn.getCheckInsByUser("u1");
    expect(result[0].username).toEqual("u1");
    expect(result[0].courseName).toEqual("Course1");
  });
  test("errors when bad username", async function () {
    try {
      await CheckIn.getCheckInsByUser("blah");
    } catch (err) {
      expect(err).toBeInstanceOf(NotFoundError);
    }
  });
});
