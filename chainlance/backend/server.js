const express = require("express");
const cors = require("cors");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const { ethers } = require("ethers");
const jobs = require("./jobs.json");

require("dotenv").config()
const infuraKey = process.env.INFURA_API_KEY
const provider = new ethers.JsonRpcProvider(infuraKey)

//----------------------------------------------------------------------------------------------------------------
const privateKey1 = process.env.PRIVATE_KEY_1
const privateKey2 = process.env.PRIVATE_KEY_2
const wallet1 = new ethers.Wallet(privateKey1, provider)
const wallet2 = new ethers.Wallet(privateKey2, provider)

//----------------------------------------------------------------------------------------------------------------


//----------------------------------------------------------------------------------------------------------------
const file = fs.readFileSync("app.json", "utf-8")
const parsedFile = JSON.parse(file)
ERC20_ABI = parsedFile.abi

const address = '0x94250D9D0b08F4AeC906c5C2cf9601DBf972e88e'
const contract = new ethers.Contract(address, ERC20_ABI, provider)

const contractWithWallet1 = contract.connect(wallet1);
const contractWithWallet2 = contract.connect(wallet2);
//----------------------------------------------------------------------------------------------------------------

//----------------------------------------------------------------------------------------------------------------
async function createNewAccount(isEmployee_, isEmployer_) {
    const tx = await contractWithWallet1.newAccount(isEmployee_, isEmployer_);
    await tx.wait()

    console.log(tx)
}

async function offerWork(etherAmount) {
    const tx = await contractWithWallet2.offerWork({
        value: ethers.parseEther(etherAmount.toString())
    });
    await tx.wait()

    console.log(tx)
}

async function deleteWork(offeredWorkNumber) {
    const tx = await contractWithWallet2.deleteWork(offeredWorkNumber)  //delete work fonksiyonu için frontend düzenlenmeli
    await tx.wait()

    console.log(tx)
}

async function applyOfferedWork(offeredWorkNumber) {
    const tx = await contractWithWallet1.applyOfferedWork(offeredWorkNumber)
    await tx.wait()

    console.log(tx)
}

async function reqruitEmployee(whichOffer, whichCandidate) {
    const tx = await contractWithWallet2.reqruitEmployee(whichOffer, whichCandidate)
    await tx.wait()

    console.log(tx)
}

async function setEmployeeDone(whichAgreement) {
    const tx = await contractWithWallet1.setEmployeeDone(whichAgreement)
    await tx.wait()

    console.log(tx)
}

async function setEmployerValidate(whichAgreement) {
    const tx = await contractWithWallet2.setEmployerValidate(whichAgreement)
    await tx.wait()

    console.log(tx)
}

async function raiseDispute(whichAgreement) {
    const tx = await contractWithWallet1.raiseDispute(whichAgreement)
    await tx.wait()

    console.log(tx)
}

async function resolveDispute(whichAgreement, beneficiary) {
    const tx = await contractWithWallet2.resolveDispute(whichAgreement, beneficiary)
    await tx.wait()

    console.log(tx)
}
//----------------------------------------------------------------------------------------------------------------

//----------------------------------------------------------------------------------------------------------------
async function getAgreement(whichAgreement_) {
    const agreement = await contract.getAgreement(whichAgreement_)
    return agreement
}

async function getAccount(address) {
    const account = await contract.getAccount(address.toString())
    return account
}
//----------------------------------------------------------------------------------------------------------------

//----------------------------------------------------------------------------------------------------------------
function listenEventAccountCreated() {
    contract.once("accountCreated", (acountAddress, isEmployee_, isEmployer_, event) => {
        const account = new Object
        account.address = acountAddress

        if (isEmployee_) {
            account.role = isEmployee_
        } else {
            account.role = isEmployer_
        }

        accounts[acountAddress] = account
    })
}
function listenEventWorkOffered() {
    contract.once("workOffered", (offeredBy, offer, event) => {
        console.log(`New work offered by ${offeredBy}`)
        console.log(offer);
    })
}
function listenEventWorkDeleted() {
    contract.once("workDeleted", (offer, event) => {
        console.log(`Work deleted by ${(offer.employer)}`) //deletework fonkisyonu için emit eklenmeli, 
        console.log(offer)
    })
}
function listenEventAppliedToWork() {
    contract.once("appliedToWork", (applicant, offeredWork, event) => {
        console.log(`${applicant} is the new candidate of the offered work ${offeredWork}`)
    })
}
function listenEventEmployeeReqruited() {
    contract.once("reqruitedEmployee", (employee, agreement, event) => {
        console.log(agreement)
    })
}
function listenEventEmployeeDone() {
    contract.once("employeeDone", (isDone, event) => {
        console.log("Employee is done with the work") // agreement emit edilmeli
    })
    
}
function listenEventEmployerValidated() {
    contract.once("employerValidated", (isValid, event) => {
        console.log("Employer Validated the given task") //agreement emit edilmeli
        console.log("Employer got the pay!")
    })
}
function listenEventDisputeRaised() {
    contract.once("disputeRaised", (complicant, agreement, event) => {
        console.log(`dispute raised by ${complicant}, for the agreement ${agreement}`) //event kısmında employee kısmı complainant olarak değiştirilmeli
    })
}
function listenEvent() {
    contract.once("disputeResolved", (agreement, event) => {
        console.log("Dispute resolved")
    })
}
//----------------------------------------------------------------------------------------------------------------

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = "jobs.json";
const UPLOAD_DIR = "uploads";
const AGREEMEN_DATA_FILE = "agreements.json"

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

const readJobsFromFile = () => {
  try {
    const data = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const writeJobsToFile = (jobs) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(jobs, null, 2));
};

const readAgreementsFromFile = () => {
  try {
    const data = fs.readFileSync(AGREEMEN_DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const writeAgreementToFile = (agreements) => {
  fs.writeFileSync(AGREEMEN_DATA_FILE, JSON.stringify(agreements, null, 2));
};

app.get("/jobs", (req, res) => {
  const jobs = readJobsFromFile();
  res.json(jobs);
});

app.post("/jobs", async (req, res) => {
  const { owner, title, description, offer } = req.body; 
  
  try {
    await offerWork(offer);
    await listenEventWorkOffered();

    const offeredJobNumber = await contract.numOfOfferedWorks();
    const newJob = {
      id: Number(offeredJobNumber),
      owner,
      worker: null,
      title,
      description,
      workpool: [],
      offer: offer || null,
    };
  
    jobs.push(newJob);
    writeJobsToFile(jobs);

    res.status(201).json({
      message: "Job created successfully",
      job: newJob,
    });

  } catch (err) {
    console.error("Error in /jobs route:", err.message || err);
    res.status(500).json({ error: "Failed to create job", details: err.message });
  }
});

app.delete("/jobs/:jobId/delete", async (req, res) => {
  const { jobId } = req.params;
  let jobs = readJobsFromFile();

  const jobIndex = jobs.findIndex((job) => job.id === Number(jobId)); // jobId'yi sayıya çevir
  if (jobIndex === -1) {
    return res.status(404).json({ error: "Job not found" });
  }

  try {
    await deleteWork(jobId); // Akıllı kontratta silme işlemini çağır
    jobs.splice(jobIndex, 1); // jobs.json dosyasından da siliyoruz
    writeJobsToFile(jobs);

    res.json({ message: "Job deleted successfully" });
    listenEventWorkDeleted(); // Olayı dinlemeye devam et
  } catch (error) {
    console.error("Error deleting job:", error);
    res.status(500).json({ error: "Failed to delete job" });
  }
});



app.post("/jobs/:id/apply", async (req, res) => {
    const { walletAddress } = req.body;
    const jobIndex = jobs.findIndex((j) => j.id === parseInt(req.params.id));
  
    if (jobIndex === -1) {
      return res.status(404).json({ message: "Job not found" });
    }
  
    if (!walletAddress) {
      return res.status(400).json({ message: "Wallet address is required" });
    }
  
    if (jobs[jobIndex].workpool.includes(walletAddress)) {
      return res.status(400).json({ message: "You have already applied for this job" });
    }
    try {

    await applyOfferedWork(jobs[jobIndex].id)
    await listenEventAppliedToWork()

    jobs[jobIndex].workpool.push(walletAddress);  
    writeJobsToFile(jobs);
    res.json({ message: "Applied successfully", job: jobs[jobIndex] });

    } catch (err) {
        console.log(err)
    }
});

app.post("/jobs/:id/assign", async (req, res) => {
  const { worker } = req.body;
  let jobs = readJobsFromFile();
  const jobIndex = jobs.findIndex((j) => j.id === parseInt(req.params.id));

  if (jobIndex === -1) {
    return res.status(404).json({ message: "Job not found" });
  }

  if (!worker || !jobs[jobIndex].workpool.includes(worker)) {
    return res.status(400).json({ message: "Invalid worker selection" });
  }
  try {

    await reqruitEmployee(jobs[jobIndex].id, (jobs[jobIndex].workpool).indexOf(worker) + 1 );
    const agreementId = await contract.numOfAgreements();

    const agreements = readAgreementsFromFile();
    const newAgreement = {
      jobId:jobs[jobIndex].id,
      id: Number(agreementId),
      addressEmployer: jobs[jobIndex].owner,
      addressEmployee: worker,
      amountToStake: jobs[jobIndex].offer,
      employeeDone: false,
      employerValidate: false,
      disputeRaised: false,
      AIcheck: false,
      description: jobs[jobIndex].description,
    };
    agreements.push(newAgreement);
    writeAgreementToFile(agreements);

    jobs[jobIndex].worker = worker;
    writeJobsToFile(jobs);

    res.json({ message: "Worker assigned successfully", job: jobs[jobIndex] });

  } catch (err) {
    console.log(err);
  }
});

app.post("/jobs/:id/submit", upload.single("file"), async (req, res) => {
  const jobId = parseInt(req.params.id);
  const filePath = req.file ? req.file.filename : null;
  let jobs = readJobsFromFile();
  const jobIndex = jobs.findIndex((j) => j.id === jobId);

  if (jobIndex === -1) {
    return res.status(404).json({ message: "Job not found" });
  }

  if (!filePath) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    jobs[jobIndex].submittedFile = filePath;
    writeJobsToFile(jobs);

    let agreements = readAgreementsFromFile();
    const agreementIndex = agreements.findIndex((agreement) => agreement.jobId === jobId);
    
    if (agreementIndex === -1) {
      return res.status(404).json({ message: "Agreement not found" });
    }

    const agreementId = agreements[agreementIndex].id;
    await setEmployeeDone(agreementId);
    listenEventEmployeeDone();

    agreements[agreementIndex].employeeDone = true;
    writeAgreementToFile(agreements);

    res.json({ message: "File submitted successfully", filePath });
  } catch (err) {
    console.error("Error submitting file:", err);
    res.status(500).json({ error: "Failed to submit file" });
  }
});

app.get("/files/:filename", (req, res) => {
  const filePath = path.join(__dirname, UPLOAD_DIR, req.params.filename);
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).json({ message: "File not found" });
  }
});

app.get("/hiresomeone", async (req, res) => {
  const { walletAddress } = req.body;
  console.log(walletAddress)
  const accountArray = await contract.getAccount(walletAddress) //hiresomeone
  if (accountArray[2] == false) {
    contractWithWallet2.createNewAccount(false, true)
  } else {
    console.log("You are already registered")
  }
});

app.get("/findjob", async (req, res) => {
  const { walletAddress } = req.body;
  const accountArray = await contract.getAccount(walletAddress) //findjob
  console.log(accountArray)
  if (accountArray[2] == false) {
    contractWithWallet2.createNewAccount(true, false)
  } else {
    console.log("You are already registered")
  }
});

app.post("/jobs/:id/approve", async (req, res) => {
  const { jobId } = req.body;

  let agreements = readAgreementsFromFile();
  const agreementIndex = agreements.findIndex((agreement) => agreement.jobId === jobId);

  const agreementId = agreements[agreementIndex].id;

  try {
    await setEmployerValidate(agreementId);
    res.status(200).json({ message: "Job approved successfully" });
  } catch (error) {
    console.error("Error approving job:", error);
    res.status(500).json({ error: "Failed to approve job" });
  }
});

app.post("/jobs/:id/reject", async (req, res) => {
  const { jobId } = req.body;

  let agreements = readAgreementsFromFile();
  const agreementIndex = agreements.findIndex((agreement) => agreement.jobId === jobId);

  const agreementId = agreements[agreementIndex].id;

  try {
    await raiseDispute(agreementId);
    res.status(200).json({ message: "Job rejected and dispute raised" });
  } catch (error) {
    console.error("Error rejecting job:", error);
    res.status(500).json({ error: "Failed to reject job" });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});