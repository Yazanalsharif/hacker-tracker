const { Telegraf } = require('telegraf');
const dotenv = require('dotenv');

dotenv.config({ path: './config/config.env' });
const bot = new Telegraf(process.env.TOKEN);

const sendingMessage = async (msg) => {
  bot.telegram
    .sendMessage(process.env.CHAT_ID, msg)
    .then(() => {
      console.log('the message is sent');
    })
    .catch((err) => console.log('alot of requests'));
};
bot.start((ctx) => ctx.reply('Welcome'));

bot.launch();
module.exports = { sendingMessage };
