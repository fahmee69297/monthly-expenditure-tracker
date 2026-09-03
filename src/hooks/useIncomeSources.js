// src/hooks/useIncomeSources.js
import { useState, useEffect } from "react";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db, firebaseConfigured } from "../firebase";
import { incomeSourceService } from "../services/incomeSourceService";
import {
  saveLocalData,
  loadLocalData,
  createLocalId,
} from "../services/localStorageService";
import { DEFAULT_INCOME_SOURCES } from "../utils/constants";
import { toast } from "react-toastify";

export function useIncomeSources(user) {
  const [incomeSources, setIncomeSources] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!firebaseConfigured || !user || user.demoMode) {
      const localData = loadLocalData();
      if (localData && localData.incomeSources?.length > 0) {
        setIncomeSources(localData.incomeSources);
      } else {
        // Initialize with default sources
        const defaultSources = DEFAULT_INCOME_SOURCES.map((source) => ({
          ...source,
          id: createLocalId("src"),
          userId: user?.uid || "local-demo-user",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }));
        setIncomeSources(defaultSources);
      }
      return;
    }

    setLoading(true);
    const sourcesQuery = query(
      collection(db, "users", user.uid, "incomeSources"),
    );

    const unsubscribe = onSnapshot(
      sourcesQuery,
      async (snapshot) => {
        if (snapshot.empty) {
          await incomeSourceService.seedDefaultSources(user.uid);
          setLoading(false);
          return;
        }

        const next = snapshot.docs
          .map((item) => ({
            id: item.id,
            ...item.data(),
          }))
          .sort((a, b) => a.name.localeCompare(b.name));

        setIncomeSources(next);
        setLoading(false);
      },
      (error) => {
        console.error("Error loading income sources:", error);
        toast.error("Failed to load income sources.");
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [user]);

  const addIncomeSource = async (data) => {
    if (!user) throw new Error("No active user session.");

    if (user.demoMode) {
      const source = {
        id: createLocalId("src"),
        userId: user.uid,
        name: data.name.trim(),
        color: data.color || "#6366f1",
        icon: data.icon || "💰",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const currentData = loadLocalData();
      const updatedData = incomeSourceService.addLocalSource(
        currentData,
        source,
      );
      saveLocalData(updatedData);
      setIncomeSources(updatedData.incomeSources);

      toast.success("Income source added. (Local demo mode)");
      return;
    }

    await incomeSourceService.addSource(user.uid, data);
    toast.success("Income source added.");
  };

  const updateIncomeSource = async (id, data) => {
    if (!user) throw new Error("No active user session.");

    if (user.demoMode) {
      const currentData = loadLocalData();
      const updatedData = incomeSourceService.updateLocalSource(
        currentData,
        id,
        {
          name: data.name.trim(),
          color: data.color,
          icon: data.icon,
          updatedAt: Date.now(),
        },
      );
      saveLocalData(updatedData);
      setIncomeSources(updatedData.incomeSources);

      toast.success("Income source updated. (Local demo mode)");
      return;
    }

    await incomeSourceService.updateSource(user.uid, id, data);
    toast.success("Income source updated.");
  };

  const deleteIncomeSource = async (id, incomeEntries) => {
    if (!user) return;

    const used = incomeEntries.some((income) => income.sourceId === id);
    if (used) {
      throw new Error(
        "This income source is used by an income entry. Delete those entries first.",
      );
    }

    if (user.demoMode) {
      const currentData = loadLocalData();
      const updatedData = incomeSourceService.deleteLocalSource(
        currentData,
        id,
      );
      saveLocalData(updatedData);
      setIncomeSources(updatedData.incomeSources);

      toast.success("Income source deleted. (Local demo mode)");
      return;
    }

    await incomeSourceService.deleteSource(user.uid, id);
    toast.success("Income source deleted.");
  };

  return {
    incomeSources,
    loading,
    addIncomeSource,
    updateIncomeSource,
    deleteIncomeSource,
  };
}
