// src/services/localStorageService.js
const LOCAL_KEY = "monthly-expenditure-tracker-demo";

const makeId = (prefix = "local") =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

export const loadLocalData = () => {
  try {
    const raw = globalThis.localStorage.getItem(LOCAL_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...parsed,
        income: parsed.income || [],
        incomeSources: parsed.incomeSources || [],
      };
    }
  } catch (error) {
    console.error("Error loading local data:", error);
  }

  return null;
};

export const saveLocalData = (data) => {
  try {
    globalThis.localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving local data:", error);
  }
};

export const createLocalId = makeId;
