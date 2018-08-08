const message = require("./message");
const signature = require("./signature");

exports.router = [
  async function(ctx, next) {
    signature(this.apptoken, ctx, next);
  },
  async function(ctx, next) {
    message(ctx, next);
  },
  async function(ctx, next) {
    if (ctx.message.msgType == "text" && this.textStack.length) {
      for (const key in this.textStack) {
        const element = this.textStack[key];
        if (ctx.message.content.indexOf(element.keyWord) >= 0) {
          return element.callBack(ctx);
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
              element.keyWord == ctx.message.eventKey.replace("qrscene_", "")
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
          if (element.keyWord == ctx.message.eventKey.replace("qrscene_", "")) {
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
  async function(ctx) {
    if (ctx.message.msgType == "event") {
      ctx.success();
    } else {
      ctx.transfer();
    }
  }
];
