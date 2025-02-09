import React from "react";
import { Link } from "react-router-dom";
import { useWallet } from "./walletcontext";

const Footer = () => {
  const { walletAddress } = useWallet();

  const handleProtectedRoute = (event, path) => {
    if (!walletAddress) {
      event.preventDefault();
      alert("Please connect your wallet first!");
    }
  };

  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/about-us"
                  className="hover:text-gray-400"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/find-job"
                  onClick={(e) => handleProtectedRoute(e, "/find-job")}
                  className=" hover:text-gray-400"
                >
                  Find Job
                </Link>
              </li>
              <li>
                <Link
                  to="/hire-someone"
                  onClick={(e) => handleProtectedRoute(e, "/hire-someone")}
                  className="hover:text-gray-400"
                >
                  Hire Someone
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
