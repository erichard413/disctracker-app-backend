"use strict";

const db = require("../db");
const { sqlForPartialUpdate } = require("../helpers/sql");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

class Disc {
  static async getDiscs(data = null) {
    //If there's no req.body in the search, return all discs.
    // otherwise, we need to handle our search
    const queryParams = [];
    const { id, manufacturer, plastic, name } = data;
    let queryString = `SELECT id, manufacturer, plastic, name, image_url AS "imgUrl" FROM discs`;
    if (id) {
      queryString += queryParams.length > 0 ? " AND" : " WHERE";
      queryString += ` id=$${queryParams.length + 1}`;
      queryParams.push(id);
    }
    if (!id && name) {
      queryString += queryParams.length > 0 ? " AND" : " WHERE";
      queryString += ` name ILIKE $${queryParams.length + 1}`;
      queryParams.push(`%${name}%`);
    }
    if (!id && manufacturer) {
      queryString += queryParams.length > 0 ? " AND" : " WHERE";
      queryString += ` manufacturer ILIKE $${queryParams.length + 1}`;
      queryParams.push(`%${manufacturer}%`);
    }

    if (!id && plastic) {
      queryString += queryParams.length > 0 ? " AND" : " WHERE";
      queryString += ` plastic ILIKE $${queryParams.length + 1}`;
      queryParams.push(`%${plastic}%`);
    }
    const result = await db.query(queryString, queryParams);
    return result.rows;
  }
  static async createDisc({ id, manufacturer, plastic, name, imgUrl }) {
    const duplicateCheck = await db.query(
      `SELECT name FROM discs WHERE id=$1`,
      [id]
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Disc id ${id} already exists!`);
    }
    const result = await db.query(
      `INSERT INTO discs (id, manufacturer, plastic, name, image_url) VALUES ($1,$2,$3,$4,$5) RETURNING id, manufacturer, plastic, name, image_url AS "imgUrl"`,
      [id, manufacturer, plastic, name, imgUrl]
    );
    return result.rows[0];
  }
  static async deleteDisc(id) {
    const idCheck = await db.query(`SELECT name FROM discs WHERE id=$1`, [id]);
    if (!idCheck.rows[0])
      throw new NotFoundError(`Couldn't find disc with id of ${id}`);
    await db.query(`DELETE FROM discs WHERE id=$1`, [id]);
    return;
  }
  static async getDisc(id) {
    const result = await db.query(`SELECT * FROM discs WHERE id=$1`, [id]);
    if (!result.rows[0])
      throw new NotFoundError(`Couldn't find disc with id of ${id}`);
    return result.rows[0];
  }
  static async editInfo(id, data) {
    data["image_url"] = data.imgUrl;
    delete data["imgUrl"];
    const { setCols, values } = sqlForPartialUpdate(data, {});
    const idVarIdx = "$" + (values.length + 1);
    const querySQL = `UPDATE discs SET ${setCols} WHERE id = ${idVarIdx} RETURNING id, manufacturer, plastic, name, image_url AS "imgUrl"`;
    const result = await db.query(querySQL, [...values, id]);
    const disc = result.rows[0];
    if (!disc) throw new NotFoundError(`No disc of id ${id}`);
    return disc;
  }
}

module.exports = Disc;
