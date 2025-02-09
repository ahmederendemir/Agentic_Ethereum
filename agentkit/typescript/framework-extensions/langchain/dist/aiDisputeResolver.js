"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable jsdoc/require-jsdoc */
/* eslint-disable prettier/prettier */
const openai_1 = require("langchain/chat_models/openai");
const schema_1 = require("langchain/schema");
const web3_1 = __importDefault(require("web3"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const openai = new openai_1.ChatOpenAI({ modelName: "gpt-4", openAIApiKey: process.env.OPENAI_API_KEY });
const infuraUrl = process.env.INFURA_URL;
const web3 = new web3_1.default(new web3_1.default.providers.HttpProvider(infuraUrl));
const contractAddress = process.env.SMART_CONTRACT_ADDRESS;
const contractAbi = JSON.parse(process.env.CONTRACT_ABI);
const contract = new web3.eth.Contract(contractAbi, contractAddress);
async function evaluateAndResolveDispute() {
    const totalAgreements = await contract.methods.numOfAgreements().call();
    const agreementId = totalAgreements;
    const agreement = await contract.methods.getAgreement(agreementId).call();
    const employerAddress = agreement.employer;
    const employeeAddress = agreement.employee;
    const customerDescription = "Müşterinin proje açıklaması burada.";
    const developerCode = "Yazılımcının sunduğu kod burada.";
    const messages = [
        new schema_1.HumanMessage({ content: `Müşteri Açıklaması: ${customerDescription}\nKod: ${developerCode}\nBenzerlik oranını yüzde olarak değerlendir.` })
    ];
    const response = await openai.call(messages);
    const successRate = parseInt(response.content.replace("%", ""));
    console.log(`AI başarı oranı: ${successRate}%`);
    const beneficiary = successRate >= 70 ? employeeAddress : employerAddress;
    const tx = contract.methods.resolveDispute(agreementId, beneficiary);
    const gas = await tx.estimateGas({ from: web3.eth.defaultAccount });
    const gasPrice = await web3.eth.getGasPrice();
    const transaction = {
        from: web3.eth.defaultAccount,
        to: contractAddress,
        gas,
        gasPrice,
        data: tx.encodeABI()
    };
    const signedTx = await web3.eth.accounts.signTransaction(transaction, process.env.WALLET_PRIVATE_KEY);
    const txHash = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log(`Transaction hash: ${txHash.transactionHash}`);
}
evaluateAndResolveDispute().catch(console.error);
