const message = require("./message");
const signature = require("./signature");

exports.router = function() {
  return [
    async (ctx, next) => {
      await signature(this.apptoken, ctx, next);
    },
    async (ctx, next) => {
      await message(ctx, next);
    },
    async (ctx, next) => {
      if (ctx.wx.msgType == "text" && this.textStack.length) {
        for (const key in this.textStack) {
          const element = this.textStack[key];
          if (element.keyWord.indexOf("*") != -1) {
            //通配符匹配
            var reg = new RegExp(element.keyWord.replace(/\*/g, ".*"));
            if (reg.test(ctx.wx.content)) {
              console.log(
                ">>>>>>>>>通配符匹配到关键词内容：" +
                  ctx.wx.content +
                  "<<<<<<<<<<<"
              );
              return element.callBack(ctx);
            }
          } else {
            //精确匹配
            if (ctx.wx.content == element.keyWord) {
              console.log(
                ">>>>>>>>>精确匹配到关键词内容：" +
                  ctx.wx.content +
                  "<<<<<<<<<<<"
              );
              return element.callBack(ctx);
            }
          }
        }
      }

      if (ctx.wx.msgType == "event") {
        if (ctx.wx.event == "LOCATION" && this.location) {
          return this.location.call(this, ctx);
        }

        if (ctx.wx.event == "CLICK" && this.menuStack.length) {
          for (const key in this.menuStack) {
            const element = this.menuStack[key];
            if (element.keyWord == ctx.wx.eventKey) {
              return element.callBack(ctx);
            }
          }
        }

        if (ctx.wx.event == "subscribe" && this.subscribe) {
          if (ctx.wx.eventKey) {
            console.log("触发了扫码关注事件");
            //扫码关注事件，同时出发扫码事件
            for (let i = 0; i < this.scanStack.length; i++) {
              const element = this.scanStack[i];
              if (
                ctx.wx.eventKey.replace("qrscene_", "").indexOf(element.keyWord)
              ) {
                await element.callBack(ctx);
                break;
              }
            }
          }
          return this.subscribe.call(this, ctx);
        }

        if (ctx.wx.event == "SCAN" && this.scanStack.length) {
          for (const key in this.scanStack) {
            const element = this.scanStack[key];
            if (
              ctx.wx.eventKey.replace("qrscene_", "").indexOf(element.keyWord)
            ) {
              return element.callBack(ctx);
            }
          }
        }

        if (ctx.wx.event == "unsubscribe" && this.unsubscribe) {
          return this.unsubscribe.call(this, ctx);
        }
      }

      await next();
    },
    async ctx => {
      if (ctx.wx.msgType == "event") {
        ctx.success();
      } else {
        ctx.transfer();
      }
    }
  ];
};
