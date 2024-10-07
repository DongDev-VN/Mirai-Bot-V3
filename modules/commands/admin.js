const fs = require('fs');

module.exports.config = {
  name: "admin",
  version: "1.0.0",
  hasPermssion: 1,
  credits: "quocduy & AI",
  description: "Manage admins",
  commandCategory: "Admin",
  usages: "admin list/add/remove [userID]",
  cooldowns: 2,
  dependencies: {
    "fs-extra": ""
  }
};

module.exports.run = async function({ api, event, args }) {
  const configPath = './config.json';

  // Load the config file
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  // Get the list of admins
  const admins = config.NDH || [];

  // Handle different subcommands
  switch (args[0]) {
    case "list": 
      if (admins.length === 0) {
        api.sendMessage("There are no admins.", event.threadID, event.messageID);
      } else {
        const adminList = admins.map(admin => `- ${admin}`).join('\n');
        api.sendMessage(`Admins:\n${adminList}`, event.threadID, event.messageID);
      }
      break;

    case "add":
      const newAdminID = args[1];
      if (!newAdminID) {
        api.sendMessage("Please provide a user ID to add as an admin.", event.threadID, event.messageID);
        return;
      }
      if (admins.includes(newAdminID)) {
        api.sendMessage("This user is already an admin.", event.threadID, event.messageID);
        return;
      }
      admins.push(newAdminID);
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      api.sendMessage(`Added ${newAdminID} as an admin.`, event.threadID, event.messageID);
      break;

    case "remove":
      const adminToRemoveID = args[1];
      if (!adminToRemoveID) {
        api.sendMessage("Please provide a user ID to remove from admins.", event.threadID, event.messageID);
        return;
      }
      if (!admins.includes(adminToRemoveID)) {
        api.sendMessage("This user is not an admin.", event.threadID, event.messageID);
        return;
      }
      const adminIndex = admins.indexOf(adminToRemoveID);
      admins.splice(adminIndex, 1);
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      api.sendMessage(`Removed ${adminToRemoveID} from admins.`, event.threadID, event.messageID);
      break;

    default:
      api.sendMessage("Invalid subcommand. Usage: admin list/add/remove [userID]", event.threadID, event.messageID);
      break;
  }
};