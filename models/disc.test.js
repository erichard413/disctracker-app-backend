"use strict";

const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");
const db = require("../db.js");
const Disc = require("./disc.js");

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

/************************************** get all discs */

describe("works: get all discs", function(){
    test("should retrieve all discs", async function(){
        const result = await Disc.getAll();
        expect(result.length).toEqual(3);
        expect(result[0].id).toBe(12345);
        expect(result[1].name).toBe('Name2');
        expect(result[2].manufacturer).toBe('Manufacturer3');
    })
})

/************************************** create disc */

describe("works: creates disc", function(){
    test("should create a new disc", async function(){
        const newDisc = {
            id: 78901,
            manufacturer: 'Manufacturer4',
            plastic: "Plastic4",
            name: "Name4"
        }
        const result = await Disc.createDisc(newDisc);
        expect(result).toEqual(newDisc);
    })
})

/************************************** delete disc */

describe("works: deletes disc", function(){
    test("should delete disc", async function(){
        //disc id 12345 should be in database, delete it.
        await Disc.deleteDisc('12345');
        //verify that disc has been deleted
        try {
            await Disc.getDisc('12345');
        } catch(err) {
            expect(err).toBeInstanceOf(NotFoundError);
        }
    });
    test("should throw error on bad id", async function(){
        try {
            await Disc.deleteDisc('00000')
        } catch(err) {
            expect(err).toBeInstanceOf(NotFoundError);
        }
    })
})

/************************************** get disc by id */

describe("works: gets disc with id", function(){
    test("should retrieve a disc with id", async function(){
        const result = await Disc.getDisc('67891');
        expect(result).toEqual({
            id: 67891,
            manufacturer: "Manufacturer2",
            plastic: "Plastic2",
            name: "Name2"
          });
    })
    test("should throw error on bad id", async function(){
        try {
            await Disc.getDisc('00000')
        } catch(err) {
            expect(err).toBeInstanceOf(NotFoundError);
        }
    })
})

/************************************** edit disc */

describe("works: edits disc with id", function() {
    test("should update disc information", async function(){
        const result = await Disc.editInfo('12345', {
            name: "Updated-Name1"
        })
        expect(result.name).toEqual('Updated-Name1');
    })
    test("should throw an error if given bad id", async function(){
        try {
            await Disc.getDisc('00000')
        } catch(err) {
            expect(err).toBeInstanceOf(NotFoundError);
        }
    })

})



