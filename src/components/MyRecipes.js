import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../App.css";

const MyRecipes = () => {
  const [savedRecipes, setSavedRecipes] = useState([]);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchSavedRecipes();
  }, []);

  const fetchSavedRecipes = async () => {
    try {
      const response = await axios.get("http://localhost:5001/saved-recipes");
      
      // Filter out any empty objects from the response data
      const filteredRecipes = response.data.filter(recipe => Object.keys(recipe).length > 0);
      
      setSavedRecipes(filteredRecipes); // ✅ Store only valid recipes
    } catch (error) {
      console.error("Error fetching saved recipes:", error);
    }
  };
  

  // ✅ Function to remove saved recipe
  const removeSavedRecipe = async (idMeal) => {
    try {
      // Call the API to remove the saved recipe from the backend (if necessary)
      await axios.delete(`http://localhost:5001/saved-recipes/${idMeal}`);

      // Remove the recipe from the UI by filtering out the deleted recipe
      setSavedRecipes(savedRecipes.filter(recipe => recipe.idMeal !== idMeal));
    } catch (error) {
      console.error("Error removing saved recipe:", error);
    }
  };

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

      <div className="container">
  <h1>My Saved Recipes</h1>
  <div className="recipe-grid">
    {savedRecipes.length > 0 ? (
      savedRecipes.map((meal) => (
        <div key={meal.idMeal} 
          className="recipe-card"
          onClick={() => navigate(`/recipe/${meal.idMeal}`, { state: { meal } })}
          style={{ cursor: "pointer" }}>
          <img src={meal.strMealThumb} alt={meal.strMeal} />
          <h3>{meal.strMeal}</h3>

          <button 
              style={{ cursor: "pointer" }}
              onClick={(e) => {
                  e.stopPropagation(); // Prevent the click from triggering the parent div's onClick
                  removeSavedRecipe(meal.idMeal)
              }}
              className="remove-button">
            Remove
          </button>
        </div>
      ))
    ) : (
      <></> // Empty fragment, no message inside the grid
    )}
  </div>
  {savedRecipes.length === 0 && (
    <div className="no-recipes-message">
      <p>No saved recipes yet.</p>
    </div>
  )}
</div>

    </div>
  );
};

export default MyRecipes;