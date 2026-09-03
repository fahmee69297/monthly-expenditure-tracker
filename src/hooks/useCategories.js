// src/hooks/useCategories.js
import { useState, useEffect } from "react";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db, firebaseConfigured } from "../firebase";
import { categoryService } from "../services/categoryService";
import {
  saveLocalData,
  loadLocalData,
  createLocalId,
} from "../services/localStorageService";
import { DEFAULT_CATEGORIES } from "../utils/constants";
import { toast } from "react-toastify";

export function useCategories(user) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!firebaseConfigured || !user || user.demoMode) {
      const localData = loadLocalData();
      if (localData) {
        setCategories(localData.categories || []);
      } else {
        // Initialize with default categories
        const defaultCats = DEFAULT_CATEGORIES.map((cat) => ({
          ...cat,
          id: createLocalId("cat"),
          userId: user?.uid || "local-demo-user",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }));
        setCategories(defaultCats);
      }
      return;
    }

    setLoading(true);
    const categoriesQuery = query(
      collection(db, "users", user.uid, "categories"),
    );

    const unsubscribe = onSnapshot(
      categoriesQuery,
      async (snapshot) => {
        if (snapshot.empty) {
          await categoryService.seedDefaultCategories(user.uid);
          setLoading(false);
          return;
        }

        const next = snapshot.docs
          .map((item) => ({
            id: item.id,
            ...item.data(),
          }))
          .sort((a, b) => a.name.localeCompare(b.name));

        setCategories(next);
        setLoading(false);
      },
      (error) => {
        console.error("Error loading categories:", error);
        toast.error("Failed to load categories.");
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [user]);

  const addCategory = async (data) => {
    if (!user) throw new Error("No active user session.");

    if (user.demoMode) {
      const category = {
        id: createLocalId("cat"),
        userId: user.uid,
        name: data.name.trim(),
        color: data.color,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const currentData = loadLocalData();
      const updatedData = categoryService.addLocalCategory(
        currentData,
        category,
      );
      saveLocalData(updatedData);
      setCategories(updatedData.categories);

      toast.success("Category added. (Local demo mode)");
      return;
    }

    await categoryService.addCategory(user.uid, data);
    toast.success("Category added.");
  };

  const updateCategory = async (id, data) => {
    if (!user) throw new Error("No active user session.");

    if (user.demoMode) {
      const currentData = loadLocalData();
      const updatedData = categoryService.updateLocalCategory(currentData, id, {
        name: data.name.trim(),
        color: data.color,
        updatedAt: Date.now(),
      });
      saveLocalData(updatedData);
      setCategories(updatedData.categories);

      toast.success("Category updated. (Local demo mode)");
      return;
    }

    await categoryService.updateCategory(user.uid, id, data);
    toast.success("Category updated.");
  };

  const deleteCategory = async (id, expenses) => {
    if (!user) return;

    const used = expenses.some((expense) => expense.categoryId === id);
    if (used) {
      throw new Error(
        "This category is used by an expense. Reassign or delete those expenses first.",
      );
    }

    if (user.demoMode) {
      const currentData = loadLocalData();
      const updatedData = categoryService.deleteLocalCategory(currentData, id);
      saveLocalData(updatedData);
      setCategories(updatedData.categories);

      toast.success("Category deleted. (Local demo mode)");
      return;
    }

    await categoryService.deleteCategory(user.uid, id);
    toast.success("Category deleted.");
  };

  return { categories, loading, addCategory, updateCategory, deleteCategory };
}
