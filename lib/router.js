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
      //文本消息
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
          //触发一个总的文本log记录事件，用于统计
          this.textLog.call(this, ctx);
        }
      }

      //图片消息
      if (ctx.wx.msgType == "image" && this.image) {
        return this.image.call(this, ctx);
      }

      //语音消息
      if (ctx.wx.msgType == "voice" && this.voice) {
        return this.voice.call(this, ctx);
      }

      //视频消息
      if (ctx.wx.msgType == "video" && this.video) {
        return this.video.call(this, ctx);
      }

      //短视频消息
      if (ctx.wx.msgType == "shortvideo" && this.shortvideo) {
        return this.shortvideo.call(this, ctx);
      }

      //普通位置消息
      if (ctx.wx.msgType == "location" && this.normalLocation) {
        return this.normalLocation.call(this, ctx);
      }

      //链接消息
      if (ctx.wx.msgType == "link" && this.link) {
        return this.link.call(this, ctx);
      }

      //事件
      if (ctx.wx.msgType == "event") {
        //位置事件
        if (ctx.wx.event == "LOCATION" && this.location) {
          return this.location.call(this, ctx);
        }

        //菜单点击事件
        if (ctx.wx.event == "CLICK" && this.menuStack.length) {
          for (const key in this.menuStack) {
            const element = this.menuStack[key];
            if (element.keyWord == ctx.wx.eventKey) {
              return element.callBack(ctx);
            }
          }
          if (this.clickLog) {
            //触发一个总的点击log记录事件，用于统计
            this.clickLog.call(this, ctx);
          }
        }

        //关注事件
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

        //扫码事件
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

        //取消关注事件
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
