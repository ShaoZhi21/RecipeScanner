import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../App.css";


function Home() {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState(""); // Stores uploaded image URL
  const [ingredients, setIngredients] = useState([]); // State to store the ingredients
  const [dragging, setDragging] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [clickedIngredients, setClickedIngredients] = useState([]);
  const [showRightContainer, setShowRightContainer] = useState(false);
  const [manualIngredient, setManualIngredient] = useState(""); // State for the manually inputted ingredient


  const handleFileSelect = (file) => {
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };


  const handleImageUpload = (event) => {
    handleFileSelect(event.target.files[0]);
  };


  const handleDragOver = (event) => {
    event.preventDefault();
    setDragging(true);
  };


  const handleDragLeave = () => {
    setDragging(false);
  };


  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    if (event.dataTransfer.files.length > 0) {
      handleFileSelect(event.dataTransfer.files[0]);
    }
  };


  const uploadImage = async () => {
    if (!image) {
      alert("Please select an image first.");
      return;
    }
 
    setUploading(true);
    const formData = new FormData();
    formData.append("file", image);
 
    try {
      // Send image to the backend
      const response = await axios.post("http://localhost:5001/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
 
      // Store the URL and description returned by the server
      const uploadedImageUrl = response.data.url;
      const imageDescription = response.data.description;
 
      // Remove the Markdown formatting (the backticks and "json" part)
      const cleanDescription = imageDescription.replace(/```json|\n|```/g, '').trim();
 
      // Parse the clean JSON string
      const parsedDescription = JSON.parse(cleanDescription);
      setFileUrl(uploadedImageUrl);
      setIngredients(parsedDescription.ingredients);
 
      if (parsedDescription.ingredients.length > 0) {
        setShowRightContainer(true);
      } else {
        alert("No ingredients found. Please try again.");
      }

    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image.");
    }
    setUploading(false);
  };


  const pushToClicked = (ingredient) => {
    setClickedIngredients((prev) =>
      prev.includes(ingredient)
        ? prev.filter((item) => item !== ingredient) // Remove if already clicked
        : [...prev, ingredient] // Add if not clicked
    );
  };


  const goToRecipes = async () => {
    if (clickedIngredients.length === 0) {
      alert("Please select at least one ingredient!");
      return;
    }
 
    try {
      const query = clickedIngredients.join(",");
      const response = await fetch(`http://localhost:5001/filter-meals?q=${query}`);
      const data = await response.json();
      console.log("Received data:", data);
 
      // Flatten all meals from all ingredients
      const meals = Object.values(data).flat();
 
      // Check if there are meals
      if (meals.length > 0) {
        navigate("/recipes", { state: { selectedIngredients: clickedIngredients, meals: meals } });
      } else {
        alert("No meals found for the selected ingredients.");
      }
    } catch (error) {
      console.error("Error fetching recipes:", error);
      alert("Failed to fetch recipes.");
    }
  };

  // Function to handle adding the manual ingredient
  const handleManualIngredient = () => {
    if (manualIngredient && !ingredients.includes(manualIngredient)) {
      setIngredients((prev) => [...prev, manualIngredient]);
      setManualIngredient(""); // Clear the input after adding the ingredient
    } else {
      alert("Please enter a valid ingredient.");
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

      <div className="container main">
        <div className="container-left">
          <h2>Find Recipes</h2>
          <div
          className={`drop-area ${dragging ? "dragging" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById("fileInput").click()}
          >
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="image-preview" />
            ) : (
              <p>Drag & Drop an image here or <span>click to select</span></p>
            )}
            <input id="fileInput" type="file" accept="image/*" onChange={handleImageUpload} hidden />
          </div>

          <button className="primary-button" onClick={uploadImage} disabled={uploading}>
            {uploading ? "Uploading..." : "Get Ingredients"}
          </button>
        </div>


        {showRightContainer && (
        <div className="container-right">
          <h2>Ingredients:</h2>
          {fileUrl && (
            <div className="ingredient-div">
              {ingredients.length > 0 && (
                <div>
                  <div className="ingredients-container">
                    {ingredients.map((ingredient, index) => (
                      <div
                        key={index}
                        className="ingredient-item"
                        onClick={() => pushToClicked(ingredient)}
                        style={{
                          cursor: "pointer",
                          background: clickedIngredients.includes(ingredient) ? "#007bff" : "#f0f0f0",
                          color: clickedIngredients.includes(ingredient) ? "white" : "black",
                          fontWeight: clickedIngredients.includes(ingredient) ? "bold" : "normal",
                        }}
                      >
                        <div className="ingredient">{ingredient}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Manual Ingredient Input */}
              <div className="manual-ingredient">
                <input
                  type="text"
                  placeholder="Enter an ingredient"
                  value={manualIngredient}
                  onChange={(e) => setManualIngredient(e.target.value)}
                />
                <button onClick={handleManualIngredient}>Add</button>
              </div>
            </div>
          )}


          <button className="primary-button" onClick={goToRecipes} disabled={uploading}>Find Recipes!</button>
        </div>
      )}
      </div>
    </div>
  );
}


export default Home;
