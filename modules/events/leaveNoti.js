const handleRefresh = require("../../includes/handle/handleRefresh.js"); 
module.exports.config = {
    name: "leaveNoti",
    eventType: ["log:unsubscribe"],
    version: "1.0.1",
    credits: "Ranz",
    description: "Thông báo khi người dùng rời khỏi nhóm có random gif/ảnh/video",
    dependencies: {
        "fs-extra": "",
        "path": ""
    }
};

module.exports.onLoad = function () {
    const { existsSync, mkdirSync } = require("fs-extra");
    const { join } = require("path");

    const path = join(__dirname, "cache", "leaveGif");
    if (!existsSync(path)) mkdirSync(path, { recursive: true });

    const path2 = join(__dirname, "cache", "leaveGif", "randomgif");
    if (!existsSync(path2)) mkdirSync(path2, { recursive: true });

    return;
};
module.exports.run = async function ({ api, event, Users, Threads }) {
    try {
        const { threadID } = event;
        const iduser = event.logMessageData.leftParticipantFbId;
        if (iduser == api.getCurrentUserID()) return;
        const moment = require("moment-timezone");
        const time = moment.tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY || HH:mm:ss");
        const threadDataCache = global.data.threadData.get(parseInt(threadID));
        const data = threadDataCache || (await Threads.getData(threadID)).data;
        const userData = await Users.getData(event.author);
        const nameAuthor = userData.name || "";
        const name = global.data.userName.get(iduser) || await Users.getNameUser(iduser);

        const type = (event.author == iduser) ? "đã tự rời khỏi nhóm" : `đã bị ${nameAuthor} kick khỏi nhóm`;

        var msg = data.customLeave || "{name} {type}\n\nLink FB ⬇️\nhttps://www.facebook.com/profile.php?id={iduser}";
        msg = msg.replace(/\{name}/g, name)
                 .replace(/\{type}/g, type)
                 .replace(/\{iduser}/g, iduser)
                 .replace(/\{author}/g, nameAuthor)
                 .replace(/\{time}/g, time);
        return new Promise((resolve, reject) => {
            api.sendMessage(msg, threadID, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    } catch (e) {
        console.log(e);
    }
};
