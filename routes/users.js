// routes for users

const jsonschema = require("jsonschema");
const userNew = require("../schema/userNew.json");
const express = require("express");
const {
  ensureCorrectUserOrAdmin,
  ensureAdmin,
  ensureSuperAdmin,
} = require("../middleware/auth");
const { paginatedResults } = require("../helpers/paginatedResults");
const { BadRequestError } = require("../expressError");
const User = require("../models/user");
const { createToken } = require("../helpers/tokens");
const router = new express.Router();

// GET /
// Gets list of all users, admin required
router.get("/", ensureAdmin, async function (req, res, next) {
  const nameLike = req.query.nameLike || null;
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const result = await User.getAll(nameLike);
    return res.json(paginatedResults(result, page, limit));
  } catch (err) {
    return next(err);
  }
});

// GET /admins
// Gets list of all admin users, super admin required
router.get("/admins", ensureSuperAdmin, async function (req, res, next) {
  const nameLike = req.query.nameLike || null;
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const result = await User.getAllAdmins(nameLike);
    return res.json(paginatedResults(result, page, limit));
  } catch (err) {
    return next(err);
  }
});

// GET /:username
// Gets basic user information
// Will output full data for admin or correct user
router.get("/:username", async function (req, res, next) {
  const user = res.locals.user;
  try {
    const result =
      user && (user.isAdmin || user.username == req.params.username)
        ? await User.adminGetUser(req.params.username)
        : await User.getUser(req.params.username);
    return res.json(result);
  } catch (err) {
    return next(err);
  }
});

// PATCH /:username
// Edit user data, admin required or logged in user
router.patch(
  "/:username",
  ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    try {
      const result = await User.updateUser(req.params.username, req.body);
      return res.json(result);
    } catch (err) {
      return next(err);
    }
  }
);
// PATCH /:username/admin
// Edit user data, admin required
router.patch("/:username/admin", ensureAdmin, async function (req, res, next) {
  try {
    const result = await User.adminUpdateUser(req.params.username, req.body);
    return res.json(result);
  } catch (err) {
    return next(err);
  }
});

// POST /new
// --- THIS IS NOT THE ROUTE FOR USERS TO REGISTER. THIS IS FOR ADMINS TO EXPLICITLY CREATE USERS & ADMIN USERS.
// Auth: Admin ONLY
router.post("/new", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userNew);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }
    const user = await User.adminRegister(req.body);
    const token = createToken(user);
    return res.status(201).json({ user, token });
  } catch (err) {
    return next(err);
  }
});

// DELETE /:username
// Deletes user from DB.
// Auth required: Admin ONLY
router.delete("/:username", ensureAdmin, async function (req, res, next) {
  try {
    await User.deleteUser(req.params.username);
    return res
      .status(200)
      .json({ message: `User of username ${req.params.username} deleted!` });
  } catch (err) {
    return next(err);
  }
});

// PATCH /:username/image
// updates user with provided image url
// Auth required: admin or correct user.
router.patch(
  "/:username/image",
  ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    try {
      const result = await User.uploadProfileImg(
        req.params.username,
        req.body.url
      );
      return res.json(result);
    } catch (err) {
      return next(err);
    }
  }
);

// DELETE /:username/image
// deletes provided image url from cloudinary service
// Auth required: admin or correct user.
router.delete(
  "/:username/image",
  ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    const publicId = req.query.id;
    try {
      await User.deleteProfileImg(publicId);
      return res.status(200).json({ message: `Image deleted!` });
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /:username/image/reset
// reset image_url to null for user
// auth required: admin OR correct user
router.patch(
  "/:username/image/reset",
  ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    const username = req.params.username;
    try {
      const result = await User.resetProfileImg(username);
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /:username/auth/reset
// reset PW, send temporary password to user
router.patch("/:username/auth/reset", async function (req, res, next) {
  try {
    await User.resetPassword(req.params.username);
    return res.json({ message: "Password sent to email on file." });
  } catch (err) {
    return next(err);
  }
});

// PATCH /:username/changepassword
// change password
// Auth required: ADMIN/that logged in user only
router.patch(
  "/:username/auth/change",
  ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    try {
      await User.changePassword(req.params.username, req.body.password);
      return res.status(201).json({ message: `Password change successful!` });
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
