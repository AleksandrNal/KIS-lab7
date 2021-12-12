const axios = require("axios");
const fs = require("fs");
const { VK, Attachment, DocumentAttachment } = require("vk-io");
const { Telegraf } = require("telegraf");
var needle = require("needle");
const mongoose = require("mongoose");
const Message = require("./message");

const mongoUri =
  "mongodb+srv://lab7:123@cluster0.swarw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

const bot = new Telegraf("5044857735:AAF2WxOFiJuzzSTp_k4OEZpZEmD5AwnP9Os");

bot.command("/export", async (ctx) => {
  var get = await Message.find();

  var buf = Buffer.from(JSON.stringify(get));

  ctx.replyWithDocument({ source: buf, filename: "export.json" });
});

bot.command("/showHistory", async (ctx) => {
  var get = await Message.find();

  var toShow = "";
  get.forEach((item) => {
    toShow += `time: ${item.date}, message: ${item.text} \n`;
  });
  await ctx.reply(toShow);
  //ctx.replyWithDocument({ source: buf, filename: "export.json" });
});

bot.on("text", async (context) => {
  //await context.reply(context.update.message.text);

  var messageToDB = new Message({
    messageId: context.update.message.message_id,
    from: "tg",
    text: context.update.message.text,
    date: new Date(),
  });

  console.log("tg", messageToDB);

  await messageToDB.save();

  await vk.api.messages.send({
    peer_id: 145574490,
    random_id: 0,
    message: context.update.message.text,
  });
});

const vk = new VK({
  token:
    "e20b41306867488cdfdcfedbd94251e65ddbb810e246f1a68591f143b6854afa5a6dacb51dd3dfefa9223",
});

// #region VKAPI
vk.updates.on("message_new", async (context) => {
  if (context.text === "/export") {
    var get = await Message.find();

    var buf = Buffer.from(JSON.stringify(get));

    context.sendDocuments({ value: buf, filename: "export.json" });
    return;
  }

  if (context.text === "/showHistory") {
    var get = await Message.find();

    var toShow = "";
    get.forEach((item) => {
      toShow += `time: ${item.date}, message: ${item.text} \n`;
    });
    context.send(toShow);
    return;
  }

  var messageToDB = new Message({
    messageId: context.id,
    from: "vk",
    text: context.text,
    date: new Date(),
  });

  console.log("vk", messageToDB);
  await messageToDB.save();

  bot.telegram.sendMessage(5020728452, context.text);
});

async function startTG(start) {
  await bot.launch();
  console.log(start);
}
async function startVK(start) {
  await vk.updates.start();
  console.log(start);
}
// #endregion VKAPI

async function start() {
  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (e) {
    console.log("Server error", e.message);
    process.exit(1);
  }
}

start();

startVK("VKBOT STARTED");
startTG("TGBOT STARTED");
