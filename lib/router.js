const message = require("./message");
const signature = require("./signature");

exports.router = function() {
  return [
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
          if (element.keyWord.indexOf("*") != -1) {
            //通配符匹配
            var reg = new RegExp(element.keyWord.replace(/\*/g, ".*"));
            if (reg.test(ctx.message.content)) {
              console.log(
                ">>>>>>>>>通配符匹配到关键词内容：" +
                  ctx.message.content +
                  "<<<<<<<<<<<"
              );
              return element.callBack(ctx);
            }
          } else {
            //精确匹配
            if (ctx.message.content == element.keyWord) {
              console.log(
                ">>>>>>>>>精确匹配到关键词内容：" +
                  ctx.message.content +
                  "<<<<<<<<<<<"
              );
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
                ctx.message.eventKey
                  .replace("qrscene_", "")
                  .indexOf(element.keyWord)
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
              ctx.message.eventKey
                .replace("qrscene_", "")
                .indexOf(element.keyWord)
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
};
