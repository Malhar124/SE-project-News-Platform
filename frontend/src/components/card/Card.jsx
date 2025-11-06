import "./Card.css";
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
// Corrected path from components/card -> components -> src -> context
import { StoreContext } from '../../context/Storecontext.jsx'; 

const Card = ({ article }) => {
  // Use speakText, bookmark, etc. from context
  const { speakText, bookmark, removeBookmark, userProfile, user, setShowLogin } = useContext(StoreContext);

  if (!article) return null; // Don't render if article is missing

  // Check if the article is bookmarked
  const isBookmarked = userProfile?.bookmarkedArticles?.includes(article.id);

  const handleBookmarkToggle = (e) => {
    e.preventDefault(); // Stop click from navigating
    e.stopPropagation(); // Stop click from bubbling
    if (!user) {
        setShowLogin(true);
        return;
    }
    if (isBookmarked) {
      removeBookmark(article.id);
    } else {
      bookmark(article.id);
    }
  };

  const handleSpeak = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
        setShowLogin(true);
        return;
    }
    // Speak the summary, fall back to description or title
    speakText(article.summary || article.description || article.title);
  };

  return (
    // Link the whole card to the article detail page
    <Link to={`/article/${article.id}`} className="home-news-card">
      <img 
        // Use the correct schema field 'urlToImage'
        src={article.urlToImage || 'https://placehold.co/600x400/eee/ccc?text=No+Image'} 
        alt={article.title} 
        className="home-image" 
        // Add a fallback for broken image links
        onError={(e) => e.target.src = 'https://placehold.co/600x400/eee/ccc?text=Image+Error'}
      />
      <div className="home-content">
        {/* Add source name */}
        <span className="home-source">{article.source?.name || 'News Source'}</span>
        <h2 className="home-title">{article.title}</h2>
        {/* Use 'summary' or 'description' from Firestore, not 'content' */}
        <p className="home-text">
          {article.summary || article.description}
        </p>
        {/* Add action buttons */}
        <div className="card-actions">
           <button onClick={handleSpeak} title="Speak Summary">
             Speak
           </button>
           <button onClick={handleBookmarkToggle} title="Bookmark">
             {isBookmarked ? "Bookmarked" : "Bookmark"}
           </button>
         </div>
      </div>
    </Link>
  );
}

export default Card;