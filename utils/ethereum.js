const Web3 = require('web3');
const dotenv = require('dotenv');
const superagent = require('superagent');
const telegram = require('./telegramBot');
//setup envir variable
dotenv.config({ path: './config/config.env' });

const web3 = new Web3(
  new Web3.providers.WebsocketProvider(process.env.ETH_PROVIDER)
);

//get Buy Token Contract
const getApiContract = async (contractAddress) => {
  //api to return burency Contract address
  const api = `https://api.etherscan.io/api?module=contract&action=getabi&address=${contractAddress}&apikey=${process.env.ETH_API_KEY}`;
  try {
    const res = await superagent.get(api);
    const contract = JSON.parse(res.body.result);
    return contract;
  } catch (err) {
    console.log(err);
  }
};
let scammer = process.env.SCAMMER_ADDRESS;

const createContract = async (contractAddress) => {
  try {
    let contractApi = await getApiContract(contractAddress);
    const contract = new web3.eth.Contract(contractApi, contractAddress);
    return contract;
  } catch (err) {
    console.log('there is an error here');
  }
};

const listenToEevent = async () => {
  try {
    //call burency contract
    let contract = await createContract(process.env.BUY_CONTRACT);
    //get sympol token from burency Contract => BUY
    const contractName = await contract.methods.symbol().call();
    const decimal = await contract.methods.decimals().call();
    console.log(decimal);
    await contract.events
      .Transfer({ from: process.env.SCAMMER_ADDRESS })
      .on('data', (data) => {
        let balance = data.returnValues.value;
        let fromAddress = data.returnValues.from;
        let toAddress = data.returnValues.to;
        const msg = `
      Token Name: ${contractName}


      The Balance of transaction: ${balance * 1e-18} BUY Token

      from address: ${fromAddress}

      To Address: ${toAddress}
      `;
        telegram.sendingMessage(msg);
      });
  } catch (error) {
    console.log(error.msg);
  }
};
listenToEevent();
