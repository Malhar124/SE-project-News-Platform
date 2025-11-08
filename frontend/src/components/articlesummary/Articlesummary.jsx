import "./Articlesummary.css";
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import DownloadArticlePDF from "../downloadarticle/DownloadArticlePDF";
import { assets } from "../../assets/assets";

const Articlesummary = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [article, setArticle] = useState(location.state || null);
  const [loading, setLoading] = useState(!location.state);
  const articleRef = useRef(null);

  // 🔥 Fetch article directly from Firestore if not passed via state
  useEffect(() => {
    const fetchArticle = async () => {
      if (!id || article) return;
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
        console.error("Error fetching article summary:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  if (loading) return <p>Loading article summary...</p>;

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

  // 🧠 Safe field extraction from your Firestore schema
  const title = article.title || "Untitled";
  const category = article.category || "General";
  const summary =
    article.summary || "No summary available yet. Please check back later.";

  return (
    <div
      ref={articleRef}
      id={`article-${article.id}`}
      className="summary-detail-container"
    >
      <img
        src={assets.backicon}
        className="backicon"
        alt="Go Back"
        onClick={() => navigate(-1)}
      />

      <h3 className="summary-category">{category}</h3>
      <h1 className="summary-title">{title}</h1>

      <h2>Summary</h2>
      <p className="summary-content">{summary}</p>

      <DownloadArticlePDF articleRef={articleRef} title={title} />
    </div>
  );
};

export default Articlesummary;