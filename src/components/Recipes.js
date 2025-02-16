import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Recipes = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const initialSelectedIngredients = location.state?.selectedIngredients || [];
    const [selectedIngredients, setSelectedIngredients] = useState(initialSelectedIngredients);
    const [filteredMeals, setFilteredMeals] = useState(location.state?.meals || {});
    const [allMeals, setAllMeals] = useState(location.state?.meals || {});  // Keep all meals before filtering
    const [displayIngredients, setDisplayIngredients] = useState(selectedIngredients);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Update meals when selected ingredients change
    useEffect(() => {
        if (selectedIngredients.length === 0) return; // Skip if no ingredients are selected
    
        const fetchRecipes = async () => {
            setLoading(true);
            try {
                const query = selectedIngredients.join(",");
                console.log("Sending request with query:", query); // Add this log
                const response = await fetch(`http://localhost:5001/filter-meals?q=${query}`);
                const data = await response.json();
                console.log("Received data:", data);
        
                // If there are meals, set the meals state with the data (mapping ingredients to meals)
                if (Object.entries(data).length > 0) {
                    setAllMeals(data);  // Store all meals (before filtering)
                    setFilteredMeals(data);  // Also set filtered meals initially
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
    }, [selectedIngredients]);

    // Handle the ingredient button clicks
    const handleIngredientClick = (ingredient) => {
        if (displayIngredients.includes(ingredient)) {
            // Remove ingredient from displayIngredients if already selected
            setDisplayIngredients(displayIngredients.filter((item) => item !== ingredient));
        } else {
            // Add ingredient to displayIngredients if not already selected
            setDisplayIngredients([...displayIngredients, ingredient]);
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
            {loading ? (
            <p>Loading...</p>
            ) : (
            <>
                <h2>Select Ingredients:</h2>
                <div className="ingredient-buttons">
                {selectedIngredients.map((ingredient, index) => (
                    <button
                    key={index}
                    className={`ingredient-button ${displayIngredients.includes(ingredient) ? 'active' : ''}`}
                    onClick={() => handleIngredientClick(ingredient)}
                    >
                    {ingredient}
                    </button>
                ))}
                </div>

                <h3>Recipe Results</h3>
                <div className="recipe-grid">
                {Object.entries(filteredMeals).length > 0 ? (
                    Object.entries(filteredMeals).map(([ingredient, mealList]) => {
                    // Only show meals for ingredients present in displayIngredients
                    if (displayIngredients.includes(ingredient) && Array.isArray(mealList) && mealList.length > 0) {
                        return mealList.map((meal) => (
                        <div key={meal.idMeal} className="recipe-card">
                            <img src={meal.strMealThumb} alt={meal.strMeal} />
                            <h3>{meal.strMeal}</h3>
                            <div className="ingredient-tag">{ingredient}</div>
                            <button
                            className="read-more-button"
                            onClick={() =>
                                navigate(`/recipe/${meal.idMeal}`, { state: { meal } })
                            }
                            >
                            Read More
                            </button>
                        </div>
                        ));
                    }
                    return null;
                    })
                ) : (
                    <p>No recipes found for selected ingredients.</p>
                )}
                </div>
            </>
            )}
            </div>
        </div>
    );
};

export default Recipes;
