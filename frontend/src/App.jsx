// src/App.jsx
import React, { useContext } from "react";
import { Route, Routes } from "react-router-dom";
import Navbar from "./components/navbar/Navbar";
import Home from "./pages/home/Home";
import Tech from "./pages/tech/Tech";
import Sports from "./pages/sports/Sports";
import Politics from "./pages/politics/Politics";
import Entertainment from "./pages/entertainment/Entertainment";
import Finance from "./pages/finance/Finance";
import ArticleList from "./components/articleList/ArticleList";
import ArticleDetail from "./components/articledetail/ArticleDetail";
import Articlesummary from "./components/articlesummary/Articlesummary";
import Loginpopup from "./components/loginpopup/Loginpopup";
import Profilepage from "./components/profilepage/Profilepage";
import { ToastContainer } from "react-toastify";

import { StoreContext } from "./context/Storecontext";

// ✅ Import Firebase Auth Context
import { AuthProvider } from "./context/AuthContext";

const App = () => {
  const { showlogin } = useContext(StoreContext);

  return (
    <AuthProvider>
      <div className="app">
        <ToastContainer />
        {showlogin && <Loginpopup />}
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tech" element={<Tech />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/sports" element={<Sports />} />
          <Route path="/politics" element={<Politics />} />
          <Route path="/entertainment" element={<Entertainment />} />
          <Route path="/article/:id" element={<ArticleDetail />} />
          <Route path="/article/summary/:id" element={<Articlesummary />} />
          <Route path="/profile" element={<Profilepage />} />
        </Routes>
      </div>
    </AuthProvider>
  );
};

export default App;