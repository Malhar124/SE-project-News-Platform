import React, { useState, useEffect } from "react";
import "./Header.css";
import { getArticles } from "../../data/firestore"; // Firestore helper

const Header = () => {
  const [slides, setSlides] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // 🔥 Fetch top headlines from Firestore
  useEffect(() => {
    async function fetchTopSlides() {
      try {
        const generalArticles = await getArticles("general"); // category from Firestore
        // Take first 5 articles for slideshow
        const topFive = generalArticles.slice(0, 5).map((article) => ({
          image: article.urlToImage || "https://via.placeholder.com/800x400?text=No+Image",
          heading: article.title,
          description: article.content
            ? article.content.substring(0, 150) + "..."
            : "Latest update from global news and events.",
        }));

        setSlides(topFive);
      } catch (error) {
        console.error("Error fetching slides:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTopSlides();
  }, []);

  // Navigation Handlers
  const handleNext = () => {
    setCurrentIndex((prev) =>
      slides.length ? (prev + 1) % slides.length : 0
    );
  };

  const handlePrev = () => {
    setCurrentIndex((prev) =>
      slides.length ? (prev - 1 + slides.length) % slides.length : 0
    );
  };

  if (loading) {
    return <div className="header">Loading top stories...</div>;
  }

  if (!slides.length) {
    return (
      <div className="header">
        <p>No top stories available at the moment.</p>
      </div>
    );
  }

  const currentSlide = slides[currentIndex];

  return (
    <div className="header">
      <div className="slider">
        <img
          src={currentSlide.image}
          alt={`slide-${currentIndex}`}
          className="slide-image"
        />
        <div className="header-contents">
          <h2>{currentSlide.heading}</h2>
          <p>{currentSlide.description}</p>
          <div className="nav-btn">
            <button className="prev" onClick={handlePrev}>◀</button>
            <button className="next" onClick={handleNext}>▶</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;