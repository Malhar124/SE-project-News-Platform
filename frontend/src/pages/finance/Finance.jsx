import React from 'react'
import ArticleList from '../../components/articleList/ArticleList.jsx'

const Finance = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h2>Finance News</h2>
      
      {/* This component will now fetch its own data.
        "finance" is not a valid NewsAPI category, so we use "business"
        and use "finance" as the search query.
      */}
      <ArticleList 
        category="business"
        defaultQuery="latest finance" 
      />
    </div>
  )
}

export default Finance