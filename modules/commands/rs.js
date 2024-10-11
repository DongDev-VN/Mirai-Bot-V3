this.config = {
    name: "rs",
    version: "1.0.0",
    hasPermssion: 3,
    credits: "DongDev",
    description: "Khởi Động Lại Bot.",
    commandCategory: "Admin",
    cooldowns: 0,
    images: [],
 };
 this.run = ({event, api}) => api.sendMessage("✅", event.threadID, () => process.exit(1), event.messageID)