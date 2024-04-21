const mongoose = require("mongoose");

async function connect() {
  const db = await mongoose.connect(process.env.DATABASE_URI);
  console.log("Database Connected");
  return db;
}

module.exports = connect;
