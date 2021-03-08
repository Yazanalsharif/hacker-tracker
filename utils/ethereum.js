const Web3 = require('web3');
const dotenv = require('dotenv');
const superagent = require('superagent');
const telegram = require('./telegramBot');

dotenv.config({ path: './config/config.env' });
//option to reconnect with websocket
const option = {
  //Enable auto reconnection
  reconnect: {
    auth: true,
    delay: 5000, //ms
    maxAttempts: 6,
    onTimeOut: false
  }
};
const web3 = new Web3(
  new Web3.providers.WebsocketProvider(process.env.ETH_PROVIDER, option)
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

const createContract = async (contractAddress) => {
  try {
    let contractApi = await getApiContract(contractAddress);
    const contract = new web3.eth.Contract(contractApi, contractAddress);
    return contract;
  } catch (err) {
    console.log('there is an error here');
  }
};
//we will edit this address to make it in database
let scammerAddresses = ['0x80c67A1D2A5fFc9281c38dEdc9Ed82AA5481fd18'];
const listenToEevent = async () => {
  try {
    //call burency contract
    let contract = await createContract(process.env.USDT_CONTRACT);
    //get sympol token from burency Contract => BUY
    const contractName = await contract.methods.symbol().call();
    await contract.events
      .Transfer({})
      .on('data', (data) => {
        let isTransactionScammer = scammerAddresses.includes(
          data.returnValues.from
        );
        let balance = data.returnValues.value;
        let fromAddress = data.returnValues.from;
        let toAddress = data.returnValues.to;

        const msg = `
      Token Name: ${contractName}


      The Balance of transaction: ${balance * 1e-18} BUY Token

      from address: ${fromAddress}

      To Address: ${toAddress}
      `;

        if (isTransactionScammer) {
          telegram.sendingMessage(msg);
          scammerAddresses.push(toAddress);
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
      });
  } catch (error) {
    console.log(error.msg);
  }
};

listenToEevent();
