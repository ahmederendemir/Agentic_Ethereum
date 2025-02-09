/* eslint-disable jsdoc/require-returns */
/* eslint-disable jsdoc/require-param-description */
/* eslint-disable jsdoc/require-description */
import { getLangChainTools } from "@coinbase/agentkit-langchain";
import { AgentKit } from "@coinbase/agentkit";
import { getContract } from "./contractUtils";
import { parseEther } from "ethers";
import dotenv from "dotenv";

dotenv.config();

// Initialize AgentKit with environment variables
/**
 *
 */
async function initializeAgentKit() {
  return await AgentKit.from({
    cdpApiKeyName: process.env.CDP_API_KEY_NAME,
    cdpApiPrivateKey: process.env.CDP_API_PRIVATE_KEY,
    openAIApiKey: process.env.OPENAI_API_KEY,
    walletProvider: process.env.WALLET_PROVIDER || "cdp",
    networkId: process.env.NETWORK_ID || "base-sepolia",
  });
}

/**
 *
 * @param signer
 * @param amount
 */
async function offerWork(signer, amount) {
  const contract = await getContract(signer);
  const tx = await contract.offerWork({ value: parseEther(amount) });
  await tx.wait();
  console.log("Work offer successfully created.");
}

/**
 *
 * @param signer
 * @param workId
 */
async function applyOfferedWork(signer, workId) {
  const contract = await getContract(signer);
  const tx = await contract.applyOfferedWork(workId);
  await tx.wait();
  console.log("Applied for the job.");
}

/**
 *
 * @param signer
 * @param workId
 * @param candidateId
 */
async function recruitEmployee(signer, workId, candidateId) {
  const contract = await getContract(signer);
  const tx = await contract.reqruitEmployee(workId, candidateId);
  await tx.wait();
  console.log("Employee recruited.");
}

/**
 *
 * @param signer
 * @param agreementId
 */
async function setEmployeeDone(signer, agreementId) {
  const contract = await getContract(signer);
  const tx = await contract.setEmployeeDone(agreementId);
  await tx.wait();
  console.log("Employee marked as done.");
}

/**
 *
 * @param signer
 * @param agreementId
 */
async function setEmployerValidate(signer, agreementId) {
  const contract = await getContract(signer);
  const tx = await contract.setEmployerValidate(agreementId);
  await tx.wait();
  console.log("Employer validated the job.");
}

/**
 *
 * @param signer
 * @param agreementId
 */
async function raiseDispute(signer, agreementId) {
  const agentKit = await initializeAgentKit();
  const tools = await getLangChainTools(agentKit);

  console.log("Analyzing dispute using AgentKit...");
  // Here, an evaluation with AgentKit can be performed

  const contract = await getContract(signer);
  const tx = await contract.raiseDispute(agreementId);
  await tx.wait();
  console.log("Dispute recorded on blockchain.");
}

/**
 *
 * @param signer
 * @param agreementId
 * @param beneficiary
 */
async function resolveDispute(signer, agreementId, beneficiary) {
  const agentKit = await initializeAgentKit();
  const tools = await getLangChainTools(agentKit);

  console.log("Initiating dispute resolution process with AgentKit...");
  // Here, an AI-based analysis and decision-making process can be applied

  const contract = await getContract(signer);
  const tx = await contract.resolveDispute(agreementId, beneficiary);
  await tx.wait();
  console.log("Dispute successfully resolved and recorded on blockchain.");
}
