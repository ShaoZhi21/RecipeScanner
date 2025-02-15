import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../App.css"; // Import global styles

const RecipeDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const meal = location.state?.meal;

  if (!meal) {
    return <h1>No Recipe Found</h1>;
  }

  return (
    <div className="recipe-detail-container">
      <button className="nav-button" onClick={() => navigate(-1)}>Back</button>
      <h1>{meal.strMeal}</h1>
      <img src={meal.strMealThumb} alt={meal.strMeal} />
      <p><strong>Category:</strong> {meal.strCategory}</p>
      <p><strong>Instructions:</strong> {meal.strInstructions}</p>
      <a href={meal.strYoutube} target="_blank" rel="noopener noreferrer">
        <button className="primary-button">Watch Tutorial</button>
      </a>
    </div>
  );
};

export default RecipeDetails;
