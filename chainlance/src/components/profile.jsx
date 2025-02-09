import React, { useEffect, useState } from "react";
import { useWallet } from "./walletcontext";

const Profile = () => {
  const { walletAddress } = useWallet();
  const [jobs, setJobs] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState({});
  
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

  const handleFileChange = (jobId, file) => {
    setSelectedFiles((prev) => ({
      ...prev,
      [jobId]: file,
    }));
  };

  const handleDeleteWork = async (jobId) => {
    try {
      const response = await fetch(`http://localhost:5000/jobs/${jobId}/delete`, {
        method: "DELETE",
      });
  
      if (response.ok) {
        alert("Work deleted successfully!");
        window.location.reload(); // Sayfayı yenileyerek güncellenmiş veriyi çek
      } else {
        alert("Failed to delete work.");
      }
    } catch (error) {
      console.error("Error deleting work:", error);
      alert("Error deleting work.");
    }
  };
  

  const handleSubmitFile = async (jobId) => {
    const file = selectedFiles[jobId];
    if (!file) return alert("Please select a file!");
  
    const formData = new FormData();
    formData.append("file", file);
  
    try {
      const response = await fetch(`http://localhost:5000/jobs/${jobId}/submit`, {
        method: "POST",
        body: formData,
      });
  
      if (response.ok) {
        alert("File submitted successfully!");
      } else {
        alert("File upload failed.");
      }
    } catch (error) {
      console.error("Error submitting file:", error);
      alert("Error uploading file.");
    }
  };
  const [selectedWorkers, setSelectedWorkers] = useState({});

const handleWorkerSelect = (jobId, worker) => {
  setSelectedWorkers((prev) => ({
    ...prev,
    [jobId]: worker,
  }));
};

const handleAssignWorker = async (jobId) => {
  if (!selectedWorkers[jobId]) {
    alert("Please select a worker!");
    return;
  }

  try {
    const response = await fetch(`http://localhost:5000/jobs/${jobId}/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ worker: selectedWorkers[jobId] }),
    });

    if (response.ok) {
      alert("Worker assigned successfully!");
      window.location.reload(); // Sayfayı yenileyerek güncellenmiş veriyi çek
    } else {
      alert("Failed to assign worker.");
    }
  } catch (error) {
    console.error("Error assigning worker:", error);
    alert("Error assigning worker.");
  }
};


const handleApprove = async (jobId) => {
  try {
    const response = await fetch(`http://localhost:5000/jobs/${jobId}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId }),
    });

    if (response.ok) {
      alert("Job approved!");
    } else {
      alert("Approval failed.");
    }
  } catch (error) {
    console.error("Error approving job:", error);
    alert("Error approving.");
  }
};

const handleReject = async (jobId) => {
  try {
    const response = await fetch(`http://localhost:5000/jobs/${jobId}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId }),
    });

    if (response.ok) {
      alert("Job rejected!");
    } else {
      alert("Rejection failed.");
    }
  } catch (error) {
    console.error("Error rejecting job:", error);
    alert("Error rejecting.");
  }
};

  return (
    <div className="min-h-screen bg-gray-950 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-white">My Jobs</h1>

        <div className="mb-12">
  <h2 className="text-2xl font-semibold text-white mb-4">Given Tasks</h2>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {jobs
      .filter((job) => job.owner === walletAddress)
      .map((job) => (
        <div
          key={job.id}
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
        >
          <h2 className="text-xl font-bold mb-2">{job.title}</h2>
          <p className="text-gray-700">{job.description}</p>
          <p className="text-sm text-gray-500">Offer: {job.offer ? job.offer : "Not Available"}</p>

          {job.worker ? (
            <p className="text-sm font-semibold text-gray-700">Worker: {job.worker}</p>
          ) : (
            <div>
              <h3 className="text-sm font-semibold text-gray-700">Select a Worker:</h3>
              <select
                className="block w-full mt-2 p-2 border rounded-md"
                value={selectedWorkers[job.id] || ""}
                onChange={(e) => handleWorkerSelect(job.id, e.target.value)}
              >
                <option value="">-- Select a Worker --</option>
                {job.workpool.map((worker) => (
                  <option key={worker} value={worker}>
                    {worker}
                  </option>
                ))}
              </select>
              <button
                className="mt-2 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
                onClick={() => handleAssignWorker(job.id)}
              >
                Assign Worker
              </button>

              <button
                    className="ml-3 mt-2 bg-gray-900 text-white py-2 px-4 rounded-md hover:bg-gray-950"
                    onClick={() => handleDeleteWork(job.id)}
                  >
                    Delete Work
              </button>
            </div>
          )}

          {job.worker && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-gray-700">Worker's Submission:</h3>
              <a
                href={`http://localhost:5000/files/${job.submittedFile}`}
                download={`submission-${job.id}`}
                className="text-blue-500 underline"
              >
                Download Submitted File
              </a>

              <div className="mt-2 flex space-x-2">
                <button
                  className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
                  onClick={() => handleApprove(job.id)}
                >
                  Approve
                </button>
                <button
                  className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600"
                  onClick={() => handleReject(job.id)}
                >
                  Reject
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
  </div>
</div>


        <div>
          <h2 className="text-2xl font-semibold text-white mb-4">Taken Tasks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs
              .filter((job) => job.worker === walletAddress)
              .map((job) => (
                <div
                  key={job.id}
                  className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <h2 className="text-xl font-bold mb-2">{job.title}</h2>
                  <p className="text-gray-700">{job.description}</p>
                  <p className="text-sm text-gray-500">Offer: {job.offer ? job.offer : "Not Available"}</p>
                  <p className="text-sm text-gray-500">Owner: {job.owner}</p>

                  <div className="mt-4">
                    <h3 className="text-sm font-semibold text-green-600">You are the assigned worker</h3>
                  </div>

                  <div className="mt-4">
                    <h3 className="text-sm font-semibold text-gray-700">Upload your work:</h3>
                    <input
                      type="file"
                      className="block w-full text-sm text-gray-700 border rounded-md mt-2"
                      onChange={(e) => handleFileChange(job.id, e.target.files[0])}
                    />
                    <button
                      className="mt-2 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
                      onClick={() => handleSubmitFile(job.id)}
                    >
                      Submit Work
                      
                    </button>

                    <button
                    className="ml-3 bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600"
                    onClick={() => handleReject(job.id)}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;