import "./Entertainment.css"
import React from "react" // Import React
// import { useContext } from "react" // No longer need context here
// import { StoreContext } from "../../context/Storecontext.jsx" // No longer need context here
import ArticleList from '../../components/articleList/ArticleList.jsx'
import Header from "../../components/header/Header.jsx"
import { assets } from "../../assets/assets.js" // Assuming assets.js
import Pagecat from "../../components/pagecat/Pagecat.jsx" // Assuming Pagecat.jsx

const Entertainment = () => {
    // const articlesData=useContext(StoreContext) // This was incorrect
    
    const slides = [
      // ... your slides data
    ];

    const entertainmentCategories = [
      // ... your categories data
    ];

  return (
    <div className='entertainmentpage'>
      <div className="pagecontent">
        <h2>Discover today’s </h2>
        <h2>most exciting entertainment news.</h2>
        <h3>From major celebrity moments to</h3>
        <h3>new releases and music headlines.</h3>
      </div>
      <Header slides={slides}/>
      
      {/* This component will now fetch its own data */}
      <ArticleList 
        category="entertainment" 
        defaultQuery="latest entertainment" 
      />
      
      <Pagecat pageName="entertainment" categories={entertainmentCategories} />;
    </div>
  )
}

export default Entertainment