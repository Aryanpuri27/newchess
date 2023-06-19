const express = require("express");
const cookieParser = require("cookie-parser");
const homeRoute = require("./router/homeRouter");
const userRoute = require("./router/userRouter");
const boardRoute = require("./router/boardRouter");
const app = express();

app.use(express.static(__dirname + "/static"));
app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set("view engine", "ejs");

app.use("/user", userRoute);
app.use("/home", homeRoute);
app.use("/board", boardRoute);
module.exports = app;
