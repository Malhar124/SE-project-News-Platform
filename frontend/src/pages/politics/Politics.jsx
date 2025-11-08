import React from 'react'
import ArticleList from '../../components/articleList/ArticleList'
import "./Politics.css"
import { assets } from '../../assets/assets'
import Header from '../../components/header/Header'
const Politics = () => {
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
      {
        image: assets.researcher,
        heading: "Collaboration Between Doctors and Lab Scientists Yields New Vaccine",
        description:
          "Stem cell researchers have successfully regenerated damaged tissues, marking a milestone in recovery science.",
      },
      {
        image: assets.sanitizer,
        heading: "Doctors and Researchers Pioneer Smart Health Monitoring",
        description:
          "A collaborative team develops wearable biosensors for early disease detection and remote health tracking.",
      },
      {
        image: assets.street,
        heading: "Innovative Urban Lab Studies Pollution Impact",
        description:
          "Researchers explore how micro-level pollution affects city health and propose AI-driven monitoring solutions.",
      },
    ];
  return (
    <div className='politics'>
      <div className="pagecontent">
        <h2>Top Geopolitical News Today</h2>
        <h3>Analysis & headlines for a changing world.</h3>
      </div>
      <Header slides={slides}/>
      <ArticleList category="politics" cardtype="Newscard"/>
      <ArticleList category="politics" cardtype="Newspreviewcard"/>

    </div>
  )
}

export default Politics
