const FastNodeWeiXin = require("./lib/common");

// 模板消息接口
FastNodeWeiXin.mixin(require("./lib/template"));

// 消息事件匹配
FastNodeWeiXin.mixin(require("./lib/match"));

// 路由
FastNodeWeiXin.mixin(require("./lib/router"));

module.exports = FastNodeWeiXin;
