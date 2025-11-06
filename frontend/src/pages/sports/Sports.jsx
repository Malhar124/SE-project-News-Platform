import "./sports.css"
import ArticleList from '../../components/articleList/ArticleList.jsx'
import { assets } from '../../assets/assets.js'; // Assuming assets.js
import Pagecat from '../../components/pagecat/Pagecat.jsx'; // Assuming Pagecat.jsx

const Sports = () => {
  const sportsCategories = [
    { image: assets.football, title: "Football news", link: "football" },
    { image: assets.cricket, title: "cricket scores", link: "cricket" },
    // ... other categories
  ];
  return (
    <div className='sports'>
      <div className="pagecontent">
        <h2>Top Sports News Today</h2>
        <h3>Major headlines.Live updates</h3>
      </div>
      <Pagecat pageName="sports" categories={sportsCategories} />   
        <h2 className="trending">Trending sports stories</h2>
      {/* This component will now fetch its own data.
        The 'cardtype' prop is no longer used by our new ArticleList.
      */}
      <ArticleList 
        category="sports" 
        defaultQuery="latest sports"
      />
    </div>
  )
}

export default Sports