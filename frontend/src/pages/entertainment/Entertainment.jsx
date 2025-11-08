import "./Entertainment.css"
import { useContext } from "react"
import { StoreContext } from "../../context/Storecontext"
import ArticleList from '../../components/articleList/ArticleList'
import Header from "../../components/header/Header"
import { assets } from "../../assets/assets"
import Pagecat from "../../components/pagecat/Pagecat"
const Entertainment = () => {
    const articlesData=useContext(StoreContext)
    
    const slides = [
  {
    image: assets.street,
    heading: "Bollywood Blockbusters Return to Theatres",
   },
  {
    image:assets.shops,
    heading: "Global Music Icons Set to Perform Live in India",
    },
  {
    image:assets.researcher,
    heading: "Stars Shine Bright at Annual Film Awards Night",
   },
  {
    image: assets.street,
    heading: "Streaming Platforms Battle for Viewers’ Attention",
   },
  {
    image:assets.shops,
    heading: "Film Festivals Spotlight Emerging Talent",
    
  },
];

const entertainmentCategories = [
  { image: assets.hollywood, title: "Hollywood news", link: "hollywood" },
  { image: assets.kpop, title: "Kpop updates", link: "kpop" },
  { image: assets.bollywood, title: "Bollywood updates", link: "bollywood" },
  { image: assets.tvstories, title: "TV stories", link: "tvstories" },
];

  return (
    <div className='entertainmentpage'>
      <div className="pagecontent">
      <h2 >Discover today’s </h2>
      <h2 >most exciting entertainment news.</h2>
      <h3 >From major celebrity moments to</h3>
      <h3 >new releases and music headlines.</h3>
      </div>
      <Header slides={slides}/>
      <ArticleList category="entertainment" cardtype="Newspreviewcard"/>
      <Pagecat pageName="entertainment" categories={entertainmentCategories} />;
    </div>
  )
}

export default Entertainment
