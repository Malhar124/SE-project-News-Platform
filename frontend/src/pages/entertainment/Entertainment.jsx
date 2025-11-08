import "./Entertainment.css";
import React, { useContext, useEffect, useState } from "react";
import { StoreContext } from "../../context/Storecontext";
import ArticleList from "../../components/articleList/ArticleList";
import Header from "../../components/header/Header";
import Pagecat from "../../components/pagecat/Pagecat";
import { assets } from "../../assets/assets";
import { toast } from "react-toastify";

const Entertainment = () => {
  const { fetchArticles, articles } = useContext(StoreContext);
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 Fetch entertainment articles (for both slides + list)
  useEffect(() => {
    const loadArticles = async () => {
      try {
        await fetchArticles("entertainment");
      } catch (error) {
        console.error("Error loading entertainment articles:", error);
        toast.error("Failed to load entertainment news.");
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, [fetchArticles]);

  // 🖼️ Generate slides dynamically when articles change
  useEffect(() => {
    if (articles.length > 0) {
      // Take top 5 articles for slider display
      const topSlides = articles
        .filter((a) => a.category === "entertainment" && a.urlToImage)
        .slice(0, 5)
        .map((a) => ({
          image: a.urlToImage,
          heading: a.title,
          description: a.description || a.content?.slice(0, 100) || "",
        }));

      setSlides(topSlides);
    }
  }, [articles]);

  const entertainmentCategories = [
    { image: assets.hollywood, title: "Hollywood news", link: "hollywood" },
    { image: assets.kpop, title: "Kpop updates", link: "kpop" },
    { image: assets.bollywood, title: "Bollywood updates", link: "bollywood" },
    { image: assets.tvstories, title: "TV stories", link: "tvstories" },
  ];

  return (
    <div className="entertainmentpage">
      <div className="pagecontent">
        <h2>Discover today’s most exciting entertainment news.</h2>
        <h3>From major celebrity moments to new releases and music headlines.</h3>
      </div>

      {/* ✅ Dynamic Header with Firestore Images */}
      {slides.length > 0 ? (
        <Header slides={slides} />
      ) : (
        <p className="loading">Loading top stories...</p>
      )}

      {/* ✅ Articles Section */}
      {loading ? (
        <p className="loading">Fetching articles...</p>
      ) : (
        <ArticleList category="entertainment" cardtype="Newspreviewcard" />
      )}

      {/* ✅ Subcategories */}
      <Pagecat pageName="entertainment" categories={entertainmentCategories} />
    </div>
  );
};

export default Entertainment;