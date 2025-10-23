import React from "react";
import "../../lib/styles/sparky-loader.css";

const SparkyLoader = () => {
  return (
    <div className="bg-background/50 p-2 rounded-md flex items-center justify-center">
      <div className="loader"></div>
      <div className="loader"></div>
      <div className="loader"></div>
      <div className="loader"></div>
      <div className="loader"></div>
      <div className="loader"></div>
      <div className="loader"></div>
    </div>
  );
};

export default SparkyLoader;
