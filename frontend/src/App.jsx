// src/App.jsx
import React, { useContext } from "react";
import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";

// --- Components & Pages ---
import Navbar from "./components/navbar/Navbar";
import Loginpopup from "./components/loginpopup/Loginpopup";
import Home from "./pages/home/Home";
import Tech from "./pages/tech/Tech";
import Sports from "./pages/sports/Sports";
import Politics from "./pages/politics/Politics";
import Entertainment from "./pages/entertainment/Entertainment";
import Finance from "./pages/finance/Finance";
import ArticleDetail from "./components/articledetail/ArticleDetail";
import Articlesummary from "./components/articlesummary/Articlesummary";
import Profilepage from "./components/profilepage/Profilepage";

// --- Contexts ---
import { StoreContext } from "./context/Storecontext";
import { AuthProvider } from "./context/AuthContext";

// --- Styles & Toastify ---
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  const { showlogin } = useContext(StoreContext);

  return (
    <AuthProvider>
      <div className="app">
        {/* ✅ Toast Notifications */}
        <ToastContainer position="bottom-right" autoClose={2500} theme="colored" />

        {/* ✅ Conditional Login Popup */}
        {showlogin && <Loginpopup />}

        {/* ✅ Persistent Navbar */}
        <Navbar />

        {/* ✅ Route Definitions */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/technology" element={<Tech />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/sports" element={<Sports />} />
          <Route path="/politics" element={<Politics />} />
          <Route path="/entertainment" element={<Entertainment />} />

          {/* Article Routes */}
          <Route path="/article/:id" element={<ArticleDetail />} />
          <Route path="/article/summary/:id" element={<Articlesummary />} />

          {/* Profile Management */}
          <Route path="/profile" element={<Profilepage />} />
        </Routes>
      </div>
    </AuthProvider>
  );
};

export default App;