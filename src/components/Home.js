import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../App.css"; // Ensure correct path to App.css

function Home() {
  const [image, setImage] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const handleImageUpload = (event) => {
    setImage(event.target.files[0]);
  };

  const extractIngredients = async () => {
    if (!image) {
      alert("Please upload an image first.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("/api/extract-ingredients", image);
      setIngredients(response.data.ingredients);
    } catch (error) {
      console.error("Error extracting ingredients:", error);
    }
    setLoading(false);
  };

  const fetchRecipes = () => {
    if (ingredients.length === 0) {
      alert("No ingredients detected!");
      return;
    }
    navigate("/results", { state: { ingredients } });
  };

  const handleSearch = () => {
    navigate("/results", { state: { searchTerm } });
  };

  return (
    <div>
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
          <button className="nav-button" onClick={handleSearch}>
            Search
          </button>
          <button className="nav-button" onClick={() => navigate("/")}>
            Home
          </button>
          <button className="nav-button">My Recipes</button>
          <button className="nav-button">@Username</button>
        </div>
      </nav>

      <div className="container">
        <h1>Upload an Image to Find Recipes</h1>

        <div className="drop-area">
          <input type="file" accept="image/*" onChange={handleImageUpload} />
        </div>

        <button className="primary-button" onClick={extractIngredients} disabled={loading}>
          {loading ? "Processing..." : "Extract Ingredients"}
        </button>

        <button className="primary-button" onClick={fetchRecipes} disabled={loading}>
          Generate Recipes
        </button>
      </div>
    </div>
  );
}

export default Home;
