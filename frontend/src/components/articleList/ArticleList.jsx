import "./articleList.css";
import React, { useState, useEffect, useContext } from 'react';
// Corrected path from components/articleList -> components -> src -> context
import { StoreContext } from "../../context/Storecontext.jsx";
// Import your Card component, not the old ones
import Card from "../card/Card.jsx"; 
import { RingLoader } from "react-spinners"; // Example spinner
import { useNavigate } from "react-router-dom"; // Not used here, but was in your file
// Removed: articlesData, Newscard, Newspreviewcard

/**
 * A dynamic component that fetches and displays a list of articles
 * based on a category and/or a default search query.
 */
const ArticleList = ({ category, defaultQuery, cardtype }) => { // cardtype prop is no longer needed but kept
  const { searchArticles, user, setShowLogin } = useContext(StoreContext);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only fetch articles if the user is logged in
    if (user) {
      setLoading(true);
      
      // Use the 'searchArticles' function from the context
      // to fetch articles based on the props provided.
      // Use the category name as the default query
      const query = defaultQuery || category;
      searchArticles(query, category)
        .then(fetchedArticles => {
          setArticles(fetchedArticles);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false); // Handle errors
        });
    } else {
      setLoading(false); // Not logged in, don't load
    }
  }, [user, category, defaultQuery, searchArticles]); // Re-fetch if these change

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <RingLoader color="#007bff" size={60} />
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <p>Please log in to view articles.</p>
        <button onClick={() => setShowLogin(true)} style={{padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '10px'}}>Login</button>
      </div>
    );
  }

  if (articles.length === 0) {
    return <p style={{ textAlign: 'center' }}>No articles found for this category.</p>;
  }

  // We have articles, render them using the Card component
  return (
    <div className="article-list">
      {articles.map((article) => (
        // Use the Card component you provided, passing the article object
        // The 'id' field is automatically added by the search function
        <Card key={article.id} article={article} />
      ))}
    </div>
  );
};

export default ArticleList;