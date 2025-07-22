// src/backend/models/BudgetModel.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

// Define a simpler Budget model
const Budget = sequelize.define('Budget', {
  // Basic fields only
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  income: { 
    type: DataTypes.FLOAT, 
    allowNull: false,
    defaultValue: 0
  },
  category: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  expense: { 
    type: DataTypes.FLOAT, 
    allowNull: false,
    defaultValue: 0
  }
  // Removing the complex categories field for now
});

module.exports = Budget;