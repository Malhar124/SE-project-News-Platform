import React, { useState } from "react";
import "./Header.css";
import { assets } from "../../assets/assets";

const Header = ({slides}) => {
//When you start fetching images from a database later, you can replace:
// const images = [assets.shops, assets.labs, ...];
// with
// const [images, setImages] = useState([]);
// useEffect(() => {
//   fetch("/api/images").then(res => res.json()).then(data => setImages(data));
// }, []);
// and everything else stays the same ✅



  // Step 1: Put your image sources in an array
  
  // Step 2: Track which image is currently shown
  const [currentIndex, setCurrentIndex] = useState(0);

  // Step 3: Handlers for next and previous buttons
  const handleNext = () => {
    setCurrentIndex((previndex) =>
      previndex === slides.length - 1 ? 0 : previndex + 1
    );
  };

  const handlePrev = () => {
    setCurrentIndex((previndex) =>
      previndex === 0 ? slides.length - 1 : previndex - 1
    );
  };

  return (
     <div className="header">
      <div className="slider">

        <img
          src={slides[currentIndex].image}
          alt={`slide-${currentIndex}`}
          className="slide-image"
        />
        <div className="header-contents">
            <h2>{slides[currentIndex].heading}</h2>
            <p>{slides[currentIndex].description}</p>
            <div className="nav-btn">
                <button className="prev" onClick={handlePrev}>◀</button>
                <button className="next" onClick={handleNext}>▶</button>
            </div>
            
        </div>
      </div>
    </div>
  );
};

export default Header;
