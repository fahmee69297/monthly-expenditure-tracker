// src/hooks/useAuth.js
import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, firebaseConfigured } from "../firebase";
import { loadLocalData } from "../services/localStorageService";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(firebaseConfigured);

  useEffect(() => {
    if (!firebaseConfigured) {
      // Demo mode
      const localData = loadLocalData();
      if (localData) {
        setUser({
          uid: "local-demo-user",
          isAnonymous: true,
          demoMode: true,
        });
      } else {
        setUser({
          uid: "local-demo-user",
          isAnonymous: true,
          demoMode: true,
        });
      }
      setAuthLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser?.isAnonymous) {
          await signOut(auth);
          setUser(null);
        } else {
          setUser(currentUser);
        }
      } catch (error) {
        console.error("Authentication state error:", error);
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  return { user, authLoading };
}
