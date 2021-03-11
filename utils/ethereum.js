const Web3 = require('web3');
const dotenv = require('dotenv');
const superagent = require('superagent');
const telegram = require('./telegramBot');

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
//we will edit this address to make it in database
let scammerAddresses = [
  '0x80c67a1d2a5ffc9281c38dedc9ed82aa5481fd18',
  '0xe90fb1b76f88e91024f8cf58b78901af2ee7b5cd',
  '0xfd4120d697b48a806c8a30284a54ebc7df3c7bf3',
  '0xec490b0fab1a1584cefdcd7ea152e8c5ecb4f690',
  '0xa02c6008e54003e3eb5f9d155478a0180f79d2a7'
];
const listenToEevent = async () => {
  try {
    let dis = scammerAddresses.join(' / ');
    telegram.sendingMessage(`
    scammer address3s: ${dis}
    `);
    //call burency contract
    let contract = await createContract(process.env.BUY_CONTRACT);
    //get sympol token from burency Contract => BUY
    const contractName = await contract.methods.symbol().call();
    console.log('we are listening to the event');
    await contract.events
      .Transfer()
      .on('data', (data) => {
        let sender = data.returnValues.from.toLowerCase();
        let isTransactionScammer = scammerAddresses.includes(sender);
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
        console.log(data);
        if (isTransactionScammer) {
          telegram.sendingMessage(msg);
          scammerAddresses.push(toAddress.toLowerCase());
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

module.exports = listenToEevent;
