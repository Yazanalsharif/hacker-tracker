const mongoose = require('mongoose');
const chalk = require('chalk');
const dotenv = require('dotenv');
dotenv.config({ path: './config/config.env' });

const connection = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true
  });

  console.log(
    chalk.italic.underline.cyan(
      `the database connect on: ${conn.connection.host}`
    )
  );
};

module.exports = connection;
