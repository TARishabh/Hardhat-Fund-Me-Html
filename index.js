// import {ethers} from "ethers";

import { ethers } from "./ethers-5.6.esm.min.js";
import { abi, contractAddress } from "./constants.js";

const connectButton = document.getElementById("connectbutton");
const fundButton = document.getElementById("fundbutton");
const getOwnerBalanceButton = document.getElementById("getOwnerBalance");
const getBalanceOfContractButton = document.getElementById(
    "getBalanceOfContract"
);
const withdrawButton = document.getElementById("withdraw");

connectButton.onclick = connect;
fundButton.onclick = fund;
getOwnerBalanceButton.onclick = getBalanceOfOwner;
getBalanceOfContractButton.onclick = getBalanceOfContract;
withdrawButton.onclick = withdraw;

async function connect() {
    // let connection = await window.ethereum;
    if (typeof window.ethereum !== "undefined") {
        // console.log(connection);
        try {
            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts",
            });
            console.log(accounts);
            // document.getElementById("connectbutton").innerHTML = "Connected"
            connectButton.innerHTML = "Connected";
            console.log("connected");
        } catch (error) {
            document.getElementById("connectbutton").innerHTML = "Not Connected";
            console.log(error);
        }
    } else {
        console.log("No meta mask");
        connectButton.innerHTML = "Not Connected";
    }
}

async function fund() {
    // ethAmount = '0.7';
    const ethAmount = document.getElementById("ethAmount").value;
    console.log(`Fund Function Was called with ${ethAmount}`);

    // To send a transaction, what are the things which we require:
    // provider / connection to the blockchain
    // signer // wallet // someone with some gas to send that transaction on the blockchain
    // contract that we are interacting with
    // ABI and Address
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum); // this will give us that url which we generally get from alchemy
        console.log(`provider is ${provider}`);
        const wallet = provider.getSigner(); // if we are connected to account 1, it returns account 1. If connected to account 2, it returns account 2.
        console.log(`Signer is ${wallet}`);
        const contract = new ethers.Contract(contractAddress, abi, wallet);
        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            });
            await listenForTransactionMine(transactionResponse, provider);
            console.log(`Done`);
        } catch (error) {
            console.log(error);
        }
    }
}

function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}...`);
    // return new Promise();
    // provider.once(transactionResponse.hash, listener)
    //Hey but you have to wait for the transaction receipt, so return a promise.
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(
                `Completed With ${transactionReceipt.confirmations} confirmations`
            );
            // now only when this transaction receipt confirmation is triggered, we resolve the promise.
            resolve();
        });
    });
}

async function getBalanceOfContract() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(contractAddress);
    console.log(ethers.utils.formatEther(balance));
}

async function getBalanceOfOwner() {
    try {
        // Ensure that the MetaMask extension is installed and active
        if (window.ethereum) {
            // Connect to the MetaMask provider
            const provider = new ethers.providers.Web3Provider(window.ethereum);

            // Get the signer (wallet) from the connected provider
            const wallet = provider.getSigner();

            // Get the balance of the connected wallet
            const balance = await wallet.getBalance();

            // Parse the balance from wei to Ether and log it
            const etherBalance = ethers.utils.formatEther(balance);
            console.log("Ether Balance:", etherBalance);

            return etherBalance;
        } else {
            console.error("MetaMask is not installed or not active.");
        }
    } catch (error) {
        console.error("Error fetching balance:", error.message);
    }
}

async function withdraw() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const wallet = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, wallet);
    try {
        const transactionResponse = await contract.withdraw();
        await listenForTransactionMine(transactionResponse, provider);
    } catch (error) {
        console.log(error);
    }
}

// Official code from Metamask Documentation.

// async function getAccount() {
//     const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
//       .catch((err) => {
//         if (err.code === 4001) {
//           // EIP-1193 userRejectedRequest error
//           // If this happens, the user rejected the connection request.
//           console.log('Please connect to MetaMask.');
//         } else {
//           console.error(err);
//         }
//       });
//     const account = accounts[0];
//     showAccount.innerHTML = account;
//   }
