import React from "react";
import { useNavigate } from "react-router-dom";
import "./Newspreviewcard.css";

const Newspreviewcard = ({ article }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (!article.id) {
      console.warn("Missing article.id – ensure you're passing Firestore doc.id");
      return;
    }
    navigate(`/article/${article.id}`, { state: article });
  };

  return (
    <div className="news-preview-card" onClick={handleClick}>
      <img
        src={article.urlToImage || "https://placehold.co/300x200?text=No+Image"}
        alt={article.title}
        className="preview-image"
      />
      <div className="preview-content">
        <span className="preview-category">{article.category}</span>
        <h2 className="preview-title">{article.title}</h2>
        <p className="preview-text">
          {article.content ? article.content.slice(0, 120) + "..." : "No content available."}
        </p>
      </div>
    </div>
  );
};

export default Newspreviewcard;