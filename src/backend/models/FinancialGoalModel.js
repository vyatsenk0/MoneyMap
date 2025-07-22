// src/backend/models/FinancialGoal.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');  // Import sequelize from database.js

const FinancialGoal = sequelize.define('FinancialGoal', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  targetAmount: { type: DataTypes.FLOAT, allowNull: false },
  category: { type: DataTypes.STRING, allowNull: false },
  recurring: { type: DataTypes.BOOLEAN, defaultValue: false },
  incomeAmount: { type: DataTypes.FLOAT },
  frequency: { type: DataTypes.STRING },
  targetDate: { type: DataTypes.DATE, allowNull: false },
});

module.exports = FinancialGoal;
