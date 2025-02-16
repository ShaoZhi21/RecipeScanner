import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../App.css";  

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [savedRecipes, setSavedRecipes] = useState([]);

  useEffect(() => {
    fetchSavedRecipes(); // ✅ Fetch saved recipes on load
  }, []);

  // ✅ Fetch saved recipes from the backend
  const fetchSavedRecipes = async () => {
    try {
      const response = await axios.get("http://localhost:5001/saved-recipes");
      setSavedRecipes(response.data.map(recipe => recipe.idMeal)); // ✅ Store only IDs for quick lookup
    } catch (error) {
      console.error("Error fetching saved recipes:", error);
    }
  };

  // ✅ Fetch meals in parallel for faster speed
  const fetchMoreRecipes = useCallback(async (count) => {
    try {
      const requests = Array.from({ length: count }, () => 
        axios.get(`https://www.themealdb.com/api/json/v1/1/random.php`)
      );
      
      const responses = await Promise.all(requests);
      let newRecipes = responses.flatMap(res => res.data.meals || []);

      setRecipes(prevRecipes => {
        const uniqueMeals = newRecipes.filter(
          (meal) => !prevRecipes.some((r) => r.idMeal === meal.idMeal)
        );
        return [...prevRecipes, ...uniqueMeals.slice(0, count)];
      });

    } catch (error) {
      console.error("Error fetching more recipes:", error);
    }
  }, []);

  useEffect(() => {
    if (!location.state?.ingredients && !location.state?.searchTerm) {
      fetchMoreRecipes(25);
    } else if (location.state?.ingredients) {
      fetchRecipesByIngredients(location.state.ingredients);
    } else if (location.state?.searchTerm) {
      setSearchTerm(location.state.searchTerm);
    }
  }, [location.state, fetchMoreRecipes]);

  useEffect(() => {
    if (searchTerm.trim() !== "") {
      fetchRecipesBySearch(searchTerm);
    }
  }, [searchTerm]);

  const fetchRecipesByIngredients = async (ingredients) => {
    try {
      const ingredientQuery = ingredients.join(",");
      const response = await axios.get(
        `https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredientQuery}`
      );
      setRecipes(response.data.meals || []);
    } catch (error) {
      console.error("Error fetching recipes by ingredients:", error);
    }
  };

  const fetchRecipesBySearch = async (query) => {
    try {
      const response = await axios.get(
        `https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`
      );
      setRecipes(response.data.meals || []);
    } catch (error) {
      console.error("Error searching recipes:", error);
    }
  };

  // ✅ Add recipe to local database
  const saveRecipe = async (recipe) => {
    try {
      await axios.post("http://localhost:5001/save-recipe", recipe);
      setSavedRecipes(prev => [...prev, recipe.idMeal]); // ✅ Update saved list without alert
    } catch (error) {
      console.error("Error saving recipe:", error);
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
        <h1>Recipe Results</h1>
        <div className="recipe-grid">
          {recipes.length > 0 ? (
            recipes.map((meal) => (
              <div 
                key={meal.idMeal} 
                className="recipe-card"
                onClick={async () => {
                  try {
                    const response = await axios.get(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`);
                    const fullMealDetails = response.data.meals[0];
                    navigate(`/recipe/${meal.idMeal}`, { state: { meal: fullMealDetails } });
                  } catch (error) {
                    console.error("Error fetching full recipe details:", error);
                  }
                }}                
                style={{ cursor: "pointer" }}>
                <img src={meal.strMealThumb} alt={meal.strMeal} />
                <h3>{meal.strMeal}</h3>
                <p className="recipe-description">
                  {meal.strInstructions?.slice(0, 100)}...
                </p>
                 <button 
                  className={`add-button ${savedRecipes.includes(meal.idMeal) ? "saved" : ""}`}
                  style={{ 
                      cursor: "pointer",
                      background: savedRecipes.includes(meal.idMeal) ? "#33b249" : "#F9F9F9",
                      color: savedRecipes.includes(meal.idMeal) ? "white" : "black",
                    }}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent the click from triggering the parent div's onClick
                    if (savedRecipes.includes(meal.idMeal)) {
                      removeSavedRecipe(meal.idMeal); // Remove if already saved
                    } else {  
                      saveRecipe(meal); // Save if not saved
                    }
                  }}
                  onMouseEnter={(e) => {
                    // Darken the background on hover
                    e.target.style.background = savedRecipes.includes(meal.idMeal)
                      ? "#4CAF50" // Darker green
                      : "#e0e0e0"; // Slightly darker gray
                  }}
                  onMouseLeave={(e) => {
                    // Reset to the original background when mouse leaves
                    e.target.style.background = savedRecipes.includes(meal.idMeal)
                      ? "#33b249"
                      : "#F9F9F9";
                  }}
                >
                  {savedRecipes.includes(meal.idMeal) ? "Added!" : "Add"}
                </button>
              </div>
            ))
          ) : (
            <p>No recipes found.</p>
          )}
        </div>
        <button className="primary-button load-more" onClick={() => fetchMoreRecipes(10)}>
          Load More Recipes
        </button>
      </div>
    </div>
  );
};

export default Results;