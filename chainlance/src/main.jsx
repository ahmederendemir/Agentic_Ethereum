import { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import Navbar from "./components/navbar.jsx";
import HomePage from "./components/homepage.jsx";
import Footer from "./components/footer.jsx";
import { WalletProvider } from "./components/walletcontext.jsx";
import Wallet from "./components/walletsection.jsx";
import AboutUs from "./components/aboutus.jsx";
import FindJob from "./components/findjob.jsx";
import HireSomeone from "./components/hiresomeone.jsx";
import Profile from "./components/profile.jsx";
import { Web3Provider } from "./context/Web3Provider.jsx";

function MainRouter() {
  const [jobs, setJobs] = useState([]);
  
  useEffect(() => {
    fetch("http://localhost:5000/jobs")
      .then((res) => res.json())
      .then((data) => setJobs(data))
      .catch((err) => console.error("Error fetching jobs:", err));
  }, []);

  const addJob = (job) => {
    fetch("http://localhost:5000/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(job),
    })
      .then((res) => res.json())
      .then((newJob) => setJobs((prevJobs) => [...prevJobs, newJob]))
      .catch((err) => console.error("Error adding job:", err));
  };

  return (
    <Web3Provider>
    <WalletProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/find-job" element={<FindJob jobs={jobs} />} />
          <Route path="/hire-someone" element={<HireSomeone addJob={addJob} />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/profile" element={<Profile jobs={jobs} />} />
        </Routes>
        <Footer />
      </Router>
    </WalletProvider>
    </Web3Provider>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <MainRouter />
  </StrictMode>
);
