module.exports = function ({ api, models, Users, Threads, Currencies }) {
    const logger = require("../../utils/log.js");
    
    return async function ({ event }) {
        const { allowInbox } = global.config;
        const { userBanned, threadBanned } = global.data;
        const { commands, eventRegistered } = global.client;
        const { senderID, threadID, messageID, args } = event;
        
        const senderIdStr = String(senderID);
        const threadIdStr = String(threadID);
        
        if (userBanned.has(senderIdStr) || threadBanned.has(threadIdStr) || (allowInbox && senderIdStr === threadIdStr)) return;
        
        for (const eventReg of eventRegistered) {
            const cmd = commands.get(eventReg);
            let getText2;

            if (cmd?.languages && typeof cmd.languages === 'object') {
                getText2 = (...values) => {
                    const commandModule = cmd.languages || {};
                    const langConfig = commandModule[global.config.language];
                    
                    if (!langConfig) {
                        return api.sendMessage(global.getText('handleCommand', 'notFoundLanguage', cmd.config.name), threadID, messageID);
                    }

                    let lang = langConfig[values[0]] || '';
                    for (let i = 1; i < values.length; i++) {
                        const expReg = new RegExp(`%${i}`, 'g');
                        lang = lang.replace(expReg, values[i]);
                    }
                    return lang;
                };
            } else {
                getText2 = () => {};
            }

            try {
                const Obj = {
                    event,
                    args,
                    api,
                    models,
                    Users,
                    Threads,
                    Currencies,
                    getText: getText2
                };

                if (cmd) cmd.handleEvent(Obj);
            } catch (error) {
                logger(global.getText('handleCommandEvent', 'moduleError', cmd?.config?.name), 'error');
            }
        }
    };
};