/**
 * 发送模板消息
 * @param {Object} 构造的模板
 */
exports.sendTemplate = async function(template) {
  const accessToken = await this.getAccessToken();

  var apiUrl =
    this.prefix + "message/template/send?access_token=" + accessToken;

  for (const key in template.data) {
    if (typeof template.data[key] == "string") {
      //如果是字符串的话，说明不需要设置颜色值
      template.data[key] = { value: template.data[key] };
    }
  }

  return this.request(apiUrl, "POST", template);
};
