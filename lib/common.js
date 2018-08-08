const message = require("./message");
const signature = require("./signature");
const axios = require("axios");

class AccessToken {
  constructor(accessToken, expireTime) {
    this.accessToken = accessToken;
    this.expireTime = expireTime;
  }

  isValid() {
    return !!this.accessToken && Date.now() < this.expireTime;
  }
}

class FastNodeWeiXin {
  constructor(appid, appsecret, apptoken) {
    this.appid = appid;
    this.appsecret = appsecret;
    this.apptoken = apptoken;

    this.textStack = [];
    this.menuStack = [];
    this.scanStack = [];

    this.prefix = "https://api.weixin.qq.com/cgi-bin/";
    this.mpPrefix = "https://mp.weixin.qq.com/cgi-bin/";

    this.router = [
      async (ctx, next) => {
        signature(this.apptoken, ctx, next);
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
              for (let i = 0; i < this.scanStack.length; i++) {
                const element = this.scanStack[i];
                if (
                  element.keyWord ==
                  ctx.message.eventKey.replace("qrscene_", "")
                ) {
                  await element.callBack(ctx);
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

  async getAccessToken() {
    if (!this.accessToken || !this.accessToken.isValid()) {
      //没有保存过
      let res = await this.request(this.prefix + "token", "GET", {
        grant_type: "client_credential",
        appid: this.appid,
        secret: this.appsecret
      });
      var expireTime = Date.now() + (res.data.expires_in - 10) * 1000;
      this.accessToken = new AccessToken(res.data.access_token, expireTime);
    }
    return this.accessToken.accessToken;
  }

  async request(url, method, data) {
    try {
      let res;
      if (method == "GET") {
        res = await axios.get(url, { params: data });
      } else {
        res = await axios.post(url, data);
      }
      return res;
    } catch (error) {
      return null;
    }
  }
}

/**
 * 用于支持对象合并。将对象合并到API.prototype上，使得能够支持扩展
 * Examples:
 * ```
 * // 媒体管理（上传、下载）
 * FastNodeWeiXin.mixin(require('./lib/api_media'));
 * ```
 * @param {Object} obj 要合并的对象
 */
FastNodeWeiXin.mixin = function(obj) {
  for (var key in obj) {
    if (FastNodeWeiXin.prototype.hasOwnProperty(key)) {
      throw new Error(
        "Don't allow override existed prototype method. method: " + key
      );
    }
    FastNodeWeiXin.prototype[key] = obj[key];
  }
};

module.exports = FastNodeWeiXin;
