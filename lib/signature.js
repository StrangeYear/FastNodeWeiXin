const crypto = require("crypto");

module.exports = async (apptoken, ctx, next) => {
  console.log(">>>>>>>>>>签名拦截中间件开始<<<<<<<<<<");
  if (!ctx.query.signature) {
    ctx.body = "Access Denied!";
    return;
  }

  var tmp = [apptoken, ctx.query.timestamp, ctx.query.nonce].sort().join("");

  var signature = crypto
    .createHash("sha1")
    .update(tmp)
    .digest("hex");

  if (ctx.query.signature != signature) {
    ctx.body = "Auth failed!";
    return;
  }

  if (ctx.query.echostr) {
    ctx.body = ctx.query.echostr;
    return;
  }

  await next();
  console.log(">>>>>>>>>>签名拦截中间件结束<<<<<<<<<<");
};
