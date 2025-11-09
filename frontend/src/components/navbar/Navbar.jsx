import React, { useState, useEffect, useContext } from "react";
import "./Navbar.css";
import { assets } from "../../assets/assets";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { StoreContext } from "../../context/Storecontext";
import { auth } from "../../firebase"; // ✅ Import Firebase Auth
import { onAuthStateChanged, signOut } from "firebase/auth";
import {searchArticles} from "../../data/search"
const Navbar = () => {
  // SEARCH USESTATE
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const [menu, setMenu] = useState("home");
  const [navSearch, setNavSearch] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { setshowlogin, token, settoken } = useContext(StoreContext);
  const navigate = useNavigate();
  const location = useLocation();

// SEARCH USEEFFECT
  useEffect(() => {
    const fetchResults = async () => {
      if (!searchQuery) {
        setSearchResults([]);
        return;
      }
      try {
        const results = await searchArticles(searchQuery);
        setSearchResults(results);
      } catch (err) {
        console.error("Search error:", err);
        setSearchResults([]);
      }
    };
    fetchResults();
  }, [searchQuery]);



  // ✅ Track Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        localStorage.setItem("token", token);
        settoken(token);
      } else {
        localStorage.removeItem("token");
        settoken("");
      }
    });

    return () => unsubscribe();
  }, [settoken]);

  // ✅ Handle logout
  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem("token");
    settoken("");
    navigate("/");
  };

  // ✅ Highlight correct menu based on route
  useEffect(() => {
    const path = location.pathname;
    if (path === "/") setMenu("home");
    else if (path.includes("finance")) setMenu("finance");
    else if (path.includes("sports")) setMenu("sports");
    else if (path.includes("entertainment")) setMenu("entertainment");
    else if (path.includes("politics")) setMenu("politics");
    else if (path.includes("tech")) setMenu("technology");
  }, [location]);

  return (
    <div className="navbar">
      <Link to="/">
        <h1>NewsDesk</h1>
      </Link>

      {/* ---- Navigation Links ---- */}
      <div className={`navmenu ${navSearch ? "hide" : ""}`}>
        <ul>
          <Link
            to="/"
            onClick={() => setMenu("home")}
            className={menu === "home" ? "active" : ""}
          >
            Home
          </Link>
          <Link
            to="/finance"
            onClick={() => setMenu("finance")}
            className={menu === "finance" ? "active" : ""}
          >
            Finance
          </Link>
          <Link
            to="/sports"
            onClick={() => setMenu("sports")}
            className={menu === "sports" ? "active" : ""}
          >
            Sports
          </Link>
          <Link
            to="/entertainment"
            onClick={() => setMenu("entertainment")}
            className={menu === "entertainment" ? "active" : ""}
          >
            Entertainment
          </Link>
          <Link
            to="/politics"
            onClick={() => setMenu("politics")}
            className={menu === "politics" ? "active" : ""}
          >
            Politics
          </Link>
          <Link
            to="/tech"
            onClick={() => setMenu("technology")}
            className={menu === "technology" ? "active" : ""}
          >
            Technology
          </Link>
        </ul>
      </div>

      {/* ---- Right Icons ---- */}
      <div className="navright">

        {/* JSX FOR SEARCH INPUT */}
        <div className="navsearch">
          <input
            type="text"
            name="search"
            className={`inputsearch ${navSearch ? "show" : ""}`}
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <img
            onClick={() => setNavSearch((prev) => !prev)}
            src={assets.search_icon}
            alt=""
            className="search_icon"
          />

          {searchResults.length > 0 && (
            <div className="search-dropdown">
              {searchResults.map((article) => (
                <div
                  key={article.id}
                  className="search-result"
                  onClick={() => navigate(`/article/${article.id}`, { state: article })}
                >
                  <img
                    src={article.urlToImage || "https://via.placeholder.com/50"}
                    alt="thumbnail"
                    className="search-result-img"
                  />
                  <p className="search-result-title">{article.title}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ---- Login/Profile Section ---- */}
        {!token ? (
          <button className="btn signin" onClick={() => setshowlogin(true)}>
            Sign in
          </button>
        ) : (
          <div className="navprofile">
            <img src={assets.profile_icon} alt="profile" />
            <ul className="navprofiledropdown">
              <li onClick={() => navigate("/profile")}>
                <img src={assets.user} alt="" />
                <p>Profile</p>
              </li>
              <hr />
              <li onClick={logout}>
                <img src={assets.logout} alt="" />
                <p>Logout</p>
              </li>
            </ul>
          </div>
        )}

        {/* Hamburger Menu */}
        <img
          src={assets.menu_icon}
          alt="menu"
          className="menu_icon"
          onClick={() => setSidebarOpen(true)}
        />
      </div>

      {/* ---- Sidebar ---- */}
      <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h1>NewsDesk</h1>
          <span className="close-btn" onClick={() => setSidebarOpen(false)}>
            ×
          </span>
        </div>
        <ul>
          <Link to="/" onClick={() => { setMenu("home"); setSidebarOpen(false); }}>Home</Link>
          <Link to="/finance" onClick={() => { setMenu("finance"); setSidebarOpen(false); }}>Finance</Link>
          <Link to="/sports" onClick={() => { setMenu("sports"); setSidebarOpen(false); }}>Sports</Link>
          <Link to="/entertainment" onClick={() => { setMenu("entertainment"); setSidebarOpen(false); }}>Entertainment</Link>
          <Link to="/politics" onClick={() => { setMenu("politics"); setSidebarOpen(false); }}>Politics</Link>
          <Link to="/tech" onClick={() => { setMenu("technology"); setSidebarOpen(false); }}>Technology</Link>
        </ul>
      </div>

      {/* ---- Overlay ---- */}
      {sidebarOpen && (
        <div className="overlay" onClick={() => setSidebarOpen(false)}></div>
      )}
    </div>
  );
};

export default Navbar;