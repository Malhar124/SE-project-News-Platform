import React from "react";
import { useNavigate } from "react-router-dom";
import "./Newspreviewcard.css";

const Newspreviewcard = ({ article }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/article/${article.id}`, { state: article });
  };

  return (
    <div className="news-preview-card" onClick={handleClick}>
      <img src={article.image} alt={article.title} className="preview-image" />
      <div className="preview-content">
        <span className="preview-category">{article.category}</span>
        <h2 className="preview-title">{article.title}</h2>
        <p className="preview-text">
          {article.content.slice(0, 100)}...
        </p>
      </div>
    </div>
  );
};

export default Newspreviewcard;
