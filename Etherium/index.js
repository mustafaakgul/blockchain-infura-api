const Web3 = require("web3")
const axios = require("axios")
//const web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545/"))
const web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/{API_KEY}"))
let chainId = 3;//Ganache 1
//const web3 = new Web3(new Web3.providers.HttpProvider("http://[IP]:8545/"))//Node
const { apiResult } = require("../../blockchain-infura-api/Model/apiResult");
const contractAbiFile = require('./contractAbi.json');
const Tx = require('ethereumjs-tx').Transaction;

module.exports = {
    getEtherBalance: async function (data) {
        try {
            var result = await web3.eth.getBalance(data.FromAddress);

            return apiResult(true, web3.utils.fromWei(result, 'ether'), 200);
        } catch (error) {
            return apiResult(false, error.message, 500);
        }
    },
    getErc20TokenBalance: async function (data) {
        try {
            var minABI = await contractAbiFile;
            var contractAddress = data.Contract == undefined ? "{ADDRESS}" : data.Contract;
            let contract = await new web3.eth.Contract(minABI, contractAddress);
            var result = await contract.methods.balanceOf(data.FromAddress).call();
            var decimals = await contract.methods.decimals().call();
            var amount = result;
            console.log(amount);
            console.log(web3.utils.fromWei(amount.toString(), 'ether'));
            return apiResult(true, (amount / Math.pow(10, decimals)).toString(), 200);
        } catch (error) {
            return apiResult(false, error.message, 500);
        }
    },
    checkEtherTransaction: async function (data) {
        try {

            var result = await web3.eth.getTransactionReceipt(data.TransactionId);

            console.log(result);
            if (result != null) {
                result = result.status;
            }
            else {
                result = false;
            }
            return apiResult(true, result, 200);
        } catch (error) {
            return apiResult(false, error.message, 500);
        }
    },
    transferEthereum: async function (data) {
        try {

            var senderAddress = { address: data.FromAddress, privateKey: data.PrivateKey };
            var toAddress = data.ToAddress;
            //var gasPrices = await getCurrentGasPrices();
            // var nonce = await web3.eth.getTransactionCount(senderAddress.address);
            var nonce = await web3.eth.getTransactionCount(senderAddress.address);
            var gp = parseInt(await web3.eth.getGasPrice() * 105 / 100);

            console.log(data.Amount);
            console.log(web3.utils.toHex(web3.utils.toWei(data.Amount.toString(), 'ether')));

            var createTransaction = await web3.eth.accounts.signTransaction({
                from: senderAddress.address,
                to: toAddress,
                gas: 21000,
                gasPrice: web3.utils.toHex(gp),
                value: web3.utils.toWei(data.Amount.toString(), 'ether'),
            }, senderAddress.privateKey);

            var result = await web3.eth.sendSignedTransaction(createTransaction.rawTransaction);

            if (result.transactionHash != null) {
                return apiResult(true, result.transactionHash, 200);
            }
            else {
                return apiResult(false, result, 200);
            }
        } catch (error) {
            return apiResult(false, error.message, 500);
        }
    },
    transferErc20Token: async function (data) {
        try {
            var minABI = await contractAbiFile;
            var contractAddress = data.Contract == undefined ? "{ADDRESS}" : data.Contract;
            let contract = await new web3.eth.Contract(minABI, contractAddress);

            var senderAddress = { address: data.FromAddress, privateKey: data.PrivateKey };
            var toAddress = data.ToAddress;

            let nonce = await web3.eth.getTransactionCount(senderAddress.address);
            var gp = parseInt(await web3.eth.getGasPrice() * 105 / 100);
            chainId = await web3.eth.getChainId();
            var txDetails = {
                "from": senderAddress.address,
                "to": data.Contract,
                "gas": 65000,
                "gasPrice": web3.utils.toHex(gp),
                "nonce": nonce == 0 ? 2 : nonce,
                "chainId": chainId,
                "data": await contract.methods.transfer(toAddress, web3.utils.toWei(data.Amount.toString(), 'ether')).estimateGas({ from: senderAddress.address }),
                "value": web3.utils.toHex(web3.utils.toWei("0".toString(), 'ether'))
            };

            console.log(txDetails);

            const transaction = new Tx(txDetails, { chain: 'ropsten' });

            let privKey = Buffer.from(senderAddress.privateKey, 'hex');
            await transaction.sign(privKey);

            const serializedTx = `0x${transaction.serialize().toString('hex')}`;
            var result = await web3.eth.sendSignedTransaction(serializedTx);

            if (result.transactionHash != null) {
                return apiResult(true, result.transactionHash, 200);
            }
            else {
                return apiResult(false, result, 200);
            }

        } catch (error) {
            return apiResult(false, error.message, 500);
        }
    }
};

async function getCurrentGasPrices() {
    let response = await axios.get('https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey={API_KEY}');
    let prices = {
        low: response.data.result.SafeGasPrice,
        medium: response.data.result.ProposeGasPrice,
        high: response.data.result.FastGasPrice
    };
    return prices;
}