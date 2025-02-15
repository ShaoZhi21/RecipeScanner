import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../App.css";

function Home() {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState(""); // ✅ Stores uploaded image URL
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [dragging, setDragging] = useState(false);

  // ✅ Handle file selection (Click or Drag & Drop)
  const handleFileSelect = (file) => {
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleImageUpload = (event) => {
    handleFileSelect(event.target.files[0]);
  };

  // ✅ Drag & Drop Handlers
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

  // ✅ Upload image to AWS S3 via `server.js`
  const uploadImage = async () => {
    if (!image) {
      alert("Please select an image first.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", image);

    try {
      const response = await axios.post("http://localhost:5001/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const uploadedFileUrl = response.data.url;
      setFileUrl(uploadedFileUrl);
      alert("Image uploaded successfully!");

      // ✅ Extract ingredients immediately after upload is complete
      extractIngredients(uploadedFileUrl);

    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image.");
    }
    setUploading(false);
  };

  // ✅ Extract ingredients from uploaded image
  const extractIngredients = async (uploadedImageUrl) => {
    if (!uploadedImageUrl) {
      alert("Please upload an image first.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5001/extract-ingredients", { imageUrl: uploadedImageUrl });

      if (!response.data.ingredients || response.data.ingredients.length === 0) {
        alert("No ingredients detected.");
        return;
      }

      setIngredients(response.data.ingredients);
      alert("Ingredients extracted successfully!");
      fetchRecipes(response.data.ingredients); // ✅ Fetch recipes after extracting ingredients

    } catch (error) {
      console.error("Error extracting ingredients:", error);
      alert("Failed to extract ingredients.");
    }
    setLoading(false);
  };

  // ✅ Fetch recipes based on extracted ingredients
  const fetchRecipes = (ingredients) => {
    navigate("/results", { state: { ingredients } });
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
          <button className="nav-button" onClick={() => navigate("/results", { state: { searchTerm } })}>
            Search
          </button>
          <button className="nav-button" onClick={() => navigate("/")}>Home</button>
          <button className="nav-button">My Recipes</button>
          <button className="nav-button">@Username</button>
        </div>
      </nav>

      <div className="container">
        <h1>Upload an Image to Find Recipes</h1>

        {/* ✅ Drag & Drop + Clickable Upload Box */}
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
          {uploading ? "Uploading..." : "Upload Image"}
        </button>
      </div>
    </div>
  );
}

export default Home;
