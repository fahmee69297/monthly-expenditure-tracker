// src/services/incomeSourceService.js
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
import { DEFAULT_INCOME_SOURCES } from "../utils/constants";

export const incomeSourceService = {
  async seedDefaultSources(uid) {
    try {
      const batch = writeBatch(db);
      const sourcesQuery = query(collection(db, "users", uid, "incomeSources"));
      const snapshot = await getDocs(sourcesQuery);

      if (!snapshot.empty) {
        return;
      }

      DEFAULT_INCOME_SOURCES.forEach((source) => {
        const ref = doc(collection(db, "users", uid, "incomeSources"));
        batch.set(ref, {
          ...source,
          userId: uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });

      await batch.commit();
    } catch (error) {
      console.error("Error seeding income sources:", error);
    }
  },

  async addSource(uid, data) {
    return await addDoc(collection(db, "users", uid, "incomeSources"), {
      userId: uid,
      name: data.name.trim(),
      color: data.color || "#6366f1",
      icon: data.icon || "💰",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  },

  async updateSource(uid, id, data) {
    await updateDoc(doc(db, "users", uid, "incomeSources", id), {
      name: data.name.trim(),
      color: data.color,
      icon: data.icon,
      updatedAt: serverTimestamp(),
    });
  },

  async deleteSource(uid, id) {
    await deleteDoc(doc(db, "users", uid, "incomeSources", id));
  },

  addLocalSource(currentData, source) {
    return {
      ...currentData,
      incomeSources: [...(currentData.incomeSources || []), source],
    };
  },

  updateLocalSource(currentData, id, updatedData) {
    return {
      ...currentData,
      incomeSources: (currentData.incomeSources || []).map((source) =>
        source.id === id ? { ...source, ...updatedData } : source,
      ),
    };
  },

  deleteLocalSource(currentData, id) {
    return {
      ...currentData,
      incomeSources: (currentData.incomeSources || []).filter(
        (source) => source.id !== id,
      ),
    };
  },
};
