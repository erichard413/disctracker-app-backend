"use strict";

const express = require("express");
const router = new express.Router();
const jsonschema = require("jsonschema");
const { BadRequestError } = require("../expressError");
const Disc = require("../models/disc");
const discNew = require("../schema/discNew.json");
const discUpdate = require("../schema/discUpdate.json");
const { ensureAdmin } = require("../middleware/auth");
const { paginatedResults } = require("../helpers/paginatedResults");

// GET /all
// This route will get all tracked discs from Db.
router.get("/", async function (req, res, next) {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  try {
    const result = await Disc.getAll();
    if (page && limit) {
      return res.json(paginatedResults(result, page, limit));
    } else {
      return res.json(result);
    }
  } catch {
    return next(err);
  }
});

// GET /discs/:id
// This route will get information on tracked disc of ID.
router.get("/:id", async function (req, res, next) {
  try {
    const result = await Disc.getDisc(req.params.id);
    return res.json(result);
  } catch (err) {
    return next(err);
  }
});

// PATCH /discs/:id
// This route will edit information of disc ID.
router.patch("/:id", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, discUpdate);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }
    await Disc.editInfo(req.params.id, req.body);
    return res
      .status(200)
      .json({ message: `Disc ${req.params.id} updated successfully!` });
  } catch (err) {
    return next(err);
  }
});

// POST /discs
// This route will add a new disc into the DB.
// Auth required: admin only.
router.post("/", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, discNew);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }
    const result = await Disc.createDisc(req.body);
    return res.status(201).json({ Created: { ...result } });
  } catch (err) {
    return next(err);
  }
});

// DELETE /discs/:id/delete
// This route will delete a disc from DB.
// Auth required: admin only.
router.delete("/:id", ensureAdmin, async function (req, res, next) {
  try {
    await Disc.deleteDisc(req.params.id);
    return res
      .status(204)
      .json({ message: `Disc id ${req.params.id} deleted.` });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
