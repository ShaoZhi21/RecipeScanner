import express from "express"; 
import cors from "cors";
import fetch from "node-fetch"; // Only needed for Node.js < 18
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); // Allow frontend requests
app.use(express.json()); // Enable JSON parsing

// Checking for possible meals based on the ingredients we have.
app.get("/filter-meals", async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: "Query parameter is required" });

  try {
    const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${query}`);
    const data = await response.json();
    res.json(data);
    // Extract the meals array
    const meals = data.meals;

    data.meals.forEach(meal => {
      console.log(meal.strMeal);  // Meal name
      console.log(meal.strMealThumb);  // Meal image URL
      // TO ADD TO FRONT END?
    });

  } catch (error) {
    console.error("Error filtering meals:", error);
    res.status(500).json({ error: "Failed to filter meals" });
  }
});

// Search meals by id
app.get("/search-meal", async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: "Query parameter is required" });

  
  try {
    const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${query}`);
    const data = await response.json();
    res.json(data);

    // For further processing
    const meal = data.meals[0];
    
  } catch (error) {
    console.error("Error searching meal:", error);
    res.status(500).json({ error: "Failed to fetch meal" });
  }
});

// // Obtain the meal thumbnail image
// app.get("/get-meal-image", async (req, res) => {
//   const query = req.query.q;
//   if (!query) {
//     return res.status(400).json({ error: "Query parameter is required" });
//   }

//   try {
//     // Construct the image URL
//     const imageUrl = `https://www.themealdb.com/images/ingredients/${query}.png`;
    
//     // Send the image URL as JSON
//     res.json({ imageUrl });
//   } catch (error) {
//     console.error("Error fetching meal image:", error);
//     res.status(500).json({ error: "Failed to fetch meal image" });
//   }
// });

// // Obtain the ingredient thumbnail image
// app.get("/get-ingredient-image", async (req, res) => {
//   const query = req.query.q;
//   if (!query) {
//     return res.status(400).json({ error: "Query parameter is required" });
//   }

//   try {
//     // Construct the image URL
//     const imageUrl = `https://www.themealdb.com/images/ingredients/${query}.png`;
    
//     // Send the image URL as JSON
//     res.json({ imageUrl });
//   } catch (error) {
//     console.error("Error fetching ingredient image:", error);
//     res.status(500).json({ error: "Failed to fetch ingredient image" });
//   }
// });

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
