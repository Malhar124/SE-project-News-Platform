import "./Footer.css"
import { assets } from "../../assets/assets"
const Footer = () => {
  return (
    <div className='footer'>
        <div className="footer-card">
            <img src={assets.power2} alt="" />
            <p>AI-powered search</p>
        </div>
        <div className="footer-card">
            <img src={assets.user} alt="" />
            <p>Personlised feed</p>
        </div>
        <div className="footer-card">
            <img src={assets.chatbot} alt="" />
            <p>Chatbot Assistant</p>
        </div>
        <div className="footer-card">
            <img src={assets.smart2} alt="" />
            <p>Smart filters</p>
        </div>
    </div>
  )
}

export default Footer
