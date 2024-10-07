const axios = require("axios");
const moment = require("moment-timezone");

module.exports.config = {
  name: "prefix",
  version: "2.0.0",
  hasPermission: 0,
  credits: "DongDev",
  description: "prefix bot",
  commandCategory: "Hệ thống",
  usages: "[]",
  cooldowns: 0
};

module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, body } = event;
  const { PREFIX } = global.config;
  const gio = moment.tz("Asia/Ho_Chi_Minh").format("HH:mm:ss || DD/MM/YYYY");

  let threadSetting = global.data.threadData.get(threadID) || {};
  let prefix = threadSetting.PREFIX || PREFIX;

  if (
    body.toLowerCase() === "prefix" ||
    body.toLowerCase() === "prefix bot là gì" ||
    body.toLowerCase() === "quên prefix r" ||
    body.toLowerCase() === "dùng sao"
  ) {
    api.sendMessage(
      `✏️ Prefix của nhóm: ${prefix}\n📎 Prefix hệ thống: ${global.config.PREFIX}\n📝 Tổng có: ${
        client.commands.size
      } lệnh\n👥 Tổng người dùng bot: ${
        global.data.allUserID.length
      }\n🏘️ Tổng nhóm: ${global.data.allThreadID.length}\n────────────────\n⏰ ${gio}`,
      event.threadID,
      event.messageID
    );
  }
};

module.exports.run = async function () {};
