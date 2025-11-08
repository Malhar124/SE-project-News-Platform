import "./Newspage.css";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase"; // ✅ import Firestore
import { assets } from "../../assets/assets";

const Newspage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const docRef = doc(db, "articles", id); // ✅ replace "articles" with your collection name if different
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setArticle({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.warn("No article found for ID:", id);
        }
      } catch (error) {
        console.error("Error fetching article:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchArticle();
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

  return (
    <div className="newspage">
      <div className="newspageheader">
        <h1>{article.title}</h1>
        <div className="newspagetimestamp">
          <span>{article.category || "General"}</span>
          <span>
            {article.publishedAt
              ? new Date(article.publishedAt).toLocaleDateString()
              : "Unknown Date"}
          </span>
        </div>

        <img
          src={article.urlToImage || assets.placeholder}
          alt={article.title}
          className="newspage-image"
        />

        <div className="newspage-content">
          <p>{article.content || "No content available."}</p>
        </div>

        <div className="sharebtns">
          {/* Add share buttons here if needed */}
        </div>
      </div>
    </div>
  );
};

export default Newspage;