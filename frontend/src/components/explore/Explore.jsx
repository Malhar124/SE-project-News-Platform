import Card from "../card/Card"
import "./Explore.css"
const Explore = () => {
  const topstories={
    image:"https://www.hindustantimes.com/ht-img/img/2025/09/09/550x309/Trump_Modi_1757455109183_1757455109296.jpg",
    title:"Top Stories",
    content:"Breaking and trending news updated around the clock for what matters the most"
  }
  const picksforyou={
    image:"https://f.fseo99.com/asserts/indian/images/watermark_20250106_40_w1.jpg",
    title:"Picks For You",
    content:"Personalised recommendation based on your activity and interest"
  }
  const localnews={
    image:"https://reutersinstitute.politics.ox.ac.uk/sites/default/files/2024-08/hanna-pic.jpg",
    title:"Local News",
    content:"Stay up to date with region specific updated in related to your area"
  }
  return (
    <div className="explore">
      <Card article={topstories} />
      <Card article={localnews} />
      <Card article={picksforyou} />
    </div>
  )
}

export default Explore
