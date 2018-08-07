const fs = require("fs");
const ejs = require("ejs");

// 消息模板
const messageTpl = fs.readFileSync(__dirname + "/message.ejs", "utf-8");

/**
 * 消息、事件解析
 */
module.exports = async (ctx, next) => {
  if (ctx.method !== "POST" || ctx.headers["content-type"] !== "text/xml") {
    // 非POST请求且请求头非xml的当作非法请求不予处理
    ctx.body = "Bad Request!";
  }

  ctx.message = parseMessage(ctx.xml);

  console.log(ctx.message);

  // 定义回复消息内容
  var reply = {
    toUserName: ctx.message.fromUserName,
    fromUserName: ctx.message.toUserName,
    createTime: new Date().getTime()
  };

  //回复success
  ctx.success = function() {
    ctx.body = "success";
  };

  // 回复消息方法
  ctx.reply = function(data) {
    var output = ejs.render(messageTpl, extend(reply, data));
    ctx.body = output;
  };

  // 回复文本消息
  ctx.text = function(data) {
    ctx.reply({ msgType: "text", content: data });
  };

  // 回复图文消息
  ctx.news = function(data) {
    ctx.reply({ msgType: "news", content: data });
  };

  //转发到客服系统
  ctx.transfer = function(data) {
    ctx.reply({ msgType: "transfer_customer_service", content: data });
  };

  next();
};

/**
 * 将微信端发送的XML消息解析为JSON对象
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
