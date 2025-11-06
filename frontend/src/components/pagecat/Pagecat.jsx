import React from "react"; // Import React
import { useNavigate } from "react-router-dom";
import "./Pagecat.css";

const Pagecat = ({ pageName, categories }) => {
  const navigate = useNavigate();

  const handleClick = (category) => {
    // This navigation is for sub-categories, which you'd need to handle
    // in your routes and ArticleList. For now, this is fine.
    navigate(`/${pageName}/${category.link}`); 
  };

  return (
    <div className='pagecat'>
      {categories.map((cat, index) => (
        <div
          key={index}
          className="pagecat-card"
          onClick={() => handleClick(cat)}
        >
          <img src={cat.image} alt={cat.title} />
          <p>{cat.title}</p>
        </div>
      ))}
    </div>
  );
};

export default Pagecat;