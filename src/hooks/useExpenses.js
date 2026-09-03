// src/hooks/useExpenses.js
import { useState, useEffect } from "react";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db, firebaseConfigured } from "../firebase";
import { expenseService } from "../services/expenseService";
import {
  saveLocalData,
  loadLocalData,
  createLocalId,
} from "../services/localStorageService";
import { toast } from "react-toastify";

export function useExpenses(user) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load expenses from Firebase or localStorage
  useEffect(() => {
    if (!firebaseConfigured || !user || user.demoMode) {
      // Load from localStorage
      const localData = loadLocalData();
      if (localData) {
        setExpenses(localData.expenses || []);
      }
      return;
    }

    setLoading(true);
    const expensesQuery = query(collection(db, "users", user.uid, "expenses"));

    const unsubscribe = onSnapshot(
      expensesQuery,
      (snapshot) => {
        const next = snapshot.docs
          .map((item) => ({
            id: item.id,
            ...item.data(),
          }))
          .sort(
            (a, b) =>
              b.date.localeCompare(a.date) ||
              (b.createdAt?.toMillis?.() || 0) -
                (a.createdAt?.toMillis?.() || 0),
          );
        setExpenses(next);
        setLoading(false);
      },
      (error) => {
        console.error("Error loading expenses:", error);
        toast.error("Failed to load expenses.");
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [user]);

  // CRUD Operations
  const addExpense = async (data, categories) => {
    if (!user) throw new Error("No active user session.");

    const category = categories.find((item) => item.id === data.categoryId);

    if (user.demoMode) {
      const expense = {
        id: createLocalId("expense"),
        userId: user.uid,
        name: data.name.trim(),
        amount: Number(data.amount),
        categoryId: data.categoryId,
        categoryName: category?.name || "Uncategorized",
        date: data.date,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const currentData = loadLocalData();
      const updatedData = expenseService.addLocalExpense(currentData, expense);
      saveLocalData(updatedData);
      setExpenses(updatedData.expenses);

      toast.success("Expense added successfully! (Local demo mode)");
      return;
    }

    await expenseService.addExpense(user.uid, {
      ...data,
      categoryName: category?.name || "Uncategorized",
    });
    toast.success("Expense added successfully!");
  };

  const updateExpense = async (id, data, categories) => {
    if (!user) throw new Error("No active user session.");

    const category = categories.find((item) => item.id === data.categoryId);

    if (user.demoMode) {
      const currentData = loadLocalData();
      const updatedData = expenseService.updateLocalExpense(currentData, id, {
        name: data.name.trim(),
        amount: Number(data.amount),
        categoryId: data.categoryId,
        categoryName: category?.name || "Uncategorized",
        date: data.date,
        updatedAt: Date.now(),
      });
      saveLocalData(updatedData);
      setExpenses(updatedData.expenses);

      toast.success("Expense updated successfully! (Local demo mode)");
      return;
    }

    await expenseService.updateExpense(user.uid, id, {
      ...data,
      categoryName: category?.name || "Uncategorized",
    });
    toast.success("Expense updated successfully!");
  };

  const deleteExpense = async (id) => {
    if (!user) return;

    if (user.demoMode) {
      const currentData = loadLocalData();
      const updatedData = expenseService.deleteLocalExpense(currentData, id);
      saveLocalData(updatedData);
      setExpenses(updatedData.expenses);

      toast.success("Expense deleted. (Local demo mode)");
      return;
    }

    await expenseService.deleteExpense(user.uid, id);
    toast.success("Expense deleted.");
  };

  const clearAllExpenses = async () => {
    if (!user) return;

    if (user.demoMode) {
      const currentData = loadLocalData();
      const updatedData = expenseService.clearLocalExpenses(currentData);
      saveLocalData(updatedData);
      setExpenses(updatedData.expenses);

      toast.success("All expenses cleared. (Local demo mode)");
      return;
    }

    await expenseService.clearAllExpenses(user.uid, expenses);
    toast.success("All expenses cleared.");
  };

  return {
    expenses,
    loading,
    addExpense,
    updateExpense,
    deleteExpense,
    clearAllExpenses,
  };
}
