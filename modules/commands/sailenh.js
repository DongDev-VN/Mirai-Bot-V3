const axios = require('axios');

this.config = {
    name: "",
    version: "1.0.0",
    hasPermission: 0,
    credits: "DC-Nam",
    description: "gái ",
    commandCategory: "Ảnh",
    usages: "",
    cooldowns: 0
};

global.queuesabc = [];

async function down(url) {
    try {
        const response = await axios({
            url: url,
            responseType: 'stream',
        });
        return response.data;
    } catch (error) {
        console.error("Error downloading the file:", error);
        throw error;
    }
}

this.onLoad = async function (o) {
    let status = false;
    const api_url = 'http://dongdev.click/api/vdgai';
    if (!global.mmccffjjs) {
        global.mmccffjjs = setInterval(async () => {
            if (status || global.queuesabc.length > 5) return;
            status = true;

            try {
                const results = await Promise.all([...Array(5)].map(async () => {
                    const response = await axios.get(api_url);
                    return await upload(o, response.data.url);
                }));
                console.log(results);
                global.queuesabc.push(...results);
            } catch (error) {
                console.error("Error fetching data from API:", error);
            } finally {
                status = false;
            }
        }, 1000 * 5);
    }
};

async function upload(o, url) {
    try {
        const form = {
            upload_1024: await down(url),
        };
        const response = await o.api.postFormData('https://upload.facebook.com/ajax/mercury/upload.php', form);
        const metadata = JSON.parse(response.body.replace('for (;;);', '')).payload?.metadata?.[0];
        return metadata ? Object.entries(metadata)[0] : null;
    } catch (error) {
        console.error("Error uploading:", error);
        throw error;
    }
}

this.run = async function (o) {
    try {
        const msg = {
            body: '🍑',
            attachment: global.queuesabc.splice(0, 1),
        };
        await o.api.sendMessage(msg, o.event.threadID, null, o.event.messageID);
    } catch (error) {
        console.error("Error sending message:", error);
    }
}