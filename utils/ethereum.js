const Web3 = require('web3');
const dotenv = require('dotenv');
const superagent = require('superagent');
const telegram = require('./telegramBot');
const Scammer = require('../models/scammer.js');
dotenv.config({ path: './config/config.env' });

const createProvider = () => {
  let provider = new Web3.providers.WebsocketProvider(process.env.ETH_PROVIDER);

  let web3 = new Web3(provider);

  //listen to errors from provider
  provider.on('error', (e) => console.log('ws server', e));
  //try to reconnect to provider when the provider ends
  provider.on('end', async (e) => {
    telegram.sendingLligalMessage('the connection is droped');
    setTimeout(async () => {
      await listenToEevent();
    }, 7000);
    telegram.sendingLligalMessage('the connection is uped');
  });

  return web3;
};
//get Buy Token Contract
const getApiContract = async (contractAddress) => {
  //api to return burency Contract address
  const api = `https://api.etherscan.io/api?module=contract&action=getabi&address=${contractAddress}&apikey=${process.env.ETH_API_KEY}`;
  try {
    //here we go
    const res = await superagent.get(api);
    const contract = JSON.parse(res.body.result);
    return contract;
  } catch (err) {
    console.log(err);
  }
};

const createContract = async (contractAddress) => {
  try {
    const web3 = createProvider();
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
    console.log('we are listening to the event');
    await contract.events
      .Transfer()
      .on('data', async (data) => {
        let sender = data.returnValues.from.toLowerCase();
        let balance = data.returnValues.value;
        let fromAddress = data.returnValues.from;
        let toAddress = data.returnValues.to;
        //i am fucking loser
        const msg = `
      Token Name: ${contractName}


      The Balance of transaction: ${balance * 1e-18} BUY Token

      from address: ${fromAddress}

      To Address: ${toAddress}
      `;
        //thats good
        const kucionAddress = '0xa1D8d972560C2f8144AF871Db508F0B0B10a3fBf';
        const bitmartAddress = '0x68b22215ff74e3606bd5e6c1de8c2d68180c85f7';
        const scammer = await Scammer.find({ scammer: sender });
        if (scammer) {
          telegram.sendingMessage(msg);
          if (
            kucionAddress.toLowerCase() === toAddress.toLowerCase() ||
            bitmartAddress === toAddress.toLowerCase()
          ) {
            //nothing
          } else {
            await Scammer.create({ scammer: toAddress.toLowerCase() });
          }
        } else {
          telegram.sendingLligalMessage(msg);
        }
      })
      .on('error', (err) => {
        console.log('block error');
        console.log(err.message);
      })
      .on('changed', (cha) => {
        console.log('change');
        console.log(cha);
      })
      .on('connection', (ch) => {
        console.log(ch);
      });
  } catch (error) {
    console.log(error.msg);
  }
};
// i wish everything will work very well
module.exports = listenToEevent;
