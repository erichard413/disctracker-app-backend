"use strict";

const db = require('../db');
const { sqlForPartialUpdate } = require("../helpers/sql");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

class Disc {
    static async getAll() {
        const result = await db.query(`SELECT * FROM discs`);
        const discs = result.rows
        return discs;
    }
    static async createDisc({id, manufacturer, plastic, name}) {
        const duplicateCheck = await db.query(
            `SELECT name FROM discs WHERE id=$1`, [id]
          );
      
          if (duplicateCheck.rows[0]) {
            throw new BadRequestError(`Disc id ${id} already exists!`);
          }
        const result = await db.query(`INSERT INTO discs (id, manufacturer, plastic, name) VALUES ($1,$2,$3,$4) RETURNING id, manufacturer, plastic, name`, [+id, manufacturer, plastic, name]);
        return result.rows[0]; 
    }
    static async deleteDisc(id) {
        const idCheck = await db.query(`SELECT name FROM discs WHERE id=$1`,[id]);
        if (!idCheck.rows[0]) throw new NotFoundError(`Couldn't find disc with id of ${id}`)
        await db.query(`DELETE FROM discs WHERE id=$1`,[id]);
        return;
    }
    static async getDisc(id) {
        const result = await db.query(`SELECT * FROM discs WHERE id=$1`, [+id]);
        if (!result.rows[0]) throw new NotFoundError(`Couldn't find disc with id of ${id}`);
        return result.rows[0];
    }
    static async editInfo(id, data) {
        const { setCols, values } = sqlForPartialUpdate(
            data,
            {});
        const idVarIdx = "$" + (values.length +1);
        const querySQL = `UPDATE discs SET ${setCols} WHERE id = ${idVarIdx} RETURNING id, manufacturer, plastic, name`;
        const result = await db.query(querySQL, [...values, id]);
        const disc = result.rows[0];
        if (!disc) throw new NotFoundError(`No disc of id ${id}`);
        return disc;
    }
}

module.exports = Disc;