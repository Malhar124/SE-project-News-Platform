import React, { useEffect, useState } from "react";
import "./Explore.css";
import Card from "../card/Card";
import { getArticles } from "../../data/firestore"; // Firestore helper

const Explore = () => {
  const [topStories, setTopStories] = useState([]);
  const [localNews, setLocalNews] = useState([]);
  const [picksForYou, setPicksForYou] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 Fetch Firestore data from actual categories
  useEffect(() => {
    async function fetchExploreData() {
      setLoading(true);
      try {
        const [general, business, technology] = await Promise.all([
          getArticles("general"),     // 📰 Top Stories
          getArticles("business"),    // 🏙️ Local/Business News
          getArticles("technology"),  // 💡 Picks for You
        ]);

        setTopStories(general);
        setLocalNews(business);
        setPicksForYou(technology);
      } catch (err) {
        console.error("Error fetching Explore data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchExploreData();
  }, []);

  if (loading) {
    return <div className="loading">Loading latest news...</div>;
  }

  return (
    <div className="explore">
      {/* 📰 Top Stories (general) */}
      {topStories.length > 0 ? (
        <Card article={topStories[0]} />
      ) : (
        <Card
          article={{
            image:
              "https://www.hindustantimes.com/ht-img/img/2025/09/09/550x309/Trump_Modi_1757455109183_1757455109296.jpg",
            title: "Top Stories",
            content:
              "Breaking and trending news updated around the clock for what matters the most.",
          }}
        />
      )}

      {/* 🏙️ Local / Business News */}
      {localNews.length > 0 ? (
        <Card article={localNews[0]} />
      ) : (
        <Card
          article={{
            image:
              "https://reutersinstitute.politics.ox.ac.uk/sites/default/files/2024-08/hanna-pic.jpg",
            title: "Business Updates",
            content:
              "Stay up to date with market movements, company news, and local business insights.",
          }}
        />
      )}

      {/* 💡 Picks For You (Technology) */}
      {picksForYou.length > 0 ? (
        <Card article={picksForYou[0]} />
      ) : (
        <Card
          article={{
            image:
              "https://f.fseo99.com/asserts/indian/images/watermark_20250106_40_w1.jpg",
            title: "Picks For You",
            content:
              "Trending technology updates and personalized recommendations just for you.",
          }}
        />
      )}
    </div>
  );
};

export default Explore;