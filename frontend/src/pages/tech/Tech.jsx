import "./Tech.css"
import ArticleList from '../../components/articleList/ArticleList'
import Header from "../../components/header/Header"
import { assets } from "../../assets/assets"
const Tech = () => {
  const slides = [
       
    {
      image: assets.researcher,
      heading: "Collaboration Between Doctors and Lab Scientists Yields New Vaccine",
    },
    {
      image: assets.labs,
      heading: "State-of-the-Art Research Labs Unveiled",
    },
        {
          image: assets.sanitizer,
          heading: "Doctors and Researchers Pioneer Smart Health Monitoring",
        },
        {
          image: assets.street,
          heading: "Innovative Urban Lab Studies Pollution Impact",
        },
      ];
  return (
    <div className="tech">
      <div className="pagecontent techheader">
        <h2>Top Technology News Today</h2>
        <h3>Breakthroughs, launches, and innovations.</h3>
      <button className='seeallbtn'>See All Articles</button>
      </div>
      <div className="techsection">
        <div className="techcontent">
          <h2>Featured Story</h2>
          <p>Explore today's biggest tech headline with in-depth analysis and expert coverage.</p>
        </div>
        <div className="techslider">
          <Header slides={slides}/>
        </div>
      </div>
      <div className="techsection">
        <div className="techslider">
          <Header slides={slides}/>
        </div>
        <div className="techcontent">
          <h2>Trending Articles</h2>
          <p>Explore today's biggest tech headline with in-depth analysis and expert coverage.</p>
        </div>
      </div>
        <div className="techcards">
          <ArticleList category="tech" cardtype="Newspreviewcard" />
        </div>
    </div>
  )
}

export default Tech
