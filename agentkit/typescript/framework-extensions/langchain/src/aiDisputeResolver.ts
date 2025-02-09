/* eslint-disable no-inner-declarations */
import { getLangChainTools } from "@coinbase/agentkit-langchain";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { AgentKit } from "@coinbase/agentkit";
import Web3 from "web3";
import dotenv from "dotenv";

dotenv.config();

/**
 *.
 */
async function initialize() {
  try {
    // AgentKit ile bağlantıyı başlat
    const agentKit = await AgentKit.from({
      cdpApiKeyName: process.env.CDP_API_KEY_NAME!,
      cdpApiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE!,
    });

    // LangChain araçlarını al
    const tools = await getLangChainTools(agentKit);

    // OpenAI modelini başlat
    const llm = new ChatOpenAI({
      model: "gpt-4o-mini",
    });

    // AI ajanını oluştur
    const agent = createReactAgent({
      llm,
      tools,
    });

    // Web3 bağlantısını kur
    if (!process.env.INFURA_URL) throw new Error("INFURA_URL environment variable is missing!");

    const web3 = new Web3(new Web3.providers.HttpProvider(process.env.INFURA_URL));
    const contractAddress = process.env.SMART_CONTRACT_ADDRESS!;
    const contractAbi = JSON.parse(process.env.CONTRACT_ABI!);
    const contract = new web3.eth.Contract(contractAbi, contractAddress);

    /**
     *.
     */
    async function evaluateAndResolveDispute() {
      // Akıllı kontrattan anlaşma ID’sini al
      const totalAgreements = await contract.methods.numOfAgreements().call();
      const agreementId = totalAgreements;

      // Anlaşmanın müşteri ve yazılımcı adreslerini al
      interface Agreement {
        employer: string;
        employee: string;
        // ... diğer alanlar
      }

      // Akıllı sözleşmeden veri çekme
      const agreement = (await contract.methods.getAgreement(agreementId).call()) as Agreement;

      // Verileri kullanma
      const employerAddress = agreement.employer;
      const employeeAddress = agreement.employee;
      // AI değerlendirmesi için müşteri açıklaması ve yazılımcının kodu
      const customerDescription = "Müşterinin proje hakkında verdiği açıklama burada.";
      const developerCode = "Yazılımcının sunduğu kod burada.";

      // AI Modeline soruyu ilet
      const aiPrompt = `Müşteri Açıklaması: ${customerDescription}\nKod: ${developerCode}\nBenzerlik oranını yüzde olarak değerlendir.`;

      const response = await agent.invoke({ messages: [{ role: "user", content: aiPrompt }] });
      const successRate = parseInt(response.structuredResponse?.replace("%", "") || "0");

      console.log(`AI başarı oranı: ${successRate}%`);

      // Başarı oranına göre akıllı kontrata çağrı yap
      const beneficiary = successRate >= 70 ? employeeAddress : employerAddress;

      // Akıllı kontrata resolveDispute fonksiyonunu çağırma
      const tx = contract.methods.resolveDispute(agreementId, beneficiary);
      const gas = await tx.estimateGas({ from: web3.eth.defaultAccount });
      const gasPrice = await web3.eth.getGasPrice();

      const transaction = {
        from: web3.eth.defaultAccount,
        to: contractAddress,
        gas,
        gasPrice,
        data: tx.encodeABI(),
      };

      // İşlemi imzalama ve gönderme
      if (!process.env.WALLET_PRIVATE_KEY) throw new Error("WALLET_PRIVATE_KEY is missing!");

      const signedTx = await web3.eth.accounts.signTransaction(
        transaction,
        process.env.WALLET_PRIVATE_KEY,
      );
      const txHash = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
      console.log(`Transaction hash: ${txHash.transactionHash}`);
    }

    // Çalıştır
    evaluateAndResolveDispute().catch(console.error);
  } catch (error) {
    console.error("Başlatma hatası:", error);
  }
}

// **Tüm işlemleri başlatmak için** çağırıyoruz
initialize();
