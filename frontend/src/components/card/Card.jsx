import "./Card.css";
import React from "react";

const Card = ({ article }) => {
  // 🔍 Extract values safely from Firestore schema
  const imageUrl = article.urlToImage || "/placeholder-news.jpg";
  const title = article.title || "Untitled Article";
  const content =
    article.description ||
    (article.content
      ? article.content.slice(0, 180) + "..."
      : "No content available.");

  return (
    <div className="home-news-card">
      <img src={imageUrl} alt={title} className="home-image" />
      <div className="home-content">
        <h2 className="home-title">{title}</h2>
        <p className="home-text">{content}</p>
      </div>
    </div>
  );
};

export default Card;