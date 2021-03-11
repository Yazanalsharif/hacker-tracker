const { bot, sendingMessage } = require('./utils/telegramBot');
const listenToEvent = require('./utils/ethereum');
const connectDb = require('./config/db');
connectDb();
bot.start(async (ctx) => {
  try {
    await listenToEvent();
    ctx.reply('the bot is working now');
  } catch (err) {
    ctx.reply(err.message);
  }
});

bot.launch().then(() => {
  console.log('the bot is working now');
});
