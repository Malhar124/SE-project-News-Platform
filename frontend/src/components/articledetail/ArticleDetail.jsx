import "./ArticleDetail.css";
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import DownloadArticlePDF from "../downloadarticle/DownloadArticlePDF";

const ArticleDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [article, setArticle] = useState(location.state || null);
  const [loading, setLoading] = useState(!location.state);
  const articleRef = useRef(null);

  // 🔥 Fetch from Firestore if article not passed through navigation
  useEffect(() => {
    const fetchArticle = async () => {
      if (!id || article) return; // already loaded from navigation state
      setLoading(true);
      try {
        const docRef = doc(db, "articles", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setArticle({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.warn("No such article found!");
        }
      } catch (err) {
        console.error("Error fetching article:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  if (loading) return <p>Loading article...</p>;

  if (!article)
    return (
      <div>
        <p>
          Article not found.{" "}
          <span
            onClick={() => navigate("/")}
            style={{ color: "blue", cursor: "pointer" }}
          >
            Go back
          </span>
        </p>
      </div>
    );

  // 🧠 Fix image and content field names to match your Firestore schema
  const imageUrl = article.urlToImage || "/placeholder-news.jpg";
  const content = article.full_clean_content || article.description || "No content available.";

  const handleClick = () => {
    navigate(`/article/summary/${article.id}`, { state: article });
  };

  return (
    <div
      ref={articleRef}
      id={`article-${article.id}`}
      className="article-detail-container"
    >
      <h3 className="article-category">{article.category || "General"}</h3>
      <h1 className="article-title">{article.title}</h1>
      <img src={imageUrl} alt={article.title} className="article-image" />
      <p className="article-content">{content}</p>

      <DownloadArticlePDF articleRef={articleRef} title={article.title} />
      <button className="summary-btn" onClick={handleClick}>
        Summary
      </button>
    </div>
  );
};

export default ArticleDetail;