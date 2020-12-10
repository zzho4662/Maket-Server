const express = require("express");
const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });
const fileupload = require("express-fileupload");
const path = require("path");

const users = require("./routes/users");
const posts = require("./routes/posts");
// const follows = require("./routes/follows");

const app = express();

app.use(express.json());
app.use(fileupload());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/v1/users", users);
app.use("/api/v1/posts", posts);
// app.use("/api/v1/follows", follows);

const PORT = process.env.PORT || 6200;

app.listen(PORT, console.log("6200"));