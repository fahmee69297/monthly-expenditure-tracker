// src/services/expenseService.js
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  updateDoc,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

export const expenseService = {
  // Firebase operations
  async addExpense(uid, data) {
    const { name, amount, categoryId, categoryName, date } = data;
    return await addDoc(collection(db, "users", uid, "expenses"), {
      userId: uid,
      name: name.trim(),
      amount: Number(amount),
      categoryId,
      categoryName,
      date,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  },

  async updateExpense(uid, id, data) {
    const { name, amount, categoryId, categoryName, date } = data;
    await updateDoc(doc(db, "users", uid, "expenses", id), {
      name: name.trim(),
      amount: Number(amount),
      categoryId,
      categoryName,
      date,
      updatedAt: serverTimestamp(),
    });
  },

  async deleteExpense(uid, id) {
    await deleteDoc(doc(db, "users", uid, "expenses", id));
  },

  async clearAllExpenses(uid, expenses) {
    for (let i = 0; i < expenses.length; i += 450) {
      const batch = writeBatch(db);
      expenses.slice(i, i + 450).forEach((expense) => {
        batch.delete(doc(db, "users", uid, "expenses", expense.id));
      });
      await batch.commit();
    }
  },

  // Local/demo operations
  addLocalExpense(currentData, expense) {
    return {
      ...currentData,
      expenses: [expense, ...currentData.expenses],
    };
  },

  updateLocalExpense(currentData, id, updatedData) {
    return {
      ...currentData,
      expenses: currentData.expenses.map((expense) =>
        expense.id === id ? { ...expense, ...updatedData } : expense,
      ),
    };
  },

  deleteLocalExpense(currentData, id) {
    return {
      ...currentData,
      expenses: currentData.expenses.filter((expense) => expense.id !== id),
    };
  },

  clearLocalExpenses(currentData) {
    return {
      ...currentData,
      expenses: [],
    };
  },
};
