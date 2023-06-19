const express = require("express");

const Router = express.Router();
const AuthController = require("../controllers/AuthController");
const loginController = require("../controllers/loginController");

Router.route("/signup").post(AuthController.signUp);
Router.route("/login").post(AuthController.login);
Router.route("/loginpage").get(loginController.loginpage);

module.exports = Router;
