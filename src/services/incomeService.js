// src/services/incomeService.js
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

export const incomeService = {
  async addIncome(uid, data) {
    const {
      sourceId,
      sourceName,
      sourceColor,
      sourceIcon,
      amount,
      date,
      description,
      frequency,
    } = data;
    return await addDoc(collection(db, "users", uid, "income"), {
      userId: uid,
      sourceId,
      sourceName,
      sourceColor,
      sourceIcon,
      amount: Number(amount),
      date,
      description: description?.trim() || "",
      frequency,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  },

  async updateIncome(uid, id, data) {
    const {
      sourceId,
      sourceName,
      sourceColor,
      sourceIcon,
      amount,
      date,
      description,
      frequency,
    } = data;
    await updateDoc(doc(db, "users", uid, "income", id), {
      sourceId,
      sourceName,
      sourceColor,
      sourceIcon,
      amount: Number(amount),
      date,
      description: description?.trim() || "",
      frequency,
      updatedAt: serverTimestamp(),
    });
  },

  async deleteIncome(uid, id) {
    await deleteDoc(doc(db, "users", uid, "income", id));
  },

  addLocalIncome(currentData, income) {
    return {
      ...currentData,
      income: [income, ...(currentData.income || [])],
    };
  },

  updateLocalIncome(currentData, id, updatedData) {
    return {
      ...currentData,
      income: (currentData.income || []).map((income) =>
        income.id === id ? { ...income, ...updatedData } : income,
      ),
    };
  },

  deleteLocalIncome(currentData, id) {
    return {
      ...currentData,
      income: (currentData.income || []).filter((income) => income.id !== id),
    };
  },
};
