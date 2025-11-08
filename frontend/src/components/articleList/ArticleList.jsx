import "./articleList.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getArticles } from "../../data/firestore";
import Newscard from "../newscard/Newscard";
import Newspreviewcard from "../newscard2/Newspreviewcard";

const ArticleList = ({ category, cardtype }) => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticles() {
      setLoading(true);
      const fetched = await getArticles(category);
      setArticles(fetched);
      setLoading(false);
    }
    fetchArticles();
  }, [category]);

  if (loading) {
    return <div className="loading">Loading articles...</div>;
  }

  return (
    <div className="article-list">
      {articles.length === 0 ? (
        <p>No articles found.</p>
      ) : (
        articles.map((a, ind) =>
          cardtype === "Newspreviewcard" ? (
            <Newspreviewcard key={a.id || ind} article={a} />
          ) : (
            <Newscard key={a.id || ind} article={a} />
          )
        )
      )}
    </div>
  );
};

export default ArticleList;