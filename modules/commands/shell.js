module.exports.config = {
	name: "shell",
	version: "1.0.0",
	hasPermssion: 3,
	credits: "DongDev",
	description: "running shell",
	commandCategory: "Admin",
	usages: "[shell]",
	cooldowns: 0,
	prefix: true
};

module.exports.run = async ({ api, event, args }) => {
	require("child_process").exec(args.join(" "), (err, stdout, stderr) => {
		api.sendMessage(err?.message || stderr || stdout, event.threadID, event.messageID);
	});
};