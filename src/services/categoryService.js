// src/services/categoryService.js
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  updateDoc,
  writeBatch,
  serverTimestamp,
  getDocs,
  query,
} from "firebase/firestore";
import { db } from "../firebase";
import { DEFAULT_CATEGORIES } from "../utils/constants";

export const categoryService = {
  async seedDefaultCategories(uid) {
    const batch = writeBatch(db);

    // Check if categories already exist
    const categoriesQuery = query(collection(db, "users", uid, "categories"));
    const snapshot = await getDocs(categoriesQuery);

    if (!snapshot.empty) {
      return; // Categories already exist
    }

    DEFAULT_CATEGORIES.forEach((category) => {
      const ref = doc(collection(db, "users", uid, "categories"));
      batch.set(ref, {
        ...category,
        userId: uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });

    await batch.commit();
  },

  async addCategory(uid, data) {
    return await addDoc(collection(db, "users", uid, "categories"), {
      userId: uid,
      name: data.name.trim(),
      color: data.color,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  },

  async updateCategory(uid, id, data) {
    await updateDoc(doc(db, "users", uid, "categories", id), {
      name: data.name.trim(),
      color: data.color,
      updatedAt: serverTimestamp(),
    });
  },

  async deleteCategory(uid, id) {
    await deleteDoc(doc(db, "users", uid, "categories", id));
  },

  addLocalCategory(currentData, category) {
    return {
      ...currentData,
      categories: [...currentData.categories, category],
    };
  },

  updateLocalCategory(currentData, id, updatedData) {
    return {
      ...currentData,
      categories: currentData.categories.map((category) =>
        category.id === id ? { ...category, ...updatedData } : category,
      ),
    };
  },

  deleteLocalCategory(currentData, id) {
    return {
      ...currentData,
      categories: currentData.categories.filter(
        (category) => category.id !== id,
      ),
    };
  },
};
