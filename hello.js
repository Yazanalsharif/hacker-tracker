const mongoose = require('mongoose');
const dotenv = require('dotenv');

//load dotenv variables
dotenv.config({ path: `./config/config.env` });

//create a connection with db
mongoose.connect(process.env.MONGO_URI, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useFindAndModify: false,
  useCreateIndex: true
});

const Scammer = require('./models/scammer.js');
let scammerAddresses = [
  { scammer: '0x80c67a1d2a5ffc9281c38dedc9ed82aa5481fd18' },
  { scammer: '0xe90fb1b76f88e91024f8cf58b78901af2ee7b5cd' },
  { scammer: '0xfd4120d697b48a806c8a30284a54ebc7df3c7bf3' },
  { scammer: '0xec490b0fab1a1584cefdcd7ea152e8c5ecb4f690' },
  { scammer: '0xa02c6008e54003e3eb5f9d155478a0180f79d2a7' }
];
//import data from json files
const importdata = async () => {
  try {
    await Scammer.create(scammerAddresses);
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

importdata();
