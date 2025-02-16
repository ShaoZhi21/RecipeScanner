import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../App.css";  

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState(location.state?.searchTerm || ""); 
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchSavedRecipes(); // ✅ Fetch saved recipes on load
  }, []);

  // ✅ Fetch saved recipes from the backend
  const fetchSavedRecipes = async () => {
    try {
      const response = await axios.get("http://localhost:5001/saved-recipes");
      setSavedRecipes(response.data.map(recipe => recipe.idMeal));
    } catch (error) {
      console.error("Error fetching saved recipes:", error);
    }
  };

  useEffect(() => {
    if (!searchTerm.trim()) {
      fetchMoreRecipes(15); // ✅ Fetch exactly 15 meals initially
    } else {
      fetchRecipesBySearch(searchTerm);
    }
  }, [searchTerm]);

  // ✅ Fetch multiple random recipes efficiently
  const fetchMoreRecipes = useCallback(async (count) => {
    setIsLoading(true);
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
    setIsLoading(false);
  }, []);

  // ✅ Fetch recipes by search term
  const fetchRecipesBySearch = async (query) => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`
      );
      setRecipes(response.data.meals || []);
    } catch (error) {
      console.error("Error searching recipes:", error);
    }
    setIsLoading(false);
  };

  // ✅ Add recipe to local database
  const saveRecipe = async (recipe) => {
    try {
      await axios.post("http://localhost:5001/save-recipe", recipe);
      setSavedRecipes(prev => [...prev, recipe.idMeal]);
    } catch (error) {
      console.error("Error saving recipe:", error);
    }
  };

  // ✅ Remove recipe from local database
  const removeSavedRecipe = async (idMeal) => {
    try {
      await axios.delete(`http://localhost:5001/saved-recipes/${idMeal}`);
      setSavedRecipes(prev => prev.filter(recipeId => recipeId !== idMeal));
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
          <button className="nav-button" onClick={() => fetchRecipesBySearch(searchTerm)}>
            Search
          </button>
          <button className="nav-button" onClick={() => navigate("/myrecipes")}>
            Saved Recipes
          </button>
          <button className="nav-button">Profile</button>
        </div>
      </nav>

      <div className="container">
        <h2>Results for "{searchTerm}"</h2>
        {isLoading && <p>Loading recipes...</p>}
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
                <p className="recipe-description">{meal.strInstructions?.slice(0, 100)}...</p>
                <button 
                  className={`add-button ${savedRecipes.includes(meal.idMeal) ? "saved" : ""}`}
                  style={{ 
                      cursor: "pointer",
                      background: savedRecipes.includes(meal.idMeal) ? "#33b249" : "#F9F9F9",
                      color: savedRecipes.includes(meal.idMeal) ? "white" : "black",
                    }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (savedRecipes.includes(meal.idMeal)) {
                      removeSavedRecipe(meal.idMeal);
                    } else {  
                      saveRecipe(meal);
                    }
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = savedRecipes.includes(meal.idMeal)
                      ? "#4CAF50"
                      : "#e0e0e0";
                  }}
                  onMouseLeave={(e) => {
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

        <button className="primary-button load-more" onClick={() => fetchMoreRecipes(9)}>
          Load More Recipes
        </button>
      </div>
    </div>
  );
};

export default Results;