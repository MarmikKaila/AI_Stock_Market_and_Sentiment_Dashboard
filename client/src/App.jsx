import React from "react";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <div className="bg-black min-h-screen">
      <Navbar />
      <Dashboard />
    </div>
  );
}

export default App;
