import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const RecipeInfo = () => {
  const { idMeal } = useParams(); // Get the meal id from URL
  const navigate = useNavigate();
  const location = useLocation();
  const [recipe, setRecipe] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch saved recipes on load
    fetchSavedRecipes();
  }, []);

  // Fetch saved recipes from the backend
  const fetchSavedRecipes = async () => {
    try {
      const response = await axios.get("http://localhost:5001/saved-recipes");
      setSavedRecipes(response.data.map(recipe => recipe.idMeal)); // Store only IDs for quick lookup
    } catch (error) {
      console.error("Error fetching saved recipes:", error);
    }
  };

  useEffect(() => {
    if (location.state?.meal) {
      // Use passed data if available for faster loading
      setRecipe(location.state.meal);
      setLoading(false);
    } else {
      // Fetch recipe details from TheMealDB API
      fetchRecipeDetails(idMeal);
    }
  }, [idMeal, location.state]);

  const fetchRecipeDetails = async (id) => {
    try {
      const response = await axios.get(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
      if (response.data.meals) {
        setRecipe(response.data.meals[0]); // ✅ Store the first meal
      } else {
        alert("Recipe not found.");
      }
    } catch (error) {
      console.error("Error fetching recipe details:", error);
      alert("Failed to fetch recipe details.");
    }
  };

  const saveRecipe = async (idMeal) => {
    try {
      // Check if the recipe is already saved
      if (savedRecipes.includes(idMeal)) {
        console.log("Recipe already saved!");
        return; // Exit if already saved
      }
  
      console.log("Fetching recipe details for id:", idMeal); // Log the idMeal being fetched
  
      // Fetch the recipe details based on idMeal from TheMealDB API
      const response = await axios.get(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${idMeal}`);
      const recipe = response.data.meals[0]; // Get the first meal from the response
      
      console.log("Fetched recipe:", recipe); // Log the fetched recipe
  
      // Now post the full recipe data to save it to the local database
      await axios.post("http://localhost:5001/save-recipe", recipe);
  
      // Update saved list with the idMeal (no need to store the entire recipe object)
      setSavedRecipes(prev => {
        console.log("Updating saved recipes list. New list:", [...prev, idMeal]);
        return [...prev, idMeal];
      });
  
    } catch (error) {
      // Log detailed error information
      console.error("Error saving recipe:", error);
      if (error.response) {
        // If the error has a response (server responded with an error)
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
      } else if (error.request) {
        // If the request was made but no response received
        console.error("Request data:", error.request);
      } else {
        // If the error occurred while setting up the request
        console.error("Error message:", error.message);
      }
    }
  };
  


  
     // ✅ Remove recipe from local database
     const removeSavedRecipe = async (idMeal) => {
      try {
        await axios.delete(`http://localhost:5001/saved-recipes/${idMeal}`);
        setSavedRecipes(prev => prev.filter(recipeId => recipeId !== idMeal)); // ✅ Update UI to remove the recipe
      } catch (error) {
        console.error("Error removing saved recipe:", error);
      }
    };

  if (!recipe) return <p>Loading recipe details...</p>;

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
      
      <div className="recipe-detail">
        <img src={recipe.strMealThumb} alt={recipe.strMeal} className="recipe-image" />

        <div className="recipe-header">
          <h1>{recipe.strMeal}</h1>
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
        <div>
        <button 
  className={`add-button ${savedRecipes.includes(idMeal) ? "saved" : ""}`}
  style={{ 
    cursor: "pointer",
    background: savedRecipes.includes(idMeal) ? "#33b249" : "#F9F9F9",
    color: savedRecipes.includes(idMeal) ? "white" : "black",
    padding: "8px 16px", // Adjust padding to match back button size
    fontSize: "14px", // Match font size to back button
    borderRadius: "4px", // Add a slight border radius for consistent look
    border: "1px solid #ccc", // Optional: Add a border for styling
    marginRight: "10px", // Optional: Add spacing between buttons
  }}
  onClick={(e) => {
    e.stopPropagation(); // Prevent the click from triggering the parent div's onClick
    if (savedRecipes.includes(idMeal)) {
      removeSavedRecipe(idMeal); // Remove if already saved
    } else {  
      saveRecipe(idMeal); // Save if not saved
    }
  }}
  onMouseEnter={(e) => {
    // Darken the background on hover
    e.target.style.background = savedRecipes.includes(idMeal)
      ? "#4CAF50" // Darker green
      : "#e0e0e0"; // Slightly darker gray
  }}
  onMouseLeave={(e) => {
    // Reset to the original background when mouse leaves
    e.target.style.background = savedRecipes.includes(idMeal)
      ? "#33b249"
      : "#F9F9F9";
  }}
>
  {savedRecipes.includes(idMeal) ? "Added!" : "Add"}
</button>
<button className="back-button" onClick={() => navigate(-1)}>Back</button>

        </div>
      </div>
    </div>
  );
};

export default RecipeInfo;
