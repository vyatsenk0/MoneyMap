// src/backend/database.js
const { Sequelize } = require("sequelize");
const path = require("path");
const fs = require("fs");

// Create database folder if it doesn't exist
const dataFolder = path.join(
  process.env.APPDATA ||
    (process.platform == "darwin"
      ? process.env.HOME + "/Library/Preferences"
      : process.env.HOME + "/.local/share"),
  "MoneyMap"
);
if (!fs.existsSync(dataFolder)) {
  fs.mkdirSync(dataFolder);
}

// Define SQLite database file location
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.join(dataFolder, "database.sqlite"),
  logging: false, // Disable logs in the console
});

// Sync database (initialize tables)
const initializeDatabase = async () => {
  try {
    await sequelize.sync({ alter: true }); // Use 'alter' instead of 'force' to preserve data in dev environments
    console.log("Database & tables created/altered!");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
};

module.exports = { sequelize, initializeDatabase };
