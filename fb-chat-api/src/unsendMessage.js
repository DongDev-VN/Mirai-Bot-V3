"use strict";

var utils = require("../utils");
var log = require("npmlog");
const { generateOfflineThreadingID } = require("../utils");

module.exports = function (defaultFuncs, api, ctx) {
  function unsendMessageNoMqtt(messageID, callback) {
    var resolveFunc = function () {};
    var rejectFunc = function () {};
    var returnPromise = new Promise(function (resolve, reject) {
      resolveFunc = resolve;
      rejectFunc = reject;
    });

    if (!callback) {
      callback = function (err, friendList) {
        if (err) {
          return rejectFunc(err);
        }
        resolveFunc(friendList);
      };
    }

    var form = {
      message_id: messageID,
    };

    defaultFuncs
      .post("https://www.facebook.com/messaging/unsend_message/", ctx.jar, form)
      .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
      .then(function (resData) {
        if (resData.error) {
          throw resData;
        }

        return callback();
      })
      .catch(function (err) {
        log.error("unsendMessage", err);
        return callback(err);
      });

    return returnPromise;
  }

  function unsendMessageMqtt(messageID, threadID, callback) {
    if (!ctx.mqttClient) {
      throw new Error("Not connected to MQTT");
    }

    ctx.wsReqNumber += 1;
    ctx.wsTaskNumber += 1;

    const label = "33";

    const taskPayload = {
      message_id: messageID,
      thread_key: threadID,
      sync_group: 1,
    };

    const payload = JSON.stringify(taskPayload);
    const version = "25393437286970779";

    const task = {
      failure_count: null,
      label: label,
      payload: payload,
      queue_name: "unsend_message",
      task_id: ctx.wsTaskNumber,
    };

    const content = {
      app_id: "2220391788200892",
      payload: JSON.stringify({
        tasks: [task],
        epoch_id: parseInt(generateOfflineThreadingID()),
        version_id: version,
      }),
      request_id: ctx.wsReqNumber,
      type: 3,
    };

    // if (isCallable(callback)) {
    //   // to be implemented
    // }

    ctx.mqttClient.publish("/ls_req", JSON.stringify(content), {
      qos: 1,
      retain: false,
    });
  }

  return function unsendMessage(messageID, threadID, callback) {
    if (ctx.mqttClient) {
      try {
        unsendMessageMqtt(messageID, threadID, callback);
      } catch (e) {
        unsendMessageNoMqtt(messageID, callback);
      }
    } else unsendMessageNoMqtt(messageID, callback);
  };
};