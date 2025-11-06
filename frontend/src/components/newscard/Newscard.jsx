import React from "react";
import { useNavigate } from "react-router-dom";
import "./Newscard.css";

const Newscard = ({ article }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/article/${article.id}`, { state: article });
  };

  return (
    <div className="news-card" onClick={handleClick}>
      <div className="news-image-wrapper">
        <img src={article.image} alt={article.title} className="news-image" />
        <div className="news-info">
          <span className="news-category">{article.category}</span>
          <h2 className="news-title">{article.title}</h2>
        </div>
      </div>
    </div>
  );
};

export default Newscard;
