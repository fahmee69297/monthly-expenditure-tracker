import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  getDocs,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { auth, db, firebaseConfigured } from "../firebase";
import {
  DEFAULT_CATEGORIES,
  DEFAULT_INCOME_SOURCES,
  FILTERS,
  INCOME_FREQUENCIES,
  todayISO,
} from "../utils/constants";
import { getFilterRange } from "../utils/date";

const AppContext = createContext(null);
const LOCAL_KEY = "monthly-expenditure-tracker-demo";

const makeId = (prefix = "local") =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

const loadLocalData = () => {
  try {
    const raw = globalThis.localStorage.getItem(LOCAL_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...parsed,
        income: parsed.income || [],
        incomeSources:
          parsed.incomeSources ||
          DEFAULT_INCOME_SOURCES.map((source) => ({
            ...source,
            id: makeId("src"),
            userId: "local-demo-user",
            createdAt: Date.now(),
            updatedAt: Date.now(),
          })),
      };
    }
  } catch (error) {
    console.error(error);
  }

  return {
    categories: DEFAULT_CATEGORIES.map((category) => ({
      ...category,
      id: makeId("cat"),
      userId: "local-demo-user",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })),
    expenses: [],
    income: [],
    incomeSources: DEFAULT_INCOME_SOURCES.map((source) => ({
      ...source,
      id: makeId("src"),
      userId: "local-demo-user",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })),
  };
};

const saveLocalData = (data) => {
  globalThis.localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
};

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(firebaseConfigured);
  const [dataLoading, setDataLoading] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [incomeEntries, setIncomeEntries] = useState([]);
  const [incomeSources, setIncomeSources] = useState([]);
  const [filter, setFilter] = useState(FILTERS.MONTH);
  const [customStart, setCustomStart] = useState(todayISO());
  const [customEnd, setCustomEnd] = useState(todayISO());

  // Local/demo mode.
  useEffect(() => {
    if (firebaseConfigured) return;

    const local = loadLocalData();

    setUser({
      uid: "local-demo-user",
      isAnonymous: true,
      demoMode: true,
    });

    setCategories(local.categories);
    setExpenses(local.expenses);
    setIncomeEntries(local.income || []);
    setIncomeSources(local.incomeSources || []);
    setDataLoading(false);
    setAuthLoading(false);
  }, []);

  // Firebase authentication.
  useEffect(() => {
    if (!firebaseConfigured || !auth) return undefined;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser?.isAnonymous) {
          // Remove the old anonymous session created by the previous
          // version of the application.
          await signOut(auth);
          setUser(null);
        } else {
          // A real email/password account.
          setUser(currentUser);
        }
      } catch (error) {
        console.error("Authentication state error:", error);
        setUser(null);
      } finally {
        setDataLoading(false);
        setAuthLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // Firestore realtime listeners for expenses and categories.
  useEffect(() => {
    if (!firebaseConfigured || !user || user.demoMode || !db) {
      return undefined;
    }

    setDataLoading(true);

    const categoriesQuery = query(
      collection(db, "users", user.uid, "categories"),
    );

    const expensesQuery = query(collection(db, "users", user.uid, "expenses"));

    let categoriesReady = false;
    let expensesReady = false;

    const finishLoading = () => {
      if (categoriesReady && expensesReady) {
        setDataLoading(false);
      }
    };

    const unsubscribeCategories = onSnapshot(
      categoriesQuery,
      async (snapshot) => {
        if (snapshot.empty) {
          try {
            await seedDefaultCategories(user.uid);
          } catch (error) {
            console.error(error);
            toast.error("Failed to create default categories.");
          }

          categoriesReady = true;
          finishLoading();
          return;
        }

        const next = snapshot.docs
          .map((item) => ({
            id: item.id,
            ...item.data(),
          }))
          .sort((a, b) => a.name.localeCompare(b.name));

        setCategories(next);
        categoriesReady = true;
        finishLoading();
      },
      (error) => {
        console.error(error);
        toast.error("Failed to load categories.");
        categoriesReady = true;
        finishLoading();
      },
    );

    const unsubscribeExpenses = onSnapshot(
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
              timestampMillis(b.createdAt) - timestampMillis(a.createdAt),
          );

        setExpenses(next);
        expensesReady = true;
        finishLoading();
      },
      (error) => {
        console.error(error);
        toast.error("Failed to load expenses.");
        expensesReady = true;
        finishLoading();
      },
    );

    return () => {
      unsubscribeCategories();
      unsubscribeExpenses();
    };
  }, [user]);

  // Firestore income listeners
  useEffect(() => {
    if (!firebaseConfigured || !user || user.demoMode || !db) {
      return undefined;
    }

    const incomeQuery = query(collection(db, "users", user.uid, "income"));

    const sourcesQuery = query(
      collection(db, "users", user.uid, "incomeSources"),
    );

    const unsubscribeIncome = onSnapshot(
      incomeQuery,
      (snapshot) => {
        const next = snapshot.docs
          .map((item) => ({
            id: item.id,
            ...item.data(),
          }))
          .sort((a, b) => b.date.localeCompare(a.date));

        setIncomeEntries(next);
      },
      (error) => {
        console.error(error);
        toast.error("Failed to load income entries.");
      },
    );

    const unsubscribeSources = onSnapshot(
      sourcesQuery,
      (snapshot) => {
        if (snapshot.empty) {
          // Seed default income sources
          seedDefaultIncomeSources(user.uid);
          return;
        }

        const next = snapshot.docs
          .map((item) => ({
            id: item.id,
            ...item.data(),
          }))
          .sort((a, b) => a.name.localeCompare(b.name));

        setIncomeSources(next);
      },
      (error) => {
        console.error(error);
        toast.error("Failed to load income sources.");
      },
    );

    return () => {
      unsubscribeIncome();
      unsubscribeSources();
    };
  }, [user, firebaseConfigured]);

  const seedDefaultCategories = async (uid) => {
    const batch = writeBatch(db);

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
  };

  // Seed default income sources
  // In src/context/AppContext.jsx
  // Replace the seedDefaultIncomeSources function with this:

  const seedDefaultIncomeSources = async (uid) => {
    try {
      const batch = writeBatch(db);

      // First, check if sources already exist for this user
      const sourcesQuery = collection(db, "users", uid, "incomeSources");
      const snapshot = await getDocs(sourcesQuery);

      if (!snapshot.empty) {
        console.log("Income sources already exist for user:", uid);
        return;
      }

      // Add default sources
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
      console.log("Default income sources seeded for user:", uid);
    } catch (error) {
      console.error("Error seeding income sources:", error);
      // Don't throw - we want the app to continue
    }
  };

  // Local/demo helpers.
  const updateLocal = (updater) => {
    const current = loadLocalData();
    const next = updater(current);

    saveLocalData(next);
    setCategories(next.categories);
    setExpenses(next.expenses);
    setIncomeEntries(next.income || []);
    setIncomeSources(next.incomeSources || []);
  };

  const addExpense = async (data) => {
    if (!user) {
      throw new Error("No active user session.");
    }

    // FIX: Check if categories exists before using .find()
    const category =
      categories && categories.length > 0
        ? categories.find((item) => item.id === data.categoryId)
        : null;

    if (user.demoMode || !firebaseConfigured) {
      const expense = {
        id: makeId("expense"),
        userId: user.uid,
        name: data.name.trim(),
        amount: Number(data.amount),
        categoryId: data.categoryId,
        categoryName: category?.name || "Uncategorized",
        date: data.date,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Update state directly
      setExpenses((prev) => [expense, ...prev]);

      // Save to localStorage
      const currentData = loadLocalData();
      const updatedData = {
        ...currentData,
        expenses: [expense, ...(currentData.expenses || [])],
      };
      saveLocalData(updatedData);

      toast.success("Expense added successfully! (Local demo mode)");
      return;
    }

    // Firebase mode
    try {
      await addDoc(collection(db, "users", user.uid, "expenses"), {
        userId: user.uid,
        name: data.name.trim(),
        amount: Number(data.amount),
        categoryId: data.categoryId,
        categoryName: category?.name || "Uncategorized",
        date: data.date,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast.success("Expense added successfully!");
    } catch (error) {
      console.error("Error adding expense:", error);
      toast.error("Failed to add expense. Please try again.");
    }
  };

  const updateExpense = async (id, data) => {
    if (!user) {
      throw new Error("No active user session.");
    }

    const category = categories.find((item) => item.id === data.categoryId);

    if (user.demoMode) {
      updateLocal((current) => ({
        ...current,
        expenses: current.expenses.map((expense) =>
          expense.id === id
            ? {
                ...expense,
                name: data.name.trim(),
                amount: Number(data.amount),
                categoryId: data.categoryId,
                categoryName: category?.name || "Uncategorized",
                date: data.date,
                updatedAt: Date.now(),
              }
            : expense,
        ),
      }));

      toast.success("Expense updated successfully! (Local demo mode)");
      return;
    }

    await updateDoc(doc(db, "users", user.uid, "expenses", id), {
      name: data.name.trim(),
      amount: Number(data.amount),
      categoryId: data.categoryId,
      categoryName: category?.name || "Uncategorized",
      date: data.date,
      updatedAt: serverTimestamp(),
    });

    toast.success("Expense updated successfully!");
  };

  const deleteExpense = async (id) => {
    if (!user) return;

    if (user.demoMode) {
      updateLocal((current) => ({
        ...current,
        expenses: current.expenses.filter((expense) => expense.id !== id),
      }));

      toast.success("Expense deleted. (Local demo mode)");
      return;
    }

    await deleteDoc(doc(db, "users", user.uid, "expenses", id));

    toast.success("Expense deleted.");
  };

  const addCategory = async (data) => {
    if (!user) {
      throw new Error("No active user session.");
    }

    if (user.demoMode) {
      const category = {
        id: makeId("cat"),
        userId: user.uid,
        name: data.name.trim(),
        color: data.color,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      updateLocal((current) => ({
        ...current,
        categories: [...current.categories, category],
      }));

      toast.success("Category added. (Local demo mode)");
      return;
    }

    await addDoc(collection(db, "users", user.uid, "categories"), {
      userId: user.uid,
      name: data.name.trim(),
      color: data.color,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    toast.success("Category added.");
  };

  const updateCategory = async (id, data) => {
    if (!user) {
      throw new Error("No active user session.");
    }

    if (user.demoMode) {
      updateLocal((current) => ({
        ...current,
        categories: current.categories.map((category) =>
          category.id === id
            ? {
                ...category,
                name: data.name.trim(),
                color: data.color,
                updatedAt: Date.now(),
              }
            : category,
        ),
      }));

      toast.success("Category updated. (Local demo mode)");
      return;
    }

    await updateDoc(doc(db, "users", user.uid, "categories", id), {
      name: data.name.trim(),
      color: data.color,
      updatedAt: serverTimestamp(),
    });

    toast.success("Category updated.");
  };

  const deleteCategory = async (id) => {
    if (!user) return;

    const used = expenses.some((expense) => expense.categoryId === id);

    if (used) {
      throw new Error(
        "This category is used by an expense. Reassign or delete those expenses first.",
      );
    }

    if (user.demoMode) {
      updateLocal((current) => ({
        ...current,
        categories: current.categories.filter((category) => category.id !== id),
      }));

      toast.success("Category deleted. (Local demo mode)");
      return;
    }

    await deleteDoc(doc(db, user.uid, "categories", id));

    toast.success("Category deleted.");
  };

  const clearAllData = async () => {
    if (!user) return;

    if (user.demoMode) {
      updateLocal((current) => ({
        ...current,
        expenses: [],
      }));

      toast.success("All expenses cleared. (Local demo mode)");
      return;
    }

    for (let i = 0; i < expenses.length; i += 450) {
      const batch = writeBatch(db);

      expenses.slice(i, i + 450).forEach((expense) => {
        batch.delete(doc(db, "users", user.uid, "expenses", expense.id));
      });

      await batch.commit();
    }

    toast.success("All expenses cleared.");
  };

  // INCOME CRUD OPERATIONS
  const addIncome = async (data) => {
    if (!user) {
      throw new Error("No active user session.");
    }

    // FIX: Check if incomeSources exists before using .find()
    const source =
      incomeSources && incomeSources.length > 0
        ? incomeSources.find((item) => item.id === data.sourceId)
        : null;

    if (user.demoMode || !firebaseConfigured) {
      const income = {
        id: makeId("income"),
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

      // Update state directly
      setIncomeEntries((prev) => [income, ...prev]);

      // Update localStorage
      const currentData = loadLocalData();
      const updatedData = {
        ...currentData,
        income: [income, ...(currentData.income || [])],
      };
      saveLocalData(updatedData);

      toast.success("Income added successfully! (Local demo mode)");
      return;
    }

    // Firebase mode
    try {
      await addDoc(collection(db, "users", user.uid, "income"), {
        userId: user.uid,
        sourceId: data.sourceId,
        sourceName: source?.name || "Unknown",
        sourceColor: source?.color || "#6366f1",
        sourceIcon: source?.icon || "💰",
        amount: Number(data.amount),
        date: data.date,
        description: data.description?.trim() || "",
        frequency: data.frequency || INCOME_FREQUENCIES.ONE_TIME,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast.success("Income added successfully!");
    } catch (error) {
      console.error("Error adding income:", error);
      toast.error("Failed to add income. Please try again.");
    }
  };

  const updateIncome = async (id, data) => {
    if (!user) {
      throw new Error("No active user session.");
    }

    const source = incomeSources.find((item) => item.id === data.sourceId);

    if (user.demoMode) {
      updateLocal((current) => ({
        ...current,
        income: (current.income || []).map((income) =>
          income.id === id
            ? {
                ...income,
                sourceId: data.sourceId,
                sourceName: source?.name || "Unknown",
                sourceColor: source?.color || "#6366f1",
                sourceIcon: source?.icon || "💰",
                amount: Number(data.amount),
                date: data.date,
                description: data.description?.trim() || "",
                frequency: data.frequency || INCOME_FREQUENCIES.ONE_TIME,
                updatedAt: Date.now(),
              }
            : income,
        ),
      }));

      toast.success("Income updated successfully! (Local demo mode)");
      return;
    }

    await updateDoc(doc(db, "users", user.uid, "income", id), {
      sourceId: data.sourceId,
      sourceName: source?.name || "Unknown",
      sourceColor: source?.color || "#6366f1",
      sourceIcon: source?.icon || "💰",
      amount: Number(data.amount),
      date: data.date,
      description: data.description?.trim() || "",
      frequency: data.frequency || INCOME_FREQUENCIES.ONE_TIME,
      updatedAt: serverTimestamp(),
    });

    toast.success("Income updated successfully!");
  };

  const deleteIncome = async (id) => {
    if (!user) return;

    if (user.demoMode) {
      updateLocal((current) => ({
        ...current,
        income: (current.income || []).filter((income) => income.id !== id),
      }));

      toast.success("Income deleted. (Local demo mode)");
      return;
    }

    await deleteDoc(doc(db, "users", user.uid, "income", id));
    toast.success("Income deleted.");
  };

  // INCOME SOURCE CRUD OPERATIONS
  const addIncomeSource = async (data) => {
    if (!user) {
      throw new Error("No active user session.");
    }

    if (user.demoMode) {
      const source = {
        id: makeId("src"),
        userId: user.uid,
        name: data.name.trim(),
        color: data.color || "#6366f1",
        icon: data.icon || "💰",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      updateLocal((current) => ({
        ...current,
        incomeSources: [
          ...(current.incomeSources || DEFAULT_INCOME_SOURCES),
          source,
        ],
      }));

      toast.success("Income source added. (Local demo mode)");
      return;
    }

    await addDoc(collection(db, "users", user.uid, "incomeSources"), {
      userId: user.uid,
      name: data.name.trim(),
      color: data.color || "#6366f1",
      icon: data.icon || "💰",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    toast.success("Income source added.");
  };

  const updateIncomeSource = async (id, data) => {
    if (!user) {
      throw new Error("No active user session.");
    }

    if (user.demoMode) {
      updateLocal((current) => ({
        ...current,
        incomeSources: (current.incomeSources || []).map((source) =>
          source.id === id
            ? {
                ...source,
                name: data.name.trim(),
                color: data.color || source.color,
                icon: data.icon || source.icon,
                updatedAt: Date.now(),
              }
            : source,
        ),
      }));

      toast.success("Income source updated. (Local demo mode)");
      return;
    }

    await updateDoc(doc(db, "users", user.uid, "incomeSources", id), {
      name: data.name.trim(),
      color: data.color || "#6366f1",
      icon: data.icon || "💰",
      updatedAt: serverTimestamp(),
    });

    toast.success("Income source updated.");
  };

  const deleteIncomeSource = async (id) => {
    if (!user) return;

    const used = incomeEntries.some((income) => income.sourceId === id);

    if (used) {
      throw new Error(
        "This income source is used by an income entry. Delete those entries first.",
      );
    }

    if (user.demoMode) {
      updateLocal((current) => ({
        ...current,
        incomeSources: (current.incomeSources || []).filter(
          (source) => source.id !== id,
        ),
      }));

      toast.success("Income source deleted. (Local demo mode)");
      return;
    }

    await deleteDoc(doc(db, "users", user.uid, "incomeSources", id));
    toast.success("Income source deleted.");
  };

  const filterRange = useMemo(
    () => getFilterRange(filter, customStart, customEnd),
    [filter, customStart, customEnd],
  );

  const filteredExpenses = useMemo(() => {
    const { start, end } = filterRange;

    return expenses.filter((expense) => {
      if (start && expense.date < start) return false;
      if (end && expense.date > end) return false;

      return true;
    });
  }, [expenses, filterRange]);

  const filteredIncome = useMemo(() => {
    const { start, end } = filterRange;

    return incomeEntries.filter((income) => {
      if (start && income.date < start) return false;
      if (end && income.date > end) return false;

      return true;
    });
  }, [incomeEntries, filterRange]);

  const value = {
    user,
    firebaseConfigured,
    authLoading,
    dataLoading,
    expenses,
    categories,
    incomeEntries,
    filteredIncome,
    incomeSources,
    filter,
    setFilter,
    customStart,
    setCustomStart,
    customEnd,
    setCustomEnd,
    filterRange,
    filteredExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
    addCategory,
    updateCategory,
    deleteCategory,
    clearAllData,
    addIncome,
    updateIncome,
    deleteIncome,
    addIncomeSource,
    updateIncomeSource,
    deleteIncomeSource,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

const timestampMillis = (timestamp) => {
  if (!timestamp) return 0;

  if (typeof timestamp.toMillis === "function") {
    return timestamp.toMillis();
  }

  if (typeof timestamp === "number") {
    return timestamp;
  }

  return 0;
};

export const useApp = () => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useApp must be used inside AppProvider");
  }

  return context;
};
