const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const collectionRouter = require("./router/collectionRoutes");

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

/** middleware */
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.disable("x-powered-by");

/** API Routes */
app.use("/api", collectionRouter);

app.get("/", (req, res) => {
  res.send("Express + TypeScript Server");
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
