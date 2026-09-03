import { Navigate, Route, Routes } from "react-router-dom";
import { useApp } from "./context/AppContext";
import AppShell from "./components/AppShell";
import LoadingScreen from "./components/LoadingScreen";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AddExpense from "./pages/AddExpense";
import Expenses from "./pages/Expenses";
import Categories from "./pages/Categories";
import Settings from "./pages/Settings";
import Income from "./pages/Income";
import AddIncome from "./pages/AddIncome";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  const { authLoading, user, firebaseConfigured } = useApp();

  if (authLoading) {
    return <LoadingScreen fullScreen />;
  }

  // Firebase is configured and there is no authenticated user.
  // Show the login/create-account screen.
  if (firebaseConfigured && !user) {
    return <Auth />;
  }

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add" element={<AddExpense />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/income" element={<Income />} />
        <Route path="/income/add" element={<AddIncome />} />
        <Route path="/income/edit/:id" element={<AddIncome />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
