const axios = require('axios');

this.config = {
    name: "help",
    version: "1.1.1",
    hasPermssion: 0,
    credits: "DC-Nam",
    description: "Xem danh sách lệnh và info",
    commandCategory: "Box chat",
    usages: "[tên lệnh/all]",
    cooldowns: 5,
    images: [],
};

this.run = async function({ api, event, args }) {
    const { threadID: tid, messageID: mid, senderID: sid } = event;
    var type = !args[0] ? "" : args[0].toLowerCase();
    var msg = "", array = [], i = 0;
    const cmds = global.client.commands;
    const TIDdata = global.data.threadData.get(tid) || {};
    const admin = global.config.ADMINBOT;
    const NameBot = global.config.BOTNAME;
    const version = this.config.version;
    var prefix = TIDdata.PREFIX || global.config.PREFIX;

    if (type == "all") {
        for (const cmd of cmds.values()) {
            msg += `${++i}. ${cmd.config.name}\n→ Mô tả: ${cmd.config.description}\n────────────────\n`;
        }
        return api.sendMessage(msg, tid, mid);
    }

    if (type) {
        for (const cmd of cmds.values()) {
            array.push(cmd.config.name.toString());
        }
        if (!array.find(n => n == args[0].toLowerCase())) {
            const stringSimilarity = require('string-similarity');
            commandName = args.shift().toLowerCase() || "";
            var allCommandName = [];
            const commandValues = Object.keys(cmds);
            for (const cmd of commandValues) allCommandName.push(cmd);
            const checker = stringSimilarity.findBestMatch(commandName, allCommandName);
            if (checker.bestMatch.rating >= 0.5) command = global.client.commands.get(checker.bestMatch.target);
            msg = `❎ Không tìm thấy lệnh '${type}' trong hệ thống.\n📝 Lệnh gần giống được tìm thấy '${checker.bestMatch.target}'`;
            return api.sendMessage(msg, tid, mid);
        }
        const cmd = cmds.get(type).config;
        const img = cmd.images;
        let image = [];
        for (let i = 0; i < img.length; i++) {
            const a = img[i];
            const stream = (await axios.get(a, {
                responseType: "stream"
            })).data;
            image.push(stream);
        }
        msg = `[ HƯỚNG DẪN SỬ DỤNG ]\n─────────────────\n[📜] - Tên lệnh: ${cmd.name}\n[👤] - Tác giả: ${cmd.credits}\n[🌾] - Phiên bản: ${cmd.version}\n[🌴] - Quyền Hạn: ${TextPr(cmd.hasPermssion)}\n[📝] - Mô Tả: ${cmd.description}\n[🏷️] - Nhóm: ${cmd.commandCategory}\n[🍁] - Cách Dùng: ${cmd.usages}\n[⏳] - Thời Gian Chờ: ${cmd.cooldowns}s\n─────────────────\n📌 Hướng Dẫn Sử Dụng Cho Người Mới`;
        return api.sendMessage({ body: msg, attachment: image }, tid, mid);
    } else {
        CmdCategory();
        array.sort(S("nameModule"));
        for (const cmd of array) {
            msg += `│\n│ ${cmd.cmdCategory.toUpperCase()}\n├────────⭔\n│ Tổng lệnh: ${cmd.nameModule.length} lệnh\n│ ${cmd.nameModule.join(", ")}\n├────────⭔\n`;
        }
        msg += `📝 Tổng số lệnh: ${cmds.size} lệnh\n👤 Tổng số admin bot: ${admin.length}\n→ Tên Bot: ${NameBot}\n🔰 Phiên bản: ${version}\n→ Admin: Phạm Minh Đồng\n📎 Link: ${global.config.FACEBOOK_ADMIN}\n${prefix}help + tên lệnh để xem chi tiết\n${prefix}help + all để xem tất cả lệnh`;
        return api.sendMessage(`╭─────────────⭓\n${msg}`, tid);
    }

    function CmdCategory() {
        for (const cmd of cmds.values()) {
            const {
                commandCategory,
                hasPermssion,
                name: nameModule
            } = cmd.config;
            if (!array.find(i => i.cmdCategory == commandCategory)) {
                array.push({
                    cmdCategory: commandCategory,
                    permission: hasPermssion,
                    nameModule: [nameModule]
                });
            } else {
                const find = array.find(i => i.cmdCategory == commandCategory);
                find.nameModule.push(nameModule);
            }
        }
    }
};

function S(k) {
    return function(a, b) {
        let i = 0;
        if (a[k].length > b[k].length) {
            i = 1;
        } else if (a[k].length < b[k].length) {
            i = -1;
        }
        return i * -1;
    };
}

function TextPr(permission) {
    p = permission;
    return p == 0 ? "Thành Viên" : p == 1 ? "Quản Trị Viên" : p == 2 ? "Admin Bot" : "Toàn Quyền";
}