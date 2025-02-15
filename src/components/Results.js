import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../App.css";  // ✅ Import styles

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ Fetch meals in parallel for faster speed
  const fetchMoreRecipes = useCallback(async (count) => {
    try {
      const requests = Array.from({ length: count }, () => 
        axios.get(`https://www.themealdb.com/api/json/v1/1/random.php`)
      );
      
      // ✅ Fetch all API calls in parallel
      const responses = await Promise.all(requests);
      
      // ✅ Collect unique meals with descriptions
      let newRecipes = responses.flatMap(res => res.data.meals || []);

      // ✅ Remove duplicates before updating state
      setRecipes(prevRecipes => {
        const uniqueMeals = newRecipes.filter(
          (meal) => !prevRecipes.some((r) => r.idMeal === meal.idMeal) // Prevent duplicates
        );
        return [...prevRecipes, ...uniqueMeals.slice(0, count)]; // ✅ Ensure exactly `count` meals
      });

    } catch (error) {
      console.error("Error fetching more recipes:", error);
    }
  }, []);

  useEffect(() => {
    if (!location.state?.ingredients && !location.state?.searchTerm) {
      fetchMoreRecipes(25); // ✅ Fetch 25 meals initially
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

  return (
    <div>
      {/* Top Navigation Bar */}
      <nav className="top-menu">
        <div className="menu-left">Source Recipes</div>
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
          <button className="nav-button" onClick={() => navigate("/")}>
            Home
          </button>
          <button className="nav-button">My Recipes</button>
          <button className="nav-button">@Username</button>
        </div>
      </nav>

      {/* Recipe Display Section */}
      <div className="container">
        <h1>Recipe Results</h1>
        <div className="recipe-grid">
          {recipes.length > 0 ? (
            recipes.map((meal) => (
              <div key={meal.idMeal} className="recipe-card">
                <img src={meal.strMealThumb} alt={meal.strMeal} />
                <h3>{meal.strMeal}</h3>
                <p className="recipe-description">
                  {meal.strInstructions?.slice(0, 100)}... {/* ✅ Show short description */}
                </p>
                <button 
                  className="read-more-button" 
                  onClick={() => navigate(`/recipe/${meal.idMeal}`, { state: { meal } })}
                >
                  Read More
                </button>
              </div>
            ))
          ) : (
            <p>No recipes found.</p>
          )}
        </div>

        {/* ✅ "Load More Recipes" button fetches exactly 10 meals each time */}
        <button className="primary-button load-more" onClick={() => fetchMoreRecipes(10)}>
          Load More Recipes
        </button>
      </div>
    </div>
  );
};

export default Results;
