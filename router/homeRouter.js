const express = require("express");
const AuthController = require("../controllers/AuthController");

const Router = express.Router();
const homeController = require("../controllers/homeController");

Router.route("/").get(AuthController.protect, homeController.getLandingPage);

module.exports = Router;
