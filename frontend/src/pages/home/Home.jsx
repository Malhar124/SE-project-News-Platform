import React, { useState, useContext } from 'react'
import Header from '../../components/header/Header.jsx'
import { assets } from '../../assets/assets.js'; // Assuming assets.js is not .jsx
import "./Home.css"
import Explore from '../../components/explore/Explore.jsx';
import Personalisation from '../../components/personalisation/Personalisation.jsx';
import Footer from '../../components/footer/Footer.jsx';
import { StoreContext } from '../../context/Storecontext.jsx';
import ArticleList from '../../components/articleList/ArticleList.jsx';
import { RingLoader } from 'react-spinners';

const Home = () => {
    const { searchArticles, user, setShowLogin } = useContext(StoreContext);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false); // Track if a search has been performed

    // Your existing slides data
    const slides = [
        {
          image: assets.shops,
          heading: "Lights that warn planes of obstacles were exposed to Open Internet",
          description:
            "Choose from a diverse menu featuring a delectable array of dishes crafted with the finest ingredients and culinary expertise. Our mission is to satisfy your cravings and elevate your dining experience, one delicious meal at a time.",
        },
        {
          image: assets.labs,
          heading: "State-of-the-Art Research Labs Unveiled",
          description:
            "Medical researchers have introduced advanced blood-testing methods that reduce diagnosis time by 60%.",
        },
        // ... other slides
    ];

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        if (!user) {
            setShowLogin(true); // Ask user to log in before searching
            return;
        }

        setIsSearching(true);
        setHasSearched(true); // Mark that a search was performed
        const results = await searchArticles(searchQuery, null); // No category filter
        setSearchResults(results);
        setIsSearching(false);
    };

    return (
        <div className='home'>
            <Header slides={slides} />
            
            {/* --- Search Bar Section --- */}
            <div className='home-search-section' style={{ padding: '40px 20px', textAlign: 'center' }}>
                <h2 style={{ fontSize: '28px', fontWeight: 'bold' }}>Search All News</h2>
                <form onSubmit={handleSearch} style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                    <input 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for any topic (e.g., 'AI in healthcare')"
                        style={{ padding: '10px', width: '400px', borderRadius: '8px 0 0 8px', border: '1px solid #ccc' }}
                    />
                    <button type="submit" style={{ padding: '10px 20px', border: 'none', background: '#007bff', color: 'white', borderRadius: '0 8px 8px 0', cursor: 'pointer' }}>
                        Search
                    </button>
                </form>
            </div>

            {/* --- Search Results Section --- */}
            <div className='search-results' style={{ padding: '20px' }}>
                {isSearching && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
                        <RingLoader color="#007bff" size={60} />
                    </div>
                )}
                
                {!isSearching && hasSearched && (
                    <>
                        <h3 style={{ fontSize: '24px', fontWeight: 'bold' }}>Search Results</h3>
                        {searchResults.length > 0 ? (
                            // Use the dynamic ArticleList to show results
                            // We pass the *results* directly, not fetch logic
                            <div className="article-list">
                                {searchResults.map((article) => (
                                    <Card key={article.id} article={article} />
                                ))}
                            </div>
                        ) : (
                            <p>No results found for "{searchQuery}".</p>
                        )}
                    </>
                )}
            </div>
            
            <Explore/>
            <Personalisation/>
            <Footer/>
        </div>
    )
}

export default Home