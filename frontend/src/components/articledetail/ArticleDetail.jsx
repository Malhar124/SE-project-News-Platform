import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
// Corrected import path: from components/articledetail -> components -> src -> context
import { StoreContext } from '../../context/Storecontext.jsx';
import { RingLoader } from 'react-spinners'; // Example spinner

const ArticleDetail = () => {
    const { id: articleId } = useParams(); // Get the article ID from the URL
    const { 
        speakText, 
        bookmark, 
        removeBookmark, 
        userProfile,
        user,
        setShowLogin,
        getArticleById // Use the function from context
    } = useContext(StoreContext);
    
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);

    // 1. Fetch the full article from Firestore using its ID
    useEffect(() => {
        if (!articleId) return;

        const fetchArticle = async () => {
            setLoading(true);
            const articleData = await getArticleById(articleId);
            if (articleData) {
                setArticle(articleData);
            } else {
                setError("Article not found.");
            }
            setLoading(false);
        };

        fetchArticle();
    }, [articleId, getArticleById]); // Re-run if the ID in the URL changes

    // 2. Check if this article is in the user's bookmarks
    useEffect(() => {
        if (userProfile && userProfile.bookmarkedArticles) {
            setIsBookmarked(userProfile.bookmarkedArticles.includes(articleId));
        } else {
            setIsBookmarked(false);
        }
    }, [userProfile, articleId]); // Re-check when profile or article changes

    // 3. Define action handlers
    const handleSpeak = () => {
        if (!user) {
            setShowLogin(true);
            return;
        }
        if (article?.summary) {
            setIsSpeaking(true);
            // speakText returns a promise, so we can chain .finally
            speakText(article.summary).finally(() => setIsSpeaking(false));
        } else if (article?.description) {
            setIsSpeaking(true);
            speakText(article.description).finally(() => setIsSpeaking(false));
        }
    };

    const handleBookmarkToggle = () => {
        if (!user) {
            setShowLogin(true);
            return;
        }
        if (isBookmarked) {
            removeBookmark(articleId);
        } else {
            bookmark(articleId);
        }
    };

    // 4. Render states
    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <RingLoader color="#007bff" size={80} />
            </div>
        );
    }
    
    if (error) return <div style={{ padding: '20px', color: 'red', textAlign: 'center' }}>{error}</div>;
    if (!article) return <div style={{ padding: '20px', textAlign: 'center' }}>Article not found.</div>;

    // 5. Render the article
    return (
        <div className='article-detail' style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
            <h1>{article.title}</h1>
            <p><strong>Source:</strong> {article.source?.name} | <strong>Published:</strong> {new Date(article.publishedAt).toLocaleString()}</p>
            
             <img 
                src={article.urlToImage || 'https://placehold.co/600x400/eee/ccc?text=No+Image'} 
                alt={article.title} 
                style={{ width: '100%', height: 'auto', borderRadius: '8px', margin: '20px 0' }}
                onError={(e) => e.target.src = 'https://placehold.co/600x400/eee/ccc?text=Image+Error'}
             />
            
            <div className='article-actions' style={{ margin: '20px 0', display: 'flex', gap: '10px' }}>
                <button 
                    onClick={handleSpeak} 
                    disabled={isSpeaking || !user}
                    style={styles.actionButton}
                >
                    {isSpeaking ? "Speaking..." : "Speak Summary"}
                </button>
                <button 
                    onClick={handleBookmarkToggle} 
                    disabled={!user}
                    style={styles.actionButton}
                >
                    {isBookmarked ? "Remove Bookmark" : "Add Bookmark"}
                </button>
            </div>
            
            <div className='article-summary' style={{ marginBottom: '30px', background: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
                <h2>Summary</h2>
                {/* Render the summary, which may contain bullet points (as string) */}
                <div style={{ whiteSpace: 'pre-wrap' }}>
                    {article.summary || "No summary available."}
                </div>
            </div>

            {/* We don't render full_clean_content, it's just for the backend */}
            <a href={article.url} target="_blank" rel="noopener noreferrer">
                Read Full Article at {article.source?.name}
            </a>
        </div>
    );
};

// --- Basic CSS-in-JS for Demonstration ---
const styles = {
    actionButton: {
        padding: '10px 15px',
        border: 'none',
        borderRadius: '8px',
        backgroundColor: '#007bff',
        color: 'white',
        cursor: 'pointer'
    }
};

export default ArticleDetail;