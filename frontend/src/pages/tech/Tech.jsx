import React from 'react';
// Import the dynamic ArticleList, not the mock
import ArticleList from '../../components/articleList/ArticleList.jsx'; 
// We no longer need useState, useEffect, or useContext here

const Tech = () => {
    // The fetching logic is now inside ArticleList.
    // We just need to tell it what to fetch.
    return (
        <div className='tech-page' style={{ padding: '20px' }}>
            <h2>Technology News</h2>
            {/* This component will now do its own data fetching 
              when it mounts, using the props we pass it.
            */}
            <ArticleList 
                category="technology" 
                defaultQuery="latest technology" 
            />
        </div>
    );
};

export default Tech;