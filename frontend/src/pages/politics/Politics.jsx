import React from 'react'
import ArticleList from '../../components/articleList/ArticleList.jsx'
import "./Politics.css"
import { assets } from '../../assets/assets.js' // Assuming assets.js
import Header from '../../components/header/Header.jsx'

const Politics = () => {
  const slides = [
      // ... your slides data
    ];
  return (
    <div className='politics'>
      <div className="pagecontent">
        <h2>Top Geopolitical News Today</h2>
        <h3>Analysis & headlines for a changing world.</h3>
      </div>
      <Header slides={slides}/>
      {/* This component will now fetch its own data.
        The 'cardtype' prop is no longer used by our new ArticleList.
        We'll use one ArticleList component.
      */}
      <ArticleList 
        category="politics" // "politics" is not a valid category, use "general"
        defaultQuery="latest politics" 
      />
    </div>
  )
}

export default Politics