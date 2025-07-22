// src/backend/services/GoalService.js
const FinancialGoal = require('../models/FinancialGoalModel');
const { sequelize } = require('../database'); 

class GoalService {
  // Method to create a financial goal
  async createGoal(goalData) {
    try {
      const newGoal = await FinancialGoal.create(goalData);
      return { success: true, goal: newGoal };  // Return success with the created goal
    } catch (error) {
      console.error('Error creating goal:', error);
      return { error: 'Failed to create goal.' };  // Structured error response
    }
  }

  // Method to get all financial goals
  async getGoals() {
    try {
      const goals = await FinancialGoal.findAll();
      return { success: true, goals };  // Return success with goals data
    } catch (error) {
      console.error('Error retrieving goals:', error);
      return { error: 'Failed to retrieve goals.' };  // Structured error response
    }
  }

  // Method to update a financial goal
  async updateGoal(id, updatedData) {
    try {
      const [updatedCount] = await FinancialGoal.update(updatedData, { where: { id } });
      if (updatedCount > 0) {
        return { success: true };  // Return success if the goal was updated
      } else {
        return { error: 'Goal not found or not updated.' };  // Error if no rows were updated
      }
    } catch (error) {
      console.error('Error updating goal:', error);
      return { error: 'Failed to update goal.' };  // Structured error response
    }
  }

  // Method to delete a financial goal
  async deleteGoal(id) {
  try {
    console.log(`Attempting to delete goal with ID: ${id}`);  // Debugging
    const deletedCount = await FinancialGoal.destroy({ where: { id: parseInt(id) } });
    if (deletedCount > 0) {
      return { success: true };
    } else {
      console.error(`No goal found with ID: ${id}`);  // Debugging
      return { error: 'Goal not found or not deleted.' };
    }
  } catch (error) {
    console.error('Error deleting goal:', error);
    return { error: 'Failed to delete goal.' };
  }
}

}

module.exports = new GoalService();  // Export an instance for direct usage
