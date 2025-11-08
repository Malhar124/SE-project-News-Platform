import "./Sports.css";
import React, { useContext, useEffect, useState } from "react";
import { StoreContext } from "../../context/Storecontext";
import ArticleList from "../../components/articleList/ArticleList";
import Header from "../../components/header/Header";
import Pagecat from "../../components/pagecat/Pagecat";
import { assets } from "../../assets/assets";
import { toast } from "react-toastify";

const Sports = () => {
  const { fetchArticles, articles } = useContext(StoreContext);
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadArticles = async () => {
      try {
        await fetchArticles("sports");
      } catch (error) {
        console.error("Error loading sports articles:", error);
        toast.error("Failed to load sports news.");
      } finally {
        setLoading(false);
      }
    };
    loadArticles();
  }, [fetchArticles]);

  useEffect(() => {
    if (articles.length > 0) {
      const topSlides = articles
        .filter((a) => a.category === "sports" && a.urlToImage)
        .slice(0, 5)
        .map((a) => ({
          image: a.urlToImage,
          heading: a.title,
          description: a.description || a.content?.slice(0, 100) || "",
        }));
      setSlides(topSlides);
    }
  }, [articles]);

  const sportsCategories = [
    { image: assets.football, title: "Football", link: "football" },
    { image: assets.cricket, title: "Cricket", link: "cricket" },
    { image: assets.tennis, title: "Tennis", link: "tennis" },
    { image: assets.olympics, title: "Olympics", link: "olympics" },
  ];

  return (
    <div className="sportspage">
      <div className="pagecontent">
        <h2>All the latest sports headlines</h2>
        <h3>From cricket classics to football fever, stay up to date!</h3>
      </div>

      {slides.length > 0 ? (
        <Header slides={slides} />
      ) : (
        <p className="loading">Loading top sports stories...</p>
      )}

      {loading ? (
        <p className="loading">Fetching articles...</p>
      ) : (
        <ArticleList category="sports" cardtype="Newspreviewcard" />
      )}

      <Pagecat pageName="sports" categories={sportsCategories} />
    </div>
  );
};

export default Sports;