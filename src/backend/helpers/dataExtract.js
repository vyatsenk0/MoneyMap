import { clipboard } from "electron";

import BudgetService from "../services/BudgetService.js";
import GoalService from "../services/GoalService.js";
import TransactionService from "../services/TransactionService.js";

async function getGoals() {
    try {
        const goals = await GoalService.getGoals();
        return goals.success ? goals.goals : { error: "Error fetching goals" };
    } catch (error) {
        console.error("Unexpected Error:", error);
        return { error: error.message || "Unexpected Error" };
    }
}

async function getBudget() {
    try {
        const budget = await BudgetService.getBudget();
        return budget.success ? budget.budgets : { error: "Error fetching budgets" };
    } catch (error) {
        console.error("Unexpected Error:", error);
        return { error: error.message || "Unexpected Error" };
    }
}

async function getTransactions() {
    try {
        const transactions = await TransactionService.getTransactions();
        return transactions.success ? transactions.transactions : { error: "Error fetching transactions" };  // Fixed property name
    } catch (error) {
        console.error("Unexpected Error:", error);
        return { error: error.message || "Unexpected Error" };
    }
}

export default async function exportData() {
    try {
        const [goals, budget, transactions] = await Promise.all([
            getGoals(),
            getBudget(),
            getTransactions(),
        ]);

        const jsonData = { goals, budget, transactions };
        const jsonString = JSON.stringify(jsonData, null, 4);
        
        // clipboard.writeText(jsonString);
        // console.log("Data successfully copied to clipboard!");

        return { success: true, data: jsonData};
    } catch (error) {
        console.error("Error exporting data to JSON:", error);
        return { success: false, error: error.message };
    }
}
