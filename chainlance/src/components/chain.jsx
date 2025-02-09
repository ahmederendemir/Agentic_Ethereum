import React from "react";
import { Link } from "react-router-dom";


const Chains = () => {
  return (
    <div className="bg-gray-950 overflow-hidden whitespace-nowrap py-4 relative">
      <div className="animate-move-chains inline-block">
        {[...Array(10)].map((_, index) => (
          <span key={index} className="text-4xl ml-10 ">
            ⛓️ ⛓️ ⛓️ ⛓️ ⛓️ ⛓️ 
          </span>
        ))}
      </div>

      
    </div>
  );
};

export default Chains;