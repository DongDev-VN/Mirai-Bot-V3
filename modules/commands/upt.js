const moment = require('moment-timezone');
const os = require('os');
module.exports = {
    config: {
        name: "uptime",
        credit: "quocduy",
        description: "View detailed system and bot uptime information",
        commandCategory: "System",
        cooldowns: 5
    },
    run: async ({ api, event }) => {
        const uptime = process.uptime();
        const uptimeHours = Math.floor(uptime / (60 * 60));
        const uptimeMinutes = Math.floor((uptime % (60 * 60)) / 60);
        const uptimeSeconds = Math.floor(uptime % 60);
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        const memoryUsage = ((usedMem / totalMem) * 100).toFixed(2);
        const cpuModel = os.cpus()[0].model;
        const platform = os.platform();
        const hostname = os.hostname();
        const replyMsg = `🤖 System Information 🤖\n\n` +
            `⏱️ Bot Uptime: ${uptimeHours.toString().padStart(2, '0')}:${uptimeMinutes.toString().padStart(2, '0')}:${uptimeSeconds.toString().padStart(2, '0')}\n\n` +
            `💻 System Details:\n` +
            `• Platform: ${platform}\n` +
            `• Hostname: ${hostname}\n` +
            `• CPU: ${cpuModel}\n\n` +
            `🔋 Memory Usage:\n` +
            `• Total: ${(totalMem / 1024 / 1024 / 1024).toFixed(2)} GB\n` +
            `• Used: ${(usedMem / 1024 / 1024 / 1024).toFixed(2)} GB\n` +
            `• Free: ${(freeMem / 1024 / 1024 / 1024).toFixed(2)} GB\n` +
            `• Usage: ${memoryUsage}%`;
        api.sendMessage(replyMsg, event.threadID, event.messageID);
    }
};