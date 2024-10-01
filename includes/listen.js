module.exports = function ({ api, models }) {
    const fs = require('fs');
    const path = require('path');
    const Users = require("./controllers/users")({ models, api });
    const Threads = require("./controllers/threads")({ models, api });
    const Currencies = require("./controllers/currencies")({ models });
    const logger = require("../utils/log.js");
    (async() => {
        try {
            logger.loader("Tiến hành tải dữ liệu người dùng và nhóm");
            const [threads, users, currencies] = await Promise.all([
                Threads.getAll(),
                Users.getAll(['userID', 'name', 'data']),
                Currencies.getAll(['userID'])
            ]);
            for (let i = 0; i < threads.length; i++) {
                const data = threads[i];
                const idThread = String(data.threadID);
                global.data.allThreadID.push(idThread);
                global.data.threadData.set(idThread, data.data || {});
                global.data.threadInfo.set(idThread, data.threadInfo || {});
                if (data.data?.banned) {
                    global.data.threadBanned.set(idThread, {
                        reason: data.data.reason || '',
                        dateAdded: data.data.dateAdded || ''
                    });
                }
                if (data.data?.commandBanned?.length) {
                    global.data.commandBanned.set(idThread, data.data.commandBanned);
                }
                if (data.data?.NSFW) {
                    global.data.threadAllowNSFW.push(idThread);
                }
            }
            for (let i = 0; i < users.length; i++) {
                const dataU = users[i];
                const idUsers = String(dataU.userID);
                global.data.allUserID.push(idUsers);
                if (dataU.name?.length) {
                    global.data.userName.set(idUsers, dataU.name);
                }
                if (dataU.data?.banned) {
                    global.data.userBanned.set(idUsers, {
                        reason: dataU.data.reason || '',
                        dateAdded: dataU.data.dateAdded || ''
                    });
                }
                if (dataU.data?.commandBanned?.length) {
                    global.data.commandBanned.set(idUsers, dataU.data.commandBanned);
                }
            }
            for (let i = 0; i < currencies.length; i++) {
                const dataC = currencies[i];
                global.data.allCurrenciesID.push(String(dataC.userID));
            }
            logger.loader(`Tải thành công dữ liệu của ${global.data.allThreadID.length} nhóm`);
            logger.loader(`Tải thành công dữ liệu của ${global.data.allUserID.length} người dùng`);
        } catch (error) {
            logger(`Tải môi trường thất bại: ${error}`, 'error');
        }
    })();
    require('./handle/handleSchedule.js')({ api, Threads, Users, models });
    logger(`${api.getCurrentUserID()} - [ ${global.config.PREFIX} ] • ${(!global.config.BOTNAME) ? "This bot was made by CatalizCS and SpermLord" : global.config.BOTNAME}`, "[ BOT INFO ] >");

    const handlers = fs.readdirSync(path.join(__dirname, './handle')).reduce((acc, file) => {
        return { ...acc, [path.basename(file, '.js')]: require(`./handle/${file}`)({ api, models, Users, Threads, Currencies }) };
    }, {});

    return async function (event) {
        await handlers['handleCreateDatabase']({ event });

        switch (event.type) {
            case "message":
                await Promise.all([
                    handlers['handleCommand']({ event }),
                    handlers['handleReply']({ event }),
                    handlers['handleCommandEvent']({ event })
                ]);
                break;
            case "message_reply":
                await handlers['handleReply']({ event });
                break;
            case "message_unsend":
                await handlers['handleCommandEvent']({ event });
                break;
            case "event":
                await handlers['handleEvent']({ event });
                break;
            case "message_reaction":
                await handlers['handleReaction']({ event });
                break;
            default:
                break;
        }
    };
};