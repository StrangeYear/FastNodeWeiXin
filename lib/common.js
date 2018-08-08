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
