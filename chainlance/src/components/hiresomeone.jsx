import React, { useState } from "react";
import { useWallet } from "./walletcontext";
import { useWeb3 } from "../context/Web3Provider.jsx";

const HireSomeone = ({ addJob }) => {
  const { walletAddress } = useWallet();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [offer, setOffer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // Yeni state: İstek gönderiliyor mu?
  const { provider, signer, contract } = useWeb3();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!walletAddress) {
      alert("Please connect your wallet first!");
      return;
    }

    if (isSubmitting) {
      alert("Request is already being processed. Please wait.");
      return; // Eğer istek zaten gönderiliyorsa, yeni istek göndermeyi engelle
    }

    setIsSubmitting(true); 
    const accountTuple = await contract.getAccount(walletAddress)
    const isRegistered = accountTuple[2]

    if (!isRegistered) {
      const tx = await contract.newAccount(false, true);
      await tx.wait();
    }

    const newJob = {
      owner: walletAddress,
      title,
      description,
      offer,
    };

    try {
      const response = await fetch("http://localhost:5000/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newJob),
      });

      const data = await response.json();

      if (data.message) {
        alert(data.message);
      }

      setTitle("");
      setDescription("");
      setOffer("");
    } catch (error) {
      console.error("Error creating job:", error);
      alert("Failed to create job. Please try again.");
    } finally {
      setIsSubmitting(false); // İstek tamamlandı, istek gönderiliyor durumunu kapat
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl text-white font-bold text-center mb-8">Hire Someone</h1>
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Job Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter job title"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Job Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter job description"
              rows="4"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="offer" className="block text-sm font-medium text-gray-700">Offer</label>
            <input
              type="text"
              id="offer"
              value={offer}
              onChange={(e) => setOffer(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter job offer (optional)"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gray-900 text-white py-2 px-4 rounded-md hover:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={isSubmitting} // İstek gönderiliyorsa butonu devre dışı bırak
          >
            {isSubmitting ? "Creating Job..." : "Create Job"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default HireSomeone;