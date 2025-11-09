import "./Finance.css";
import React, { useContext, useEffect, useState } from "react";
import { StoreContext } from "../../context/Storecontext";
import ArticleList from "../../components/articleList/ArticleList";
import Header from "../../components/header/Header";
import Pagecat from "../../components/pagecat/Pagecat";
import { assets } from "../../assets/assets";
import { toast } from "react-toastify";

const Finance = () => {
  const { fetchArticles, articles } = useContext(StoreContext);
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadArticles = async () => {
      try {
        await fetchArticles("business");
      } catch (error) {
        console.error("Error loading finance articles:", error);
        toast.error("Failed to load finance news.");
      } finally {
        setLoading(false);
      }
    };
    loadArticles();
  }, [fetchArticles]);

  useEffect(() => {
    if (articles.length > 0) {
      const topSlides = articles
        .filter((a) => a.category === "business" && a.urlToImage)
        .slice(0, 5)
        .map((a) => ({
          image: a.urlToImage,
          heading: a.title,
          description: a.description || a.content?.slice(0, 100) || "",
        }));
      setSlides(topSlides);
    }
  }, [articles]);

  const financeCategories = [
    { image: assets.market, title: "Markets", link: "markets" },
    { image: assets.economy, title: "Economy", link: "economy" },
    { image: assets.crypto, title: "Cryptocurrency", link: "crypto" },
    { image: assets.policy, title: "Policy", link: "policy" },
  ];

  return (
    <div className="financepage">
      <div className="pagecontent">
        <h2>Track the latest in finance and business</h2>
        <h3>Markets, economy, policy, and innovation updates.</h3>
      </div>

      {slides.length > 0 ? (
        <Header slides={slides} />
      ) : (
        <p className="loading">Loading finance highlights...</p>
      )}

      {loading ? (
        <p className="loading">Fetching finance articles...</p>
      ) : (
        <ArticleList category="business" cardtype="Newspreviewcard" />
      )}

      <Pagecat pageName="finance" categories={financeCategories} />
    </div>
  );
};

export default Finance;