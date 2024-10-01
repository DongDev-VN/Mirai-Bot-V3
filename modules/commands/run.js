this.config = {
  name: "run",
  version: "1.0.2",
  hasPermssion: 3,
  credits: "Quất",
  description: "running shell",
  commandCategory: "Hệ thống",
  usages: "[Script]",
  cooldowns: 5,
  prefix: true
}

this.run = async (o) => {
  const s = async (a) => {
    if (typeof a === "object" || Array.isArray(a)) {
      if (Object.keys(a).length !== 0)
        a = JSON.stringify(a, null, 4);
      else
        a = "";
    }
    if (typeof a === "number")
      a = a.toString();
    await o.api.sendMessage(a, o.event.threadID, o.event.messageID);
  };
  const { log } = console;
  try {
    const result = await require("eval")(o.args.join(" "), { s, o, log }, true);
    await s(result);
  } catch (e) {
    const errorMessage = `[ Lỗi ] ${e.message}\n[ Dịch ] ${(await require('axios').get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=vi&dt=t&q=${encodeURIComponent(e.message)}`)).data[0][0][0]}`;
    await s(errorMessage);
  }
}