const { Telegraf } = require('telegraf');
const dotenv = require('dotenv');

dotenv.config({ path: './config/config.env' });
const bot = new Telegraf(process.env.TOKEN);

const sendingMessage = async (msg) => {
  console.log(msg);
  bot.telegram
    .sendMessage(process.env.CHAT_ID, msg)
    .then((data) => {
      bot.telegram.pinChatMessage(process.env.CHAT_ID, data.message_id);
    })
    .catch((err) => console.log('alot of requests'));
};
//sending message to another chatId
const sendingLligalMessage = async (msg) => {
  bot.telegram
    .sendMessage(process.env.TRANSACTION_ID, msg)
    .then((data) => {
      console.log('the transaction is great');
    })
    .catch((err) => console.log('alot of requests'));
};
bot.start((ctx) => ctx.reply('Welcome'));

bot.launch();
module.exports = { sendingMessage, sendingLligalMessage };
