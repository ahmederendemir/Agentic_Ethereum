import React, { useEffect, useState } from "react";
import { useWallet } from "./walletcontext";
import { useLocation } from "react-router-dom";

const FindJob = () => {
  const { walletAddress } = useWallet();
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch("http://localhost:5000/jobs");
        const data = await response.json();
        setJobs(data);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }
    };

    fetchJobs();
  }, []);

  // 🔹 Sayfa açıldığında URL'den id alıp arama kutusuna yaz
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const jobId = params.get("id");
    if (jobId) {
      setSearchTerm(jobId);
    }
  }, [location.search]);

  const handleApply = async (jobId) => {
    if (!walletAddress) {
      alert("Please connect your wallet first!");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/jobs/${jobId}/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ walletAddress }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Applied successfully!");
        setJobs((prevJobs) =>
          prevJobs.map((job) =>
            job.id === jobId
              ? {
                  ...job,
                  workpool: [...job.workpool, walletAddress],
                }
              : job
          )
        );
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error applying for job:", error);
      alert("Error applying for the job.");
    }
  };

  const filteredJobs = jobs.filter((job) =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.id.toString().includes(searchTerm) // 🔹 ID'ye göre de filtreleme yap
  );

  return (
    <div className="min-h-screen bg-gray-950 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-white">Find Job</h1>

        <div className="mb-6 flex justify-center">
          <input
            type="text"
            placeholder="Search for a job..."
            className="w-full max-w-md px-4 py-2 rounded-md border border-gray-700 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <h2 className="text-xl font-bold mb-2">{job.title}</h2>
                <p className="text-gray-700">{job.description}</p>
                <p className="text-sm text-gray-500">Owner: {job.owner}</p>
                <p className="text-sm text-gray-500">
                  Offer: {job.offer ? job.offer : "Not Available"}
                </p>

                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-gray-700">
                    Applicants: {job.workpool.length}
                  </h3>
                </div>

                <button
                  className="mt-4 bg-gray-900 text-white py-2 px-4 rounded-md hover:bg-gray-950 transition-colors duration-300"
                  onClick={() => handleApply(job.id)}
                >
                  Apply Now
                </button>
              </div>
            ))
          ) : (
            <p className="text-white text-center">No jobs found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FindJob;
