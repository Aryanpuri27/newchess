const express = require("express");
const AuthController = require("../controllers/AuthController");

const Router = express.Router();
const boardController = require("../controllers/boardController");
console.log("router");

// Router.route("/:id").get(boardController.getboard);
Router.route("/").get(AuthController.protect, boardController.getboard);

module.exports = Router;
