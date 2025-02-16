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

  // ✅ Fetch saved recipes from the server
  const fetchSavedRecipes = async () => {
    try {
      const response = await axios.get("http://localhost:5001/saved-recipes");
      setSavedRecipes(response.data); // ✅ Ensure we store actual recipe objects
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
      <div className="menu-left">
      <button onClick={() => navigate("/")} className="logobutton">
        <img
          src="https://media.licdn.com/dms/image/v2/C560BAQEXWhEK2-iC-g/company-logo_200_200/company-logo_200_200/0/1630661833133/source_academy_logo?e=2147483647&v=beta&t=sRrZvGiS24y4E-ZXu-dL1ZOEJ_VtRXsgs9fBDJGgZvs"
          alt="Source Academy Logo"
          className="logo"
        />
      </button>
      </div>
        <div className="menu-right">
          <input
            type="text"
            placeholder="Search recipes..."
            className="search-bar"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="nav-button" onClick={() => navigate("/results", { state: { searchTerm } })}>
            Search
          </button>
          <button className="nav-button" onClick={() => navigate("/myrecipes")}>
            Saved Recipes
          </button>
          <button className="nav-button">Profile</button>
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
                <p className="recipe-description">{meal.strInstructions?.slice(0, 100)}...</p>
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
            <p>No saved recipes yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyRecipes;