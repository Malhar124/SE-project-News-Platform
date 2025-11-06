import "./Newspage.css"
import { assets } from "../../assets/assets"
const Newspage = () => {
  return (
    <div className="newspage">
      <div className="newspageheader">
        <h1 >Lights that warn planes of obstacles were exposed to Open Internet</h1>
        <div className="newspagetimestamp">
            <span>Category</span>
            <span>June 29,2019</span>
        </div>
        <img src={assets.labs}/>
        <div className="sharebtns">
            
        </div>
      </div>


    </div>
  )
}

export default Newspage
