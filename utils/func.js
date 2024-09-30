const crypto = require('crypto');
const os = require("os");
const { createWriteStream } = require('fs');
const axios = require('axios');

const utils = {
    throwError: function (command, threadID, messageID) {
        const threadSetting = global.data.threadData.get(parseInt(threadID)) || {};
        return global.client.api.sendMessage(global.getText("utils", "throwError", ((threadSetting.hasOwnProperty("PREFIX")) ? threadSetting.PREFIX : global.config.PREFIX), command), threadID, messageID);
    },

    parseCookies: function(cookies) {
        return (cookies.includes('useragent=') ? cookies.split('useragent=')[0] : cookies).split(';').map(pair => {
            const [key, value] = pair.trim().split('=');
            return value !== undefined ? {
                key,
                value,
                domain: "facebook.com",
                path: "/",
                hostOnly: false,
                creation: new Date().toISOString(),
                lastAccessed: new Date().toISOString()
            } : undefined;
        }).filter(Boolean);
    },

    cleanAnilistHTML: function (text) {
        return text
            .replace('<br>', '\n')
            .replace(/<\/?(i|em)>/g, '*')
            .replace(/<\/?b>/g, '**')
            .replace(/~!|!~/g, '||')
            .replace("&amp;", "&")
            .replace("&lt;", "<")
            .replace("&gt;", ">")
            .replace("&quot;", '"')
            .replace("&#039;", "'");
    },

    downloadFile: async function (url, path) {
        const response = await axios({
            method: 'GET',
            responseType: 'stream',
            url
        });

        const writer = createWriteStream(path);

        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    },

    getContent: async function(url) {
        try {
            const response = await axios({
                method: 'GET',
                url
            });

            return response;
        } catch (e) {
            console.log(e);
        }
    },

    randomString: function (length) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        var charactersLength = characters.length || 5;
        for (var i = 0; i < length; i++) result += characters.charAt(Math.floor(Math.random() * charactersLength));
        return result;
    },

    AES: {
        encrypt (cryptKey, crpytIv, plainData) {
            var encipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(cryptKey), Buffer.from(crpytIv));
            var encrypted = encipher.update(plainData);
            encrypted = Buffer.concat([encrypted, encipher.final()]);
            return encrypted.toString('hex');
        },
        decrypt (cryptKey, cryptIv, encrypted) {
            encrypted = Buffer.from(encrypted, "hex");
            var decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(cryptKey), Buffer.from(cryptIv, 'binary'));
            var decrypted = decipher.update(encrypted);

            decrypted = Buffer.concat([decrypted, decipher.final()]);

            return String(decrypted);
        },
        makeIv () { return Buffer.from(crypto.randomBytes(16)).toString('hex').slice(0, 16); }
    },

    homeDir: function () {
        var returnHome, typeSystem;
        const home = process.env["HOME"];
        const user = process.env["LOGNAME"] || process.env["USER"] || process.env["LNAME"] || process.env["USERNAME"];

        switch (process.platform) {
            case "win32": {
                returnHome = process.env.USERPROFILE || process.env.HOMEDRIVE + process.env.HOMEPATH || home || null;
                typeSystem = "win32"
                break;
            }
            case "darwin": {
                returnHome = home || (user ? '/Users/' + user : null);
                typeSystem = "darwin";
                break;
            }
            case "linux": {
                returnHome = home || (process.getuid() === 0 ? '/root' : (user ? '/home/' + user : null));
                typeSystem = "linux"
                break;
            }
            default: {
                returnHome = home || null;
                typeSystem = "unknow"
                break;
            }
        }

        return [typeof os.homedir === 'function' ? os.homedir() : returnHome, typeSystem];
    }
};

module.exports = utils;