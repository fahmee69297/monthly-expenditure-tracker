// src/hooks/useIncome.js
import { useState, useEffect } from "react";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db, firebaseConfigured } from "../firebase";
import { incomeService } from "../services/incomeService";
import {
  saveLocalData,
  loadLocalData,
  createLocalId,
} from "../services/localStorageService";
import { INCOME_FREQUENCIES } from "../utils/constants";
import { toast } from "react-toastify";

export function useIncome(user) {
  const [incomeEntries, setIncomeEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!firebaseConfigured || !user || user.demoMode) {
      const localData = loadLocalData();
      if (localData) {
        setIncomeEntries(localData.income || []);
      }
      return;
    }

    setLoading(true);
    const incomeQuery = query(collection(db, "users", user.uid, "income"));

    const unsubscribe = onSnapshot(
      incomeQuery,
      (snapshot) => {
        const next = snapshot.docs
          .map((item) => ({
            id: item.id,
            ...item.data(),
          }))
          .sort((a, b) => b.date.localeCompare(a.date));

        setIncomeEntries(next);
        setLoading(false);
      },
      (error) => {
        console.error("Error loading income:", error);
        toast.error("Failed to load income entries.");
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [user]);

  const addIncome = async (data, incomeSources) => {
    if (!user) throw new Error("No active user session.");

    const source = incomeSources.find((item) => item.id === data.sourceId);

    if (user.demoMode) {
      const income = {
        id: createLocalId("income"),
        userId: user.uid,
        sourceId: data.sourceId,
        sourceName: source?.name || "Unknown",
        sourceColor: source?.color || "#6366f1",
        sourceIcon: source?.icon || "💰",
        amount: Number(data.amount),
        date: data.date,
        description: data.description?.trim() || "",
        frequency: data.frequency || INCOME_FREQUENCIES.ONE_TIME,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const currentData = loadLocalData();
      const updatedData = incomeService.addLocalIncome(currentData, income);
      saveLocalData(updatedData);
      setIncomeEntries(updatedData.income);

      toast.success("Income added successfully! (Local demo mode)");
      return;
    }

    await incomeService.addIncome(user.uid, {
      ...data,
      sourceName: source?.name || "Unknown",
      sourceColor: source?.color || "#6366f1",
      sourceIcon: source?.icon || "💰",
    });
    toast.success("Income added successfully!");
  };

  const updateIncome = async (id, data, incomeSources) => {
    if (!user) throw new Error("No active user session.");

    const source = incomeSources.find((item) => item.id === data.sourceId);

    if (user.demoMode) {
      const currentData = loadLocalData();
      const updatedData = incomeService.updateLocalIncome(currentData, id, {
        sourceId: data.sourceId,
        sourceName: source?.name || "Unknown",
        sourceColor: source?.color || "#6366f1",
        sourceIcon: source?.icon || "💰",
        amount: Number(data.amount),
        date: data.date,
        description: data.description?.trim() || "",
        frequency: data.frequency || INCOME_FREQUENCIES.ONE_TIME,
        updatedAt: Date.now(),
      });
      saveLocalData(updatedData);
      setIncomeEntries(updatedData.income);

      toast.success("Income updated successfully! (Local demo mode)");
      return;
    }

    await incomeService.updateIncome(user.uid, id, {
      ...data,
      sourceName: source?.name || "Unknown",
      sourceColor: source?.color || "#6366f1",
      sourceIcon: source?.icon || "💰",
    });
    toast.success("Income updated successfully!");
  };

  const deleteIncome = async (id) => {
    if (!user) return;

    if (user.demoMode) {
      const currentData = loadLocalData();
      const updatedData = incomeService.deleteLocalIncome(currentData, id);
      saveLocalData(updatedData);
      setIncomeEntries(updatedData.income);

      toast.success("Income deleted. (Local demo mode)");
      return;
    }

    await incomeService.deleteIncome(user.uid, id);
    toast.success("Income deleted.");
  };

  return { incomeEntries, loading, addIncome, updateIncome, deleteIncome };
}
