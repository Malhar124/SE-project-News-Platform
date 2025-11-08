import "./Tech.css";
import React, { useContext, useEffect, useState } from "react";
import { StoreContext } from "../../context/Storecontext";
import ArticleList from "../../components/articleList/ArticleList";
import Header from "../../components/header/Header";
import Pagecat from "../../components/pagecat/Pagecat";
import { assets } from "../../assets/assets";
import { toast } from "react-toastify";

const Tech = () => {
  const { fetchArticles, articles } = useContext(StoreContext);
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadArticles = async () => {
      try {
        await fetchArticles("technology");
      } catch (error) {
        console.error("Error loading tech articles:", error);
        toast.error("Failed to load technology news.");
      } finally {
        setLoading(false);
      }
    };
    loadArticles();
  }, [fetchArticles]);

  useEffect(() => {
    if (articles.length > 0) {
      const topSlides = articles
        .filter((a) => a.category === "technology" && a.urlToImage)
        .slice(0, 5)
        .map((a) => ({
          image: a.urlToImage,
          heading: a.title,
          description: a.description || a.content?.slice(0, 100) || "",
        }));
      setSlides(topSlides);
    }
  }, [articles]);

  const techCategories = [
    { image: assets.ai, title: "AI", link: "ai" },
    { image: assets.startup, title: "Startups", link: "startups" },
    { image: assets.gadgets, title: "Gadgets", link: "gadgets" },
    { image: assets.space, title: "Space Tech", link: "space" },
  ];

  return (
    <div className="techpage">
      <div className="pagecontent">
        <h2>Explore the latest in technology innovation</h2>
        <h3>AI breakthroughs, new gadgets, and digital trends.</h3>
      </div>

      {slides.length > 0 ? (
        <Header slides={slides} />
      ) : (
        <p className="loading">Loading top tech stories...</p>
      )}

      {loading ? (
        <p className="loading">Fetching articles...</p>
      ) : (
        <ArticleList category="technology" cardtype="Newspreviewcard" />
      )}

      <Pagecat pageName="tech" categories={techCategories} />
    </div>
  );
};

export default Tech;