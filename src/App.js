import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";  // ✅ Ensure correct path
import Results from "./components/Results";  // ✅ Ensure correct path
import "./App.css";  // ✅ Import styles

function App() {
  return (
    <Router> {/* ✅ Wrap the entire app inside <Router> */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/results" element={<Results />} />
      </Routes>
    </Router>
  );
}

export default App;
