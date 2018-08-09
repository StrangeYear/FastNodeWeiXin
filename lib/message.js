const fs = require("fs");
const ejs = require("ejs");

// 消息模板
const messageTpl = fs.readFileSync(__dirname + "/message.ejs", "utf-8");

/**
 * 消息、事件解析
 */
module.exports = async (ctx, next) => {
  console.log(">>>>>>>>>>消息拦截中间件开始<<<<<<<<<<");
  if (ctx.method !== "POST" || ctx.headers["content-type"] !== "text/xml") {
    // 非POST请求且请求头非xml的当作非法请求不予处理
    ctx.body = "Bad Request!";
    return;
  }

  ctx.wx = parseMessage(ctx.xml);

  /**
   * 定义回复消息内容
   */
  var reply = {
    toUserName: ctx.wx.fromUserName,
    fromUserName: ctx.wx.toUserName,
    createTime: new Date().getTime()
  };

  // 回复消息方法
  ctx.reply = function(data) {
    var output = ejs.render(messageTpl, extend(reply, data));
    ctx.body = output;
  };

  /**
   * 回复文本消息
   * @param {Object} data
   */
  ctx.text = function(data) {
    ctx.reply({
      msgType: "text",
      content: data
    });
  };

  /**
   * 回复图文消息
   * @param {Object} data
   */
  ctx.news = function(data) {
    ctx.reply({
      msgType: "news",
      content: data
    });
  };

  /**
   *  回复音乐消息
   * @param {Object} data
   */
  ctx.music = function(data) {
    ctx.reply({
      msgType: "music",
      content: data
    });
  };

  /**
   * 回复语音消息
   * @param {Object} data
   */
  ctx.voice = function(data) {
    ctx.reply({
      msgType: "voice",
      content: data
    });
  };

  /**
   * 回复图片消息
   * @param {Object} data
   */
  ctx.image = function(data) {
    ctx.reply({
      msgType: "image",
      content: data
    });
  };

  /**
   * 回复视频消息
   * @param {Object} data
   */
  ctx.video = function(data) {
    ctx.reply({
      msgType: "video",
      content: data
    });
  };

  /**
   * 默认的一个回复
   */
  ctx.success = function() {
    ctx.body = "success";
  };

  /**
   * 转发到客服系统
   */
  ctx.transfer = function() {
    ctx.reply({
      msgType: "transfer_customer_service"
    });
  };

  await next();
  console.log(">>>>>>>>>>消息拦截中间件结束<<<<<<<<<<");
};

/**
 * 将koa2插件转化的xml内容的单个数组值转为普通值，转为驼峰命名
 *
 * @param message
 * @returns {{}}
 */
function parseMessage(message) {
  var result = {};
  for (let key in message.xml) {
    const value = message.xml[key][0];
    key = key.substring(0, 1).toLowerCase() + key.substring(1);
    result[key] = value;
  }

  return result;
}

/**
 * 类扩展工具函数
 *
 * @param obj
 * @param obj2
 * @returns {*}
 */
function extend(obj, obj2) {
  for (var key in obj2) {
    if (obj2.hasOwnProperty(key)) {
      obj[key] = obj2[key];
    }
  }

  return obj;
}
