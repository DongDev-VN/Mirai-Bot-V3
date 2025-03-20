module.exports = {
    config: {
        name: "uid",
        version: "1.0.0",
        hasPermssion: 0,
        credits: "Mirai Team",
        description: "Lấy ID người dùng.",
        commandCategory: "Công cụ",
        cooldowns: 0,
        images: []
    },
    run: async function({ api, event, args }) {
        if (event.type === "message_reply") {
            const uid = event.messageReply.senderID;
            return api.sendMessage(`${uid}`, event.threadID, event.messageID);
        }
        if (!args[0]) {
            return api.sendMessage(`${event.senderID}`, event.threadID, event.messageID);
        } else {
            if (args[0].includes(".com/")) {
                try {
                    const res_ID = await api.getUID(args[0]);
                    return api.sendMessage(`${res_ID}`, event.threadID, event.messageID);
                } catch (error) {
                    return api.sendMessage(`❌ Không thể lấy UID từ đường dẫn này!`, event.threadID, event.messageID);
                }
            } else {
                for (const [key, value] of Object.entries(event.mentions)) {
                    api.sendMessage(`${value.replace('@', '')}: ${key}`, event.threadID);
                }
                return;
            }
        }
    },
    handleEvent: async ({ api, event, args }) => {
        if (!event.body) return;

        const bodyLower = event.body.toLowerCase();
        if (bodyLower === "uid") {
            await module.exports.run({ api, event, args: [] });
        }
    }
};