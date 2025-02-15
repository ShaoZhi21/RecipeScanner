import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";  // ✅ Ensure correct path
import Results from "./components/Results";  // ✅ Ensure correct path
import Recipes from "./components/Recipes";
import "./App.css";  // ✅ Import styles

function App() {
  return (
    <Router> {/* ✅ Wrap the entire app inside <Router> */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/results" element={<Results />} />
        <Route path="/recipes" element={<Recipes />} />
      </Routes>
    </Router>
  );
}

export default App;