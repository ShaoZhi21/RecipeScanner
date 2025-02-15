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
  
      alert("Image uploaded successfully!");
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image.");
    }
    setUploading(false);
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
          <button className="nav-button">Saved Recipes</button>
          <button className="nav-button">Profile</button>
        </div>
      </nav>


      <div className="container">
        <h1>Upload Image to find Recipes</h1>

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

        {fileUrl && (
          <div>
            <h3>Uploaded!</h3>
            {ingredients.length > 0 && (
              <div>
                <h3>Ingredients:</h3>
                <div className="ingredients-container">
                  {ingredients.map((ingredient, index) => (
                    <div key={index} className="ingredient-item">
                      <div className="ingredient">{ingredient}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
