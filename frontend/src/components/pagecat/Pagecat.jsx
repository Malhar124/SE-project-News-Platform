import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase"; // ✅ Make sure this points to your frontend Firebase config
import "./Pagecat.css";

const Pagecat = ({ pageName }) => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch distinct categories from Firestore
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Get articles (you could use any collection like "articles" or "technology")
        const querySnapshot = await getDocs(collection(db, "articles"));
        const categoryMap = new Map();

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const cat = data.category || "general";

          // Collect only one article per category for preview
          if (!categoryMap.has(cat)) {
            categoryMap.set(cat, {
              title: cat.charAt(0).toUpperCase() + cat.slice(1),
              image:
                data.urlToImage ||
                "https://placehold.co/300x200?text=No+Image",
              link: cat,
            });
          }
        });

        setCategories(Array.from(categoryMap.values()));
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleClick = (category) => {
    navigate(`/${category.link}`);
  };

  if (loading) return <p>Loading categories...</p>;

  return (
    <div className="pagecat">
      {categories.map((cat, index) => (
        <div
          key={index}
          className="pagecat-card"
          onClick={() => handleClick(cat)}
        >
          <img
            src={cat.image}
            alt={cat.title}
            className="pagecat-image"
          />
          <p>{cat.title}</p>
        </div>
      ))}
    </div>
  );
};

export default Pagecat;