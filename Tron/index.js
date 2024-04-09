const TronWeb = require('tronweb');
const { apiResult } = require("../Model/apiResult")
const HttpProvider = TronWeb.providers.HttpProvider;
const fullNode = new HttpProvider('https://api.trongrid.io');
const solidityNode = new HttpProvider('https://api.trongrid.io');
const eventServer = 'https://api.trongrid.io';

// const fullNode = new HttpProvider('https://api.nileex.io/');
// const solidityNode = new HttpProvider('https://api.nileex.io/');
// const eventServer = 'https://event.nileex.io/';

module.exports = {
    getTronBalance: async function (data) {
        try {
            tronWeb = new TronWeb(
                fullNode,
                solidityNode,
                eventServer
            );
            var amount = await tronWeb.trx.getBalance(data.FromAddress);
            return apiResult(true, JSON.stringify(amount / 1000000), 200);
        } catch (error) {
            return apiResult(false, JSON.stringify(error), 500);
        }
    },
    getTrc20TokenBalance: async function (data) {
        try {

            tronWeb = new TronWeb(
                fullNode,
                solidityNode,
                eventServer
            );

            var { abi } = await tronWeb.trx.getContract(data.Contract);

            await tronWeb.setAddress(data.FromAddress);
            var amount = await tronWeb.contract(abi.entrys, data.Contract).methods.balanceOf(data.FromAddress).call();
            var result = apiResult(true, JSON.stringify(amount.toNumber() / 1000000), 200);

            return result;
        }
        catch (error) {
            return apiResult(false, JSON.stringify(error), 500);
        }
    },
    getTronTransaction: async function (data) {
        try {

            tronWeb = new TronWeb(
                fullNode,
                solidityNode,
                eventServer
            );

            // TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t

            var result = await tronWeb.trx.getTransaction(data.TransactionId);
            var res = false;
            if (result != null && result.ret[0].contractRet == "SUCCESS") {
                var isConfirmed = await tronWeb.trx.getConfirmedTransaction(data.TransactionId);
                console.log(isConfirmed);
                if (isConfirmed.ret != null && result.ret[0].contractRet == "SUCCESS") {
                    res = true;
                }
                else {
                    res = false;
                }
            }

            console.log(result);
            return apiResult(true, res, 200);
        }
        catch (error) {
            console.log(error);
            return apiResult(false, null, 500);
        }
    },
    transferTron: async function (data) {
        try {

            tronWeb = new TronWeb(
                fullNode,
                solidityNode,
                eventServer
            );

            var result = await tronWeb.trx.sendTransaction(data.ToAddress, data.Amount * Math.pow(10, 6), data.PrivateKey);
            console.log(result);
            return apiResult(result.result, result.transaction.txID, 200);
        }
        catch (error) {
            console.log(error);
            return apiResult(false, error, 500);
        }
    },
    transferTrc20Token: async function (data) {
        try {

            tronWeb = new TronWeb(
                fullNode,
                solidityNode,
                eventServer,
                data.PrivateKey
            );

            const contractAddressHex = tronWeb.address.toHex(data.Contract);
            const contract = await tronWeb.contract().at(contractAddressHex);

            // var contract = await tronWeb.contract().at(data.Contract);
            var decimals = await contract.decimals().call();

            console.log(decimals);

            console.log(data.Amount * Math.pow(10, decimals));

            var result = await contract.methods.transfer(data.ToAddress, BigInt(data.Amount * Math.pow(10, decimals))).send();
            console.log(result);
            return apiResult(true, result, 200);
        }
        catch (error) {
            console.log(error);
            return apiResult(false, error, 500);
        }
    }
};