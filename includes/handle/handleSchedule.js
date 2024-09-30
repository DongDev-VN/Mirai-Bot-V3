const cron = require('node-cron');
const fs = require('fs');
const moment = require('moment-timezone');
const path = require('path');
const axios = require('axios');
const logger = require('../../utils/log');

module.exports = function ({ api, Threads, Users }) {
  cron.schedule('*/10 * * * *', async () => {
    const cc = path.join(__dirname, '..', '..', 'utils', 'data', 'check_data.json');
    const currentTime = moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss');
    let lastRunTime = null;
    if (fs.existsSync(cc)) {
        const { datetime } = JSON.parse(fs.readFileSync(cc, 'utf-8'));
        lastRunTime = datetime;
    }
    if (!lastRunTime || moment(currentTime).diff(moment(lastRunTime), 'minutes') >= 10) {
        const groupList = (await api.getThreadList(100, null, ['INBOX'])).filter(group => group.isSubscribed && group.isGroup);
        for (const { threadID } of groupList) {
            await Threads.setData(threadID, { threadInfo: await api.getThreadInfo(threadID) });
        }
        fs.writeFileSync(cc, JSON.stringify({ datetime: currentTime }));
        logger(`Tự động cập nhật data của ${groupList.length} box`, '[ DATA ] >');
    }
  });
}