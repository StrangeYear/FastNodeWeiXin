exports.getUserInfo = async function(openid) {
  const accessToken = await this.getAccessToken();

  var apiUrl = this.prefix + "user/info";

  var data = { access_token: accessToken, openid: openid, lang: "zh_CN" };

  return this.request(apiUrl, "GET", data);
};
