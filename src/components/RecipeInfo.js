import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { TelegramShareButton, TwitterShareButton, LinkedinShareButton, WhatsappShareButton } from 'react-share';
import { TelegramIcon, TwitterIcon, LinkedinIcon, WhatsappIcon } from 'react-share';

const RecipeInfo = () => {
  const { idMeal } = useParams(); // Get the meal id from URL
  const navigate = useNavigate();
  const location = useLocation();
  const [recipe, setRecipe] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentUrl = window.location.href;

  // Fetch saved recipes from the database
  const fetchSavedRecipes = async () => {
    try {
      const response = await axios.get("http://localhost:5001/saved-recipes");
      setSavedRecipes(response.data.map(recipe => recipe.idMeal));
    } catch (error) {
      console.error("Error fetching saved recipes:", error);
    }
  };

  // Fetch recipe details from TheMealDB API
  const fetchRecipeDetails = async (id) => {
    try {
      const response = await axios.get(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
      if (response.data.meals) {
        setRecipe(response.data.meals[0]); // Store the first meal
      } else {
        alert("Recipe not found.");
      }
    } catch (error) {
      console.error("Error fetching recipe details:", error);
      alert("Failed to fetch recipe details.");
    }
  };

  useEffect(() => {
    fetchRecipeDetails(idMeal);
    fetchSavedRecipes();  // Fetch saved recipes when the component mounts
  }, [idMeal, location.state]);

  // Add recipe to local database
  const saveRecipe = async (recipe) => {
    try {
      await axios.post("http://localhost:5001/save-recipe", recipe);
      setSavedRecipes(prev => [...prev, recipe.idMeal]);
    } catch (error) {
      console.error("Error saving recipe:", error);
    }
  };

  // Remove recipe from local database
  const removeSavedRecipe = async (idMeal) => {
    try {
      await axios.delete(`http://localhost:5001/saved-recipes/${idMeal}`);
      setSavedRecipes(prev => prev.filter(recipeId => recipeId !== idMeal)); // Remove from the list
    } catch (error) {
      console.error("Error removing saved recipe:", error);
    }
  };

  if (!recipe) return <p>Loading recipe details...</p>;

  return (
    <div>
      <nav className="top-menu">
        <div className="top-left">
          <div className="menu-left">
            <button onClick={() => navigate("/")} className="logobutton">
              <img
                src="https://media.licdn.com/dms/image/v2/C560BAQEXWhEK2-iC-g/company-logo_200_200/company-logo_200_200/0/1630661833133/source_academy_logo?e=2147483647&v=beta&t=sRrZvGiS24y4E-ZXu-dL1ZOEJ_VtRXsgs9fBDJGgZvs"
                alt="Source Academy Logo"
                className="logo"
              />
            </button>
          </div>
        </div>

        <div className="search-container">
          <input
            type="text"
            placeholder="Search recipes..."
            className="search-bar"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="search-icon" onClick={() => navigate("/results", { state: { searchTerm } })}>
            🔍
          </button>
        </div>

        <div className="menu-right">
          <span className="nav-link" onClick={() => navigate("/myrecipes")}>Saved Recipes</span>
        </div>
      </nav>

      <div className="recipe-detail">
        <h1 className="recipe-title">{recipe.strMeal}</h1>
        <div className="centralise-image">
          <img src={recipe.strMealThumb} alt={recipe.strMeal} className="recipe-image" />
        </div>
        <div className="recipe-header">
          <p><strong>Category:</strong> {recipe.strCategory}</p>
          <p><strong>Area:</strong> {recipe.strArea}</p>
        </div>

        <div className="ingredients-list">
          <h3>Ingredients:</h3>
          <ul>
            {Array.from({ length: 20 }).map((_, i) => {
              const ingredient = recipe[`strIngredient${i + 1}`];
              const measure = recipe[`strMeasure${i + 1}`];
              return ingredient ? <li key={i}>{measure} {ingredient}</li> : null;
            })}
          </ul>
        </div>

        <div className="instructions">
          <h3>Instructions:</h3>
          <ul>
            {recipe.strInstructions
              ?.split(/\s*\d+\.\s*/)
              .filter(step => step.trim() !== '')
              .map((step, index) => {
                let cleanedStep = step.trim();
                cleanedStep = cleanedStep.charAt(0).toUpperCase() + cleanedStep.slice(1);
                if (!/[.!?]$/.test(cleanedStep)) {
                  cleanedStep += '.'; 
                }
                return <li key={index}>{cleanedStep}</li>;
              }) || <li>No instructions available.</li>}
          </ul>
        </div>

        <div className="buttonsflex">
          <button 
            className={`add-button-info ${savedRecipes.includes(idMeal) ? 'added' : ''}`}
            onClick={(e) => {
              e.stopPropagation(); // Prevent click propagation
              if (savedRecipes.includes(idMeal)) {
                removeSavedRecipe(idMeal); // Remove if already saved
              } else {  
                saveRecipe(recipe); // Save if not saved
              }
            }}
          >
            {savedRecipes.includes(idMeal) ? "Added!" : "Add"}
          </button>
          <button className="back-button" onClick={() => navigate(-1)}>Back</button>
        </div>

        <div className="social-share-buttons">
          <h3>Share this recipe:</h3>
          <div className="social-buttons">
            <TelegramShareButton url={currentUrl} quote={`Check out this delicious recipe: ${recipe.strMeal}`}>
              <TelegramIcon size={32} round={true} />
            </TelegramShareButton>
            <TwitterShareButton url={currentUrl} title={`Check out this delicious recipe: ${recipe.strMeal}`}>
              <TwitterIcon size={32} round={true} />
            </TwitterShareButton>
            <LinkedinShareButton url={currentUrl} title={`Check out this delicious recipe: ${recipe.strMeal}`} summary={recipe.strInstructions}>
              <LinkedinIcon size={32} round={true} />
            </LinkedinShareButton>
            <WhatsappShareButton url={currentUrl} title={`Check out this delicious recipe: ${recipe.strMeal}`} summary={recipe.strInstructions}>
              <WhatsappIcon size={32} round={true} />
            </WhatsappShareButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeInfo;
