const moment = require('moment-timezone');

module.exports = {
    config: {
        name: "uptime",
        credit: "quocduy",
        description: "View the uptime of the bot",
        commandCategory: "System",
        cooldowns: 5
    },
    run: async ({ api, event }) => {
        const uptime = process.uptime();
        const uptimeHours = Math.floor(uptime / (60 * 60));
        const uptimeMinutes = Math.floor((uptime % (60 * 60)) / 60);
        const uptimeSeconds = Math.floor(uptime % 60);

        const replyMsg = `⏱️ Bot uptime: ${uptimeHours.toString().padStart(2, '0')}:${uptimeMinutes.toString().padStart(2, '0')}:${uptimeSeconds.toString().padStart(2, '0')}`;

        api.sendMessage(replyMsg, event.threadID, event.messageID);
    }
};