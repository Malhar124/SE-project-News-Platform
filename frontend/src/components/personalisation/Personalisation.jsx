import React, { useState, useContext } from "react";
import "./Personalisation.css";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { StoreContext } from "../../context/Storecontext";
import { toast } from "react-toastify";

const Personalisation = () => {
  const categories = [
    "business",
    "entertainment",
    "general",
    "health",
    "science",
    "sports",
    "technology",
  ];

  const { token } = useContext(StoreContext);
  const [selected, setSelected] = useState([]);
  const [saving, setSaving] = useState(false);

  const handleCategoryClick = (cat) => {
    setSelected((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleSave = async () => {
    if (!token) {
      toast.error("Please sign in to personalize your feed.");
      return;
    }

    try {
      setSaving(true);
      const userId = localStorage.getItem("userId") || "guest";

      await setDoc(
        doc(db, "users", userId),
        { preferences: selected },
        { merge: true }
      );

      toast.success("Your preferences have been saved!");
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error("Failed to save preferences.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="personalise">
      <div className="pagecontent">
        <h2>Try Our Personalization</h2>
        <h3>Tailor your news to your interests.</h3>
        <h3>Click to customize your feed.</h3>
      </div>

      <div className="category-options">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`category-btn ${
              selected.includes(cat) ? "selected" : ""
            }`}
            onClick={() => handleCategoryClick(cat)}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      <button
        className="personalisebtn"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? "Saving..." : "Save Preferences"}
      </button>
    </div>
  );
};

export default Personalisation;