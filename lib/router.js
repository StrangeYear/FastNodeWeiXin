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
          var reg = new RegExp(element.keyWord);
          if (reg.test(ctx.wx.content)) {
            console.log(
              `>>>>>>>>>匹配到关键词内容：${ctx.wx.content}<<<<<<<<<<<`
            );
            return element.callBack(ctx);
          }
        }
        if (this.textLog) {
          //触发一个总的扫码log记录事件，用于统计
          this.textLog.call(this, ctx);
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
          if (this.clickLog) {
            //触发一个总的扫码log记录事件，用于统计
            this.clickLog.call(this, ctx);
          }
        }

        if (ctx.wx.event == "subscribe" && this.subscribe) {
          if (ctx.wx.eventKey) {
            ctx.wx.eventKey = ctx.wx.eventKey.replace("qrscene_", "");
            //扫码关注事件，同时出发扫码事件
            for (let i = 0; i < this.scanStack.length; i++) {
              const element = this.scanStack[i];
              var reg = new RegExp(element.keyWord);
              if (reg.test(ctx.wx.content)) {
                console.log(
                  `>>>>>>>>>关注事件中匹配到扫码内容：${
                    ctx.wx.eventKey
                  }<<<<<<<<<<<`
                );
                await element.callBack(ctx);
                break;
              }
            }
            if (this.scanLog) {
              //触发一个总的扫码log记录事件，用于统计
              this.scanLog.call(this, ctx);
            }
          }
          return this.subscribe.call(this, ctx);
        }

        if (ctx.wx.event == "SCAN" && this.scanStack.length) {
          ctx.wx.eventKey = ctx.wx.eventKey.replace("qrscene_", "");
          for (const key in this.scanStack) {
            const element = this.scanStack[key];
            var reg = new RegExp(element.keyWord);
            if (reg.test(ctx.wx.content)) {
              console.log(
                `>>>>>>>>>匹配到扫码内容：${ctx.wx.eventKey}<<<<<<<<<<<`
              );
              return element.callBack(ctx);
            }
          }
          if (this.scanLog) {
            //触发一个总的扫码log记录事件，用于统计
            this.scanLog.call(this, ctx);
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
