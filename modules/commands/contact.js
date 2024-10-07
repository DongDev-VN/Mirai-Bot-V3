this.config = {
    name: "contact",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "DongDev",
    description: "Contact thành viên trong nhóm",
    commandCategory: "Công Cụ",
    usages: "",
    cooldowns: 5,
    prefix: false
  };
  
  this.run = async ({ api: { shareContact }, event: { threadID, messageReply, senderID, mentions, type }, args }) => {
    let id = Object.keys(mentions).length > 0 ? Object.keys(mentions)[0].replace(/\&mibextid=ZbWKwL/g, '') : args[0] !== undefined ? isNaN(args[0]) ? await global.utils.getUID(args[0]) : args[0] : senderID;
    if (type === "message_reply") id = messageReply.senderID;
    shareContact("", id, threadID);
  };