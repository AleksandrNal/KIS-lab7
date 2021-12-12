const { Schema, model } = require("mongoose");

const schema = new Schema({
  messageId: { type: Number },
  from: { type: String, enum: ["vk", "tg"] },
  text: { type: String },
  date: { type: Date },
});

module.exports = model("Message", schema);
