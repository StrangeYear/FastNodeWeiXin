const message = require("./message");
const crypto = require("crypto");

class FastNodeWeiXin {
  constructor(appid, appsecret, apptoken, getAccessToken, saveAccessToken) {
    this.appid = appid;
    this.appsecret = appsecret;
    this.apptoken = apptoken;
    this.getAccessToken =
      getAccessToken ||
      async function() {
        return this.accessToken;
      };
    this.saveAccessToken =
      saveAccessToken ||
      async function(accessToken) {
        this.accessToken = accessToken;
      };
    this.textStack = [];
    this.menuStack = [];
    this.scanStack = [];
    this.router = [
      async (ctx, next) => {
        if (!ctx.query.signature) {
          ctx.body = "Access Denied!";
          return;
        }

        var tmp = [this.apptoken, ctx.query.timestamp, ctx.query.nonce]
          .sort()
          .join("");
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

        next();
      },
      async (ctx, next) => {
        message(ctx, next);
      },
      async (ctx, next) => {
        if (ctx.message.msgType == "text" && this.textStack.length) {
          for (const key in this.textStack) {
            const element = this.textStack[key];
            var keyWordArray = element.keyWord.split(",");
            for (const index in keyWordArray) {
              const keyWord = keyWordArray[index];
              if (ctx.message.content.indexOf(keyWord) >= 0) {
                return element.callBack(ctx);
              }
            }
          }
        }

        if (ctx.message.msgType == "event") {
          if (ctx.message.event == "LOCATION" && this.location) {
            return this.location.call(this, ctx);
          }

          if (ctx.message.event == "CLICK" && this.menuStack.length) {
            for (const key in this.menuStack) {
              const element = this.menuStack[key];
              if (element.keyWord == ctx.message.eventKey) {
                return element.callBack(ctx);
              }
            }
          }

          if (ctx.message.event == "subscribe" && this.subscribe) {
            if (ctx.message.eventKey) {
              console.log("触发了扫码关注事件");
              //扫码关注事件，同时出发扫码事件
              for (const key in this.scanStack) {
                const element = this.scanStack[key];
                if (
                  element.keyWord ==
                  ctx.message.eventKey.replace("qrscene_", "")
                ) {
                  element.callBack(ctx);
                  break;
                }
              }
            }
            return this.subscribe.call(this, ctx);
          }

          if (ctx.message.event == "SCAN" && this.scanStack.length) {
            for (const key in this.scanStack) {
              const element = this.scanStack[key];
              if (
                element.keyWord == ctx.message.eventKey.replace("qrscene_", "")
              ) {
                return element.callBack(ctx);
              }
            }
          }

          if (ctx.message.event == "unsubscribe" && this.unsubscribe) {
            return this.unsubscribe.call(this, ctx);
          }
        }

        next();
      },
      async ctx => {
        if (ctx.message.msgType == "event") {
          ctx.success();
        } else {
          ctx.transfer();
        }
      }
    ];
  }

  text(keyWord, callBack) {
    this.textStack.push({ keyWord, callBack });
    console.log("已注册关键词匹配事件：" + keyWord);
    return this;
  }

  menu(keyWord, callBack) {
    this.menuStack.push({ keyWord, callBack });
    console.log("已注册按钮点击匹配事件：" + keyWord);
    return this;
  }

  scan(keyWord, callBack) {
    this.scanStack.push({ keyWord, callBack });
    console.log("已注册扫码匹配事件：" + keyWord);
    return this;
  }
}

module.exports = FastNodeWeiXin;
