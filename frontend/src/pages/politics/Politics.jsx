import "./Politics.css";
import React, { useContext, useEffect, useState } from "react";
import { StoreContext } from "../../context/Storecontext";
import ArticleList from "../../components/articleList/ArticleList";
import Header from "../../components/header/Header";
import Pagecat from "../../components/pagecat/Pagecat";
import { assets } from "../../assets/assets";
import { toast } from "react-toastify";

const Politics = () => {
  const { fetchArticles, articles } = useContext(StoreContext);
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadArticles = async () => {
      try {
        await fetchArticles("politics");
      } catch (error) {
        console.error("Error loading political articles:", error);
        toast.error("Failed to load political news.");
      } finally {
        setLoading(false);
      }
    };
    loadArticles();
  }, [fetchArticles]);

  useEffect(() => {
    if (articles.length > 0) {
      const topSlides = articles
        .filter((a) => a.category === "politics" && a.urlToImage)
        .slice(0, 5)
        .map((a) => ({
          image: a.urlToImage,
          heading: a.title,
          description: a.description || a.content?.slice(0, 100) || "",
        }));
      setSlides(topSlides);
    }
  }, [articles]);

  const politicsCategories = [
    { image: assets.diplomacy, title: "Global Affairs", link: "global" },
    { image: assets.election, title: "Elections", link: "elections" },
    { image: assets.policy, title: "Policy & Governance", link: "policy" },
    { image: assets.research, title: "Public Opinion", link: "opinion" },
  ];

  return (
    <div className="politicspage">
      <div className="pagecontent">
        <h2>Stay informed on politics and world affairs</h2>
        <h3>Covering policy, governance, and global diplomacy.</h3>
      </div>

      {slides.length > 0 ? (
        <Header slides={slides} />
      ) : (
        <p className="loading">Loading top political stories...</p>
      )}

      {loading ? (
        <p className="loading">Fetching articles...</p>
      ) : (
        <ArticleList category="politics" cardtype="Newspreviewcard" />
      )}

      <Pagecat pageName="politics" categories={politicsCategories} />
    </div>
  );
};

export default Politics;