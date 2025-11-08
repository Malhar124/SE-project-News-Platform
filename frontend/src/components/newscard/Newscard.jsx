import React from "react";
import { useNavigate } from "react-router-dom";
import "./Newscard.css";

const Newscard = ({ article }) => {
  const navigate = useNavigate();

  // Firestore documents don’t have an `id` field in data,
  // but Firestore gives you a `doc.id` — so we pass it as `article.id`
  const handleClick = () => {
    if (!article.id) {
      console.warn("Missing article.id – ensure you're passing Firestore doc.id");
      return;
    }
    navigate(`/article/${article.id}`, { state: article });
  };

  return (
    <div className="news-card" onClick={handleClick}>
      <div className="news-image-wrapper">
        <img
          src={article.urlToImage || "https://via.placeholder.com/400x200?text=No+Image"}
          alt={article.title}
          className="news-image"
        />
        <div className="news-info">
          <span className="news-category">{article.category}</span>
          <h2 className="news-title">{article.title}</h2>
        </div>
      </div>
    </div>
  );
};

export default Newscard;