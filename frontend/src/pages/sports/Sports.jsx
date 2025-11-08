import "./sports.css"
import ArticleList from '../../components/articleList/ArticleList'
import { assets } from '../../assets/assets';
import Pagecat from '../../components/pagecat/Pagecat';
const Sports = () => {
  const sportsCategories = [
    { image: assets.football, title: "Football news", link: "football" },
    { image: assets.cricket, title: "cricket scores", link: "cricket" },
    { image: assets.tennis, title: "Tennis updates", link: "tennis" },
    { image: assets.world, title: "World Events", link: "world" },
    { image: assets.playerstats, title: "Player stats", link: "playerstats" },
    { image: assets.tournaments, title: "Tournaments", link: "tournaments" },
    { image: assets.bydate, title: "By Date", link: "bydate" },
    { image: assets.byregion, title: "By Region", link: "byregion" },
    
  ];
  return (
    <div className='sports'>
      <div className="pagecontent">
        <h2>Top Sports News Today</h2>
        <h3>Major headlines.Live updates</h3>
      </div>
      <Pagecat pageName="sports" categories={sportsCategories} />   
        <h2 className="trending">Trending sports stories</h2>
      <ArticleList category="sports" cardtype="Newspreviewcard"/>
    </div>
  )
}

export default Sports
