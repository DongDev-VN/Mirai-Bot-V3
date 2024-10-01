const fs = require('fs');
const ytdl = require('@distube/ytdl-core');
const { resolve } = require('path');
const moment = require("moment-timezone");

async function getdl(link, path) {
    var timestart = Date.now();
    if (!link) return 'Thiếu link';
    var resolveFunc = function () { };
    var rejectFunc = function () { };
    var returnPromise = new Promise(function (resolve, reject) {
        resolveFunc = resolve;
        rejectFunc = reject;
    });
    ytdl(link, {
        filter: format =>
            format.quality == 'tiny' && format.audioBitrate == 128 && format.hasAudio == true
    }).pipe(fs.createWriteStream(path))
        .on("close", async () => {
            var data = await ytdl.getInfo(link);
            var result = {
                title: data.videoDetails.title,
                dur: Number(data.videoDetails.lengthSeconds),
                viewCount: data.videoDetails.viewCount,
                likes: data.videoDetails.likes,
                uploadDate: data.videoDetails.uploadDate,
                sub: data.videoDetails.author.subscriber_count,
                author: data.videoDetails.author.name,
                timestart: timestart
            };
            resolveFunc(result);
        });
    return returnPromise;
}

module.exports.config = {
    name: "sing",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "D-Jukie",
    description: "Phát nhạc thông qua từ khoá tìm kiếm trên YouTube",
    commandCategory: "Tiện ích",
    usages: "[searchMusic]",
    cooldowns: 0,
    prefix: true,
};

module.exports.handleReply = async function ({ api, event, handleReply }) {
    const axios = require('axios');
    const { createReadStream, unlinkSync, statSync } = require("fs-extra");
    const id = handleReply.link[event.body - 1];
   try {
        var path = `${__dirname}/cache/sing-${event.senderID}.mp3`;
        var data = await getdl(`https://www.youtube.com/watch?v=${id}`, path);      
   if (fs.statSync(path).size > 26214400) {
            return api.sendMessage('❎ File quá lớn, vui lòng chọn bài khác!', event.threadID, () => fs.unlinkSync(path), event.messageID);
        }
    api.unsendMessage(handleReply.messageID);
        return api.sendMessage({
            body: `[ Âm Nhạc Từ YouTube ]\n──────────────────\n|› 🎬 Title: ${data.title}\n|› ⏱️ Thời lượng: ${convertHMS(data.dur)} giây\n|› 🗓️ Ngày tải lên: ${data.uploadDate}\n|› 👤 Tên kênh: ${data.author} (${data.sub})\n|› 🌐 Lượt xem: ${data.viewCount}\n|› ⏳ Thời gian xử lý: ${Math.floor((Date.now() - data.timestart) / 1000)} giây\n──────────────────\n|› ⏰ Time: ${moment.tz("Asia/Ho_Chi_Minh").format("HH:mm:ss | DD/MM/YYYY")}`,
            attachment: createReadStream(path)
        }, event.threadID, () => fs.unlinkSync(path), event.messageID);

    } catch (e) {
        console.log(e);
      }
};

function convertHMS(value) {
    const sec = parseInt(value, 10); 
    let hours   = Math.floor(sec / 3600);
    let minutes = Math.floor((sec - (hours * 3600)) / 60); 
    let seconds = sec - (hours * 3600) - (minutes * 60); 
    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return (hours != '00' ? hours +':': '') + minutes+':'+seconds;
}

module.exports.run = async function ({ api, event, args }) {
    if (args.length == 0 || !args) return api.sendMessage('❎ Phần tìm kiếm không được để trống!', event.threadID, event.messageID);
    const keywordSearch = args.join(" ");
    const path = `${__dirname}/cache/sing-${event.senderID}.mp3`;
    if (fs.existsSync(path)) {
        fs.unlinkSync(path);
    }
    try {
        const link = [];
        const Youtube = require('youtube-search-api');
        const data = (await Youtube.GetListByKeyword(keywordSearch, false, 8)).items;
        const msg = data.map((value, index) => {
            link.push(value.id);
            return `|› ${index + 1}. ${value.title}\n|› 👤 Kênh: ${value.channelTitle}\n|› ⏱️ Thời lượng: ${value.length.simpleText}\n──────────────────`;
        }).join('\n');
        return api.sendMessage(`📝 Có ${link.length} kết quả trùng với từ khóa tìm kiếm của bạn:\n──────────────────\n${msg}\n\n📌 Reply (phản hồi) STT để tải nhạc`, event.threadID, (error, info) => global.client.handleReply.push({
            type: 'reply',
            name: this.config.name,
            messageID: info.messageID,
            author: event.senderID,
            link
        }), event.messageID);
    } catch (e) {
        return api.sendMessage('❎ Đã xảy ra lỗi, vui lòng thử lại sau!\n' + e, event.threadID, event.messageID);
    }
};