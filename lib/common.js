const axios = require("axios");
const uuid = require("node-uuid");
const crypto = require("crypto");

class AccessToken {
  constructor(accessToken, expireTime) {
    this.accessToken = accessToken;
    this.expireTime = expireTime;
  }

  isValid() {
    return !!this.accessToken && Date.now() < this.expireTime;
  }
}

class JsTicket {
  constructor(jsTicket, expireTime) {
    this.jsTicket = jsTicket;
    this.expireTime = expireTime;
  }

  isValid() {
    return !!this.jsTicket && Date.now() < this.expireTime;
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
  }

  async getAccessToken() {
    if (!this.accessToken || !this.accessToken.isValid()) {
      //没有保存过
      let res = await this.request(this.prefix + "token", "GET", {
        grant_type: "client_credential",
        appid: this.appid,
        secret: this.appsecret
      });
      var expireTime = Date.now() + (res.expires_in - 10) * 1000;
      this.accessToken = new AccessToken(res.access_token, expireTime);
    }
    return this.accessToken.accessToken;
  }

  async getJsTicket() {
    if (!this.jsTicket || !this.jsTicket.isValid()) {
      //没有保存过
      const accessToken = await this.getAccessToken();
      let res = await this.request(this.prefix + "ticket/getticket", "GET", {
        access_token: accessToken,
        type: "jsapi"
      });
      var expireTime = Date.now() + (res.expires_in - 10) * 1000;
      this.jsTicket = new JsTicket(res.ticket, expireTime);
    }
    return this.jsTicket.jsTicket;
  }

  async getJsSdk(url) {
    const jsTicket = await this.getJsTicket();
    const noncestr = uuid.v1();
    const timestamp = parseInt(Date.now() / 1000);
    const string1 =
      "jsapi_ticket=" +
      jsTicket +
      "&noncestr=" +
      noncestr +
      "&timestamp=" +
      timestamp +
      "&url=" +
      url;
    const signature = crypto
      .createHash("sha1")
      .update(string1)
      .digest("hex");
    return {
      url: url,
      nonceStr: noncestr,
      timestamp: timestamp,
      signature: signature,
      appId: this.appid
    };
  }

  async request(url, method, data) {
    try {
      let res;
      if (method == "GET") {
        res = await axios.get(url, { params: data });
      } else {
        res = await axios.post(url, data);
      }
      return res.data;
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
