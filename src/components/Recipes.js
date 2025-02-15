import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const Recipes = () => {
    const location = useLocation();
    const selectedIngredients = location.state?.selectedIngredients || [];
    const [meals, setMeals] = useState(location.state?.meals || []);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (selectedIngredients.length === 0) return; // Skip if no ingredients are selected
      
        const fetchRecipes = async () => {
          setLoading(true);
          try {
            const query = selectedIngredients.join(",");
            const response = await fetch(`http://localhost:5001/filter-meals?q=${query}`);
            const data = await response.json();
            
            if (data.length > 0) {
              setMeals(data); // Setting meals directly
            } else {
              alert("No meals found for the selected ingredients.");
            }
          } catch (error) {
            console.error("Error fetching recipes:", error);
            alert("Failed to fetch recipes.");
          } finally {
            setLoading(false);
          }
        };
      
        fetchRecipes();
      }, [selectedIngredients]); // Keep the dependency array as is

  return (
    <div>
      {loading ? <p>Loading...</p> : (
        <>
          <h1>Selected Ingredients:</h1>
          <ul>
            {selectedIngredients.map((ingredient, index) => (
              <li key={index}>{ingredient}</li>
            ))}
          </ul>

          <h2>Meals:</h2>
          <ul>
            {meals.map((meal, index) => (
              <li key={index}>{meal.strMeal}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default Recipes;
