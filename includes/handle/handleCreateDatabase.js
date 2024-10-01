module.exports = function ({ Users, Threads, Currencies }) {
    const logger = require(process.cwd() + "/utils/log.js");

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    return async function ({ event }) {
        const { allUserID, allCurrenciesID, allThreadID, userName, threadInfo } = global.data;
        const { autoCreateDB } = global.config;
        if (!autoCreateDB) return;

        let { senderID, threadID } = event;
        senderID = String(senderID);
        threadID = String(threadID);

        try {
            const threadExists = await Threads.getData(threadID);

            if (event.isGroup && !threadExists) {
                const threadIn4 = await Threads.getInfo(threadID);
                const dataThread = {
                    threadID: threadIn4.threadID,
                    threadName: threadIn4.threadName,
                    participantIDs: threadIn4.participantIDs,
                    userInfo: threadIn4.userInfo,
                    unreadCount: 0,
                    messageCount: 0,
                    timestamp: Date.now().toString(),
                    muteUntil: null,
                    isGroup: threadIn4.isGroup,
                    isSubscribed: true,
                    isArchived: false,
                    folder: "INBOX",
                    cannotReplyReason: null,
                    eventReminders: [],
                    emoji: threadIn4.emoji,
                    color: threadIn4.color,
                    threadTheme: {
                        id: threadIn4?.threadTheme?.id || "",
                        accessibility_label: threadIn4?.threadTheme?.accessibility_label || ""
                    },
                    nicknames: threadIn4.nicknames,
                    adminIDs: threadIn4.adminIDs,
                    approvalMode: threadIn4.approvalMode,
                    approvalQueue: [],
                    reactionsMuteMode: "reactions_not_muted",
                    mentionsMuteMode: "mentions_not_muted",
                    isPinProtected: false,
                    relatedPageThread: null,
                    snippet: "",
                    snippetSender: "",
                    snippetAttachments: [],
                    serverTimestamp: Date.now().toString(),
                    imageSrc: threadIn4.imageSrc || "",
                    isCanonicalUser: false,
                    isCanonical: false,
                    recipientsLoadable: true,
                    hasEmailParticipant: false,
                    readOnly: false,
                    canReply: true,
                    lastMessageType: "message",
                    lastReadTimestamp: Date.now().toString(),
                    threadType: 2,
                    inviteLink: threadIn4.inviteLink
                };

                allThreadID.push(threadID);
                threadInfo.set(threadID, dataThread);

                await Threads.setData(threadID, { threadInfo: dataThread, data: {} });

                for (const singleData of threadIn4.userInfo) {
                    if (singleData.gender !== undefined) {
                        userName.set(String(singleData.id), singleData.name);
                        if (!allUserID.includes(String(singleData.id)) || !userName.has(String(singleData.id)) || !(await Users.getData(singleData.id))) {
                            await Users.createData(singleData.id, {
                                name: singleData.name,
                                gender: singleData.gender
                            });
                            allUserID.push(String(singleData.id));
                            logger(`Người dùng mới: ${singleData.id} | ${singleData.name}`, '[ DATABASE ] >');
                            await sleep(500);
                        }
                    }
                }

                logger(`Nhóm mới: ${threadID} | ${threadIn4.threadName}`, '[ DATABASE ] >');
            }

            const userExists = await Users.getData(senderID);

            if (!userExists) {
                const infoUsers = await Users.getInfo(senderID);
                const setting3 = {
                    name: infoUsers.name,
                    gender: infoUsers.gender
                };
                await Users.createData(senderID, setting3);
                allUserID.push(senderID);
                userName.set(senderID, infoUsers.name);
                logger(`Người dùng mới: ${senderID} | ${infoUsers.name}`, '[ DATABASE ] >');
                await sleep(500);
            }

            if (!allCurrenciesID.includes(senderID)) {
                const setting4 = {
                    data: {}
                };
                await Currencies.createData(senderID, setting4);
                allCurrenciesID.push(senderID);
                await sleep(500);
            }

            return;
        } catch (err) {
            console.log(err);
        }
    };
};