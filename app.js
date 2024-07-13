const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const profleRouter = require("./router/profileRoutes");
const connect = require("./db/connect");

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

/** middleware */
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.disable("x-powered-by");

/** API Routes */
app.use("/api/profile", profleRouter);

app.get("/", (req, res) => {
  res.send("Express + TypeScript Server");
});

/** start server */

connect()
  .then(() => {
    try {
      app.listen(port, () => {
        console.log(`App listening on port ${port}`);
      });
    } catch (error) {
      console.log("Cannot connect with server");
    }
  })
  .catch((error) => {
    console.log("Database not connected", error);
  });

  module.exports = app;