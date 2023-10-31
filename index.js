import { ethers } from "./ethers-6.8.esm.min.js";
import { abi, contractAddress } from "./constants.js";

const btnConnect = document.querySelector(".btn__connect");
const fundForm = document.querySelector(".form");
const contractBalance = document.querySelector(".btn__balance");
const contractWithdraw = document.querySelector(".btn__withdraw");

const connect = async () => {
  if (typeof window.ethereum) {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    btnConnect.textContent = "Connected !";
    console.log("conneted");
  } else {
    console.log("you don't have a metamask pls install it");
  }
};

btnConnect.addEventListener("click", connect);

fundForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const ethAmount = e.target.elements.fund.value;
  fund(ethAmount);
});

const fund = async (ethAmount) => {
  console.log(`Funding with ${ethAmount} ETH`);

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(contractAddress, abi, signer);
  try {
    const transactionResponses = await contract.fund({
      value: ethers.parseEther(ethAmount),
    });

    await listenForTransactionMine(transactionResponses, provider);
  } catch (error) {
    console.log(error);
  }
};

function listenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}...`);
  return new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      console.log(
        `Completed with ${transactionReceipt.status} confirmations. `
      );
      resolve();
    });
  });
}

const getBalance = async () => {
  if (window.ethereum) {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const balance = await provider.getBalance(contractAddress);
    console.log(`your balance is ${ethers.formatEther(balance)} ETH`);
  }
};
contractBalance.addEventListener("click", getBalance);

const withdraw = async () => {
  if (window.ethereum) {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);

    try {
      const transactionResponses = await contract.withdraw();

      await listenForTransactionMine(transactionResponses, provider);
    } catch (error) {
      console.log(error);
    }
  }
};
contractWithdraw.addEventListener("click", withdraw);
