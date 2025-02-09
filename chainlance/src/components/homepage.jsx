import React from "react";
import Chains from "./chain";
import MainScreen from "./mainscreen.jsx";
import HireFindBtn from "./hireorfindbuttons.jsx";
import Footer from "./footer.jsx";
import { Link } from "react-router-dom";


const HomePage = () => {
  return (
    <div>
      <Chains />
      <MainScreen />
      <Chains />
      <HireFindBtn />
    </div>
  );
};

export default HomePage;