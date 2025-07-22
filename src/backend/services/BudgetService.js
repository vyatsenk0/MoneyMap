// src/backend/services/BudgetService.js
const Budget = require('../models/BudgetModel');
const { sequelize } = require('../database');

class BudgetService {
  // Initialize the table
  async initTable() {
    try {
      console.log("Ensuring Budget table exists...");
      await sequelize.sync({ alter: true });
      console.log("Budget table created/verified successfully");
      return true;
    } catch (error) {
      console.error("Error creating Budget table:", error);
      return false;
    }
  }

  // Method to create a budget entry
  async createBudget(budgetData) {
    try {
      console.log('Creating budget with data:', budgetData);
      
      // Ensure table exists
      await this.initTable();
      
      // Check if we have valid data
      if (!budgetData) {
        return { 
          success: false, 
          error: 'Missing budget data' 
        };
      }
      
      // Create a simple budget entry
      const newBudget = await Budget.create({
        income: parseFloat(budgetData.income) || 0,
        category: budgetData.category || 'Uncategorized',
        expense: parseFloat(budgetData.expenseAmount) || 0
      });

      console.log('Budget created successfully:', newBudget.toJSON());

      return { 
        success: true, 
        budget: newBudget.toJSON(),
        id: newBudget.id 
      };
    } catch (error) {
      console.error('Error creating budget:', error);
      console.error('Error stack:', error.stack);
      return { 
        success: false, 
        error: 'Failed to create budget entry.',
        details: error.message 
      };
    }
  }

  // Method to get all budget entries
  async getBudget() {
    try {
      // Ensure table exists
      await this.initTable();
      
      console.log('Attempting to fetch budgets...');
      const budgets = await Budget.findAll();
      console.log('Budgets fetched successfully, count:', budgets.length);
      
      return { 
        success: true, 
        budgets: budgets.map(budget => budget.toJSON())
      };
    } catch (error) {
      console.error('Error retrieving budgets:', error);
      console.error('Error stack:', error.stack);
      return { 
        success: false, 
        error: 'Failed to retrieve budget entries.',
        details: error.message
      };
    }
  }

  // Method to update a budget entry
  async updateBudget(id, updatedData) {
    try {
      // Ensure table exists
      await this.initTable();
      
      console.log(`Updating budget ID: ${id} with data:`, updatedData);
      
      // Check if we have an ID
      if (!id) {
        return { 
          success: false, 
          error: 'Missing budget ID' 
        };
      }

      // Create update object with only valid fields
      const updateObj = {};
      if (updatedData.income !== undefined) updateObj.income = parseFloat(updatedData.income);
      if (updatedData.category !== undefined) updateObj.category = updatedData.category;
      if (updatedData.expenseAmount !== undefined) updateObj.expense = parseFloat(updatedData.expenseAmount);

      // Perform the update
      const [updatedCount] = await Budget.update(updateObj, { 
        where: { id: parseInt(id) } 
      });
      
      console.log(`Updated ${updatedCount} budget records`);
      
      if (updatedCount > 0) {
        return { success: true };
      } else {
        return { 
          success: false, 
          error: 'Budget not found or not updated.' 
        };
      }
    } catch (error) {
      console.error('Error updating budget:', error);
      console.error('Error stack:', error.stack);
      return { 
        success: false, 
        error: 'Failed to update budget entry.',
        details: error.message
      };
    }
  }

  // Method to delete a budget entry
  async deleteBudget(id) {
    try {
      // Ensure table exists
      await this.initTable();
      
      console.log(`Attempting to delete budget with ID: ${id}`);
      
      // Check if we have an ID
      if (!id) {
        return { 
          success: false, 
          error: 'Missing budget ID' 
        };
      }
      
      // Perform the delete
      const deletedCount = await Budget.destroy({ 
        where: { id: parseInt(id) } 
      });
      
      console.log(`Deleted ${deletedCount} budget records`);
      
      if (deletedCount > 0) {
        return { success: true };
      } else {
        console.error(`No budget found with ID: ${id}`);
        return { 
          success: false, 
          error: 'Budget not found or not deleted.' 
        };
      }
    } catch (error) {
      console.error('Error deleting budget:', error);
      console.error('Error stack:', error.stack);
      return { 
        success: false, 
        error: 'Failed to delete budget entry.',
        details: error.message
      };
    }
  }

  // Method to clear all budget entries
  async clearBudgets() {
    try {
      // Ensure table exists
      await this.initTable();
      
      console.log('Attempting to clear all budgets');
      await Budget.destroy({ 
        where: {}, 
        truncate: true 
      });
      console.log('All budgets cleared successfully');
      return { success: true };
    } catch (error) {
      console.error('Error clearing budgets:', error);
      console.error('Error stack:', error.stack);
      return { 
        success: false, 
        error: 'Failed to clear budget entries.',
        details: error.message
      };
    }
  }

  // Method to save a complete budget (multiple expense entries)
  async saveBudget(budgetData) {
    try {
      // Ensure table exists
      await this.initTable();
      
      console.log('Saving complete budget:', budgetData);
      
      if (!budgetData || !budgetData.income) {
        return { 
          success: false, 
          error: 'Missing required field: income' 
        };
      }
      
      let mainBudgetId = null;
      
      // Start a transaction to ensure data consistency
      await sequelize.transaction(async (t) => {
        // First, clear any existing budget entries for a fresh start
        await Budget.destroy({ 
          where: {}, 
          truncate: true,
          transaction: t
        });
        
        // Save the main income entry
        const mainBudget = await Budget.create({
          income: parseFloat(budgetData.income),
          category: 'Income',
          expense: 0
        }, { transaction: t });
        
        mainBudgetId = mainBudget.id;
        
        // If we have expenses, save them as separate entries
        if (budgetData.expenses && budgetData.expenses.length > 0) {
          // Filter out expenses with zero or invalid values
          const validExpenses = budgetData.expenses.filter(exp => 
            parseFloat(exp.expense) > 0
          );
          
          if (validExpenses.length > 0) {
            // Create array of expense objects with only valid expenses
            const expenseObjects = validExpenses.map(exp => ({
              income: parseFloat(budgetData.income),
              category: exp.category,
              expense: parseFloat(exp.expense)
            }));
            
            // Create all expense entries
            await Budget.bulkCreate(expenseObjects, { transaction: t });
          }
        }
      });
      
      console.log('Budget saved successfully with main ID:', mainBudgetId);
      
      return { 
        success: true, 
        id: mainBudgetId 
      };
    } catch (error) {
      console.error('Error saving entire budget:', error);
      console.error('Error stack:', error.stack);
      return { 
        success: false, 
        error: 'Failed to save budget.',
        details: error.message
      };
    }
  }
}

module.exports = new BudgetService();