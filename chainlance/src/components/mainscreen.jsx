import React from "react";
import { Link } from "react-router-dom";


const MainScreen = () => {
    return(
        <main className="flex flex-col items-center text-center justify-center h-[80vh] bg-gray-950">
                <h1 className="text-6xl text-white">CHAINLANCE</h1>
                <h1 className="text-2xl text-white">MAKE YOUR DREAMS REAL</h1>
                <br />
                <h1 className="text-rose-600">Press Hire someone and the system will assign you as an employer. In this case, you will not be able to apply for a job with the wallet you have selected.</h1>
                <h1 className="text-rose-600">When you click Find job, the system will assign you as an employee. In this case, you will not be able to create a job posting with the wallet you have selected.</h1>
        </main>
    );
}
export default MainScreen;