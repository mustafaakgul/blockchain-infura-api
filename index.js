const express = require('express')
const cors = require("cors")
const app = express()
const port = 1810
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
const { getEtherBalance, getErc20TokenBalance, transferEthereum, transferErc20Token, checkEtherTransaction } = require("./Ethereum/index");
const { getTronBalance, getTrc20TokenBalance, getTronTransaction, transferTron, transferTrc20Token } = require("./Tron");
// const { isEmpty } = require("./helpers")


app.use(cors());
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

app.get('/', (req, res) => {
    res.send('Node Connections!')
})


app.post('/api/v1/Transfer', jsonParser, async function (req, res) {
    try {

        var validation = transferValidation(req.body);
        var tempResult = null;
        if (!validation) {
            res.status(500).json(
                { status: false, data: "Error!" }
            );
        }
        else {
            var network = req.body.Network;
            var result = { error: null, data: { status: false, transactionId: null } };
            if (network == "ETHEREUM") {
                tempResult = await transferEthereum(req.body);
                console.log(tempResult);
                //kontrol
                result.data.status = (tempResult.status == false || isEmpty(tempResult.message)) ? false : true;
                if (tempResult.status) {
                    result.data.transactionId = tempResult.message;
                }
                else {
                    result.error = tempResult.message.data.stack;
                    result.data.status = false;
                }
            }
            else if (network == "TRON") {
                tempResult = await transferTron(req.body);
                console.log(tempResult);
                //kontrol
                result.data.status = tempResult.status == false || isEmpty(tempResult.message) ? false : true;
                if (tempResult.status) {
                    result.data.transactionId = tempResult.message;
                    result.data.status = true;
                }
                else {
                    result.error = tempResult.message;
                    result.data.status = false;
                }
            }
            else if (network == "TRON_USDT") {
                req.body.Contract = "{ADDRESS}";//USDT
                tempResult = await transferTrc20Token(req.body);
                console.log(tempResult);
                //kontrol
                result.data.status = tempResult.status == false || isEmpty(tempResult.message) ? false : true;
                if (tempResult.status) {
                    result.data.transactionId = tempResult.message;
                    result.data.status = true;
                }
                else {
                    result.error = tempResult.message;
                    result.data.status = false;
                }
            }
            else if (network == "ETHEREUM_USDT") {

                req.body.Contract = "{ADDRESS}";//USDT
                tempResult = await transferErc20Token(req.body);
                console.log(tempResult);
                //kontrol
                result.status = tempResult.status == false || isEmpty(tempResult.message) ? false : true;
                if (tempResult.status) {
                    result.data.transactionId = tempResult.message;
                    result.data.status = true;
                }
                else {
                    result.error = tempResult.message.data.stack;
                    result.data.status = false;
                }

            }
        }
        res.status(tempResult.response).json(
            result
        );
    } catch (e) {
        // console.log(e);
        res.status(500).json(
            { error: e, data: null }
        );
    }
})

app.post('/api/v1/CheckTx', jsonParser, async function (req, res) {
    try {
        var validation = chechTxValidation(req.body);
        var tempResult = null;
        if (!validation) {
            res.status(500).json(
                { status: false, data: "Error!" }
            );
        }
        else {
            var network = req.body.Network;
            var result = { error: null, data: { status: false } };
            if (network == "ETHEREUM") {
                tempResult = await checkEtherTransaction(req.body);
                console.log(tempResult);
                //kontrol
                result.data.status = (tempResult.status == false || isEmpty(tempResult.message)) ? false : tempResult.message.Status;
                if (tempResult.status) {
                    result.data.status = true;
                }
                else {
                    result.error = tempResult.message;
                    result.data.status = false;
                }
            }
            else if (network == "TRON") {
                tempResult = await getTronTransaction(req.body);
                console.log(tempResult);
                //kontrol
                result.data.status = tempResult.status == false || isEmpty(tempResult.message) ? false : tempResult.message.Status;
                if (tempResult.status) {
                    result.data.status = true;
                }
                else {
                    result.error = tempResult.message;
                    result.data.status = false;
                }
            }
            else if (network == "TRON_USDT") {
                tempResult = await getTronTransaction(req.body);
                console.log(tempResult);
                //kontrol
                result.data.status = tempResult.status == false || isEmpty(tempResult.message) ? false : tempResult.message.Status;
                if (tempResult.status) {
                    result.data.status = true;
                }
                else {
                    result.error = tempResult.message;
                    result.data.status = false;
                }
            }
            else if (network == "ETHEREUM_USDT") {

                tempResult = await checkEtherTransaction(req.body);
                console.log(tempResult);
                //kontrol
                result.data.status = tempResult.status == false || isEmpty(tempResult.message) ? false : tempResult.message.Status;
                if (tempResult.status) {
                    result.data.status = true;
                }
                else {
                    result.error = tempResult.message;
                    result.data.status = false;
                }
            }
            res.status(tempResult.response).json(
                result
            );
        }
    } catch (e) {
        console.log(e);
        res.status(500).json(
            { error: e, data: null }
        );
    }
})

app.post('/api/v1/GetTronBalance', jsonParser, async function (req, res) {
    try {
        console.log(req.body);
        var result = await getTronBalance(req.body);
        res.status(result.response).json(
            result
        );
    } catch (e) {
        res.status(500).json(
            apiResult(false, JSON.stringify(e), 500)
        );
    }
})

app.post('/api/v1/GetTrc20TokenBalance', jsonParser, async function (req, res) {
    try {
        var result = await getTrc20TokenBalance(req.body);
        res.status(result.response).json(
            result
        );
    } catch (e) {
        res.status(500).json(
            apiResult(false, JSON.stringify(e), 500)
        );
    }
})

app.post('/api/v1/GetEtherBalance', jsonParser, async function (req, res) {
    try {

        var result = await getEtherBalance(req.body);
        console.log(result);
        res.status(result.response).json(
            result
        );
    } catch (e) {
        res.status(500).json(
            apiResult(false, JSON.stringify(e), 500)
        );
    }
})

app.post('/api/v1/GetErc20TokenBalance', jsonParser, async function (req, res) {
    try {
        var result = await getErc20TokenBalance(req.body);
        res.status(result.response).json(
            result
        );
    } catch (e) {
        res.status(500).json(
            apiResult(false, JSON.stringify(e), 500)
        );
    }
})

app.post('/api/v1/TransferEther', jsonParser, async function (req, res) {
    try {
        var result = await transferEthereum(req.body);
        res.status(result.response).json(
            result
        );
    } catch (e) {
        res.status(500).json(
            apiResult(false, JSON.stringify(e), 500)
        );
    }
})

app.post('/api/v1/TransferErc20Token', jsonParser, async function (req, res) {
    try {
        var result = await transferErc20Token(req.body);
        res.status(result.response).json(
            result
        );
    } catch (e) {
        res.status(500).json(
            apiResult(false, JSON.stringify(e), 500)
        );
    }
})

app.post('/api/v1/CheckEtherTransaction', jsonParser, async function (req, res) {
    try {
        var result = await checkEtherTransaction(req.body);
        res.status(result.response).json(
            result
        );
    } catch (e) {
        res.status(500).json(
            apiResult(false, JSON.stringify(e), 500)
        );
    }
})

app.post('/api/v1/CheckTronTransaction', jsonParser, async function (req, res) {
    try {
        var result = await getTronTransaction(req.body);



        res.status(result.response).json(
            result
        );
    } catch (e) {
        res.status(500).json(
            apiResult(false, JSON.stringify(e), 500)
        );
    }
})

app.post('/api/v1/TransferTron', jsonParser, async function (req, res) {
    try {
        var result = await transferTron(req.body);

        res.status(result.response).json(
            result
        );
    } catch (e) {
        res.status(500).json(
            apiResult(false, JSON.stringify(e), 500)
        );
    }
})

app.post('/api/v1/TransferTrc20Token', jsonParser, async function (req, res) {
    try {
        var result = await transferTrc20Token(req.body);


        res.status(result.response).json(
            result
        );
    } catch (e) {
        res.status(500).json(
            apiResult(false, JSON.stringify(e), 500)
        );
    }
})

function isEmpty(text) {
    try {
        if (text == undefined)
            return true;

        if (text == null)
            return true;

        if (text.trim() == '')
            return true;

        return false;
    } catch (error) {
        return false;
    }
}

function transferValidation(data) {
    if (isEmpty(data.PrivateKey) || isEmpty(data.ToAddress) || isEmpty(data.FromAddress) || isEmpty(data.Amount) || isEmpty(data.Network) || isEmpty(data.Fee)) {
        return false;
    }
    return true;
}

function chechTxValidation(data) {
    if (isEmpty(data.TransactionId) || isEmpty(data.Network)) {
        return false;
    }
    return true;
}