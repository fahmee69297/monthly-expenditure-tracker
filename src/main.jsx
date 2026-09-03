import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";
import App from "./App";
import { AppProvider } from "./context/AppContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProvider>
        <App />
        <ToastContainer
          position="top-center"
          autoClose={2600}
          newestOnTop
          theme="dark"
          closeOnClick
          pauseOnFocusLoss={false}
        />
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>
);
