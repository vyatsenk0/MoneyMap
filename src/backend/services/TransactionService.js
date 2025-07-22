const Transaction = require("../models/TransactionModel");
const { sequelize } = require("../database");

class TransactionService {
  // Method to create a transaction
  async createTransaction(transactionData) {
    try {
      const newTransaction = await Transaction.create(transactionData);
      return { success: true, transaction: newTransaction }; // Return success with the created transaction
    } catch (error) {
      console.error("Error creating transaction:", error);
      return { error: "Failed to create transaction." }; // Structured error response
    }
  }

  // Method to get all transactions
  async getTransactions() {
    try {
      const transactions = await Transaction.findAll();
      return { success: true, transactions }; // Return success with transactions data
    } catch (error) {
      console.error("Error retrieving transactions:", error);
      return { error: "Failed to retrieve transactions." }; // Structured error response
    }
  }

  // Method to update a transaction
  async updateTransaction(id, updatedData) {
    try {
      console.log(`Attempting to update transaction with ID: ${id}`); // Debugging
      const [updatedCount] = await Transaction.update(updatedData, { where: { id } });
      if (updatedCount > 0) {
        return { success: true }; // Return success if the transaction was updated
      } else {
        return { error: "Transaction not found or not updated." }; // Error if no rows were updated
      }
    } catch (error) {
      console.error("Error updating transaction:", error);
      return { error: "Failed to update transaction." }; // Structured error response
    }
  }

  // Method to delete a transaction
  async deleteTransaction(id) {
    try {
      console.log(`Attempting to delete transaction with ID: ${id}`); // Debugging
      const deletedCount = await Transaction.destroy({ where: { id: parseInt(id) } });
      if (deletedCount > 0) {
        return { success: true };
      } else {
        console.error(`No transaction found with ID: ${id}`); // Debugging
        return { error: "Transaction not found or not deleted." };
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
      return { error: "Failed to delete transaction." };
    }
  }
}

module.exports = new TransactionService();
