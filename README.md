# FastNodeWeiXin

一个基于 Koa2 的微信公众平台开发框架

## 参考框架：

> co-wechat-api

> wx-connect

## 示例项目

[Example](https://github.com/StrangeYear/FastNodeWeiXinExample)

## 使用方法

### 安装

> npm i fast-node-weixin -S

或者

> yarn add fast-node-weixin

### 初始化

```js
const FastNodeWeiXin = require("fast-node-weixin");

var Weixin = new FastNodeWeiXin("appid", "appsecret", "apptoken");

module.exports = Weixin;
```

### 在其他类中引用

```js
const WeiXin = require("./WeiXin");
```

### 匹配消息和事件

#### 普通消息

1.匹配文本消息,支持匹配多个，支持通配符和精确匹配

```js
WeiXin.text("无", ctx => {
  ctx.text("这里是精确匹配到的无关键词");
})
  .text("买*", ctx => {
    ctx.text("这里是通配符匹配到的买关键词----买东西");
  })
  .text("*买*", ctx => {
    ctx.text("这里是两个通配符匹配到的买关键词----我要买东西");
  })
  .text("好,哈", ctx => {
    ctx.text("这里是匹配多个关键词");
  });
```

2.匹配图片消息

```js
WeiXin.image(ctx => {});
```

3.匹配语音消息

```js
WeiXin.voice(ctx => {});
```

4.匹配视频消息

```js
WeiXin.video(ctx => {});
```

5.匹配短视频消息

```js
WeiXin.shortvideo(ctx => {});
```

6.匹配普通位置消息

```js
WeiXin.normalLocation(ctx => {});
```

7.匹配链接消息

```js
WeiXin.link(ctx => {});
```

#### 事件

1.匹配按钮事件

```js
WeiXin.menu("LEFT", ctx => {
  ctx.text("你点击了key为LEFT的按钮");
}).menu("RIGHT", ctx => {
  ctx.text("你点击了key为RIGHT的按钮");
});
```

2.匹配扫码事件

```js
WeiXin.scan("stick_仇", ctx => {
  ctx.text("这里是扫码匹配参数：stick_仇");
}).scan("stick_肥", ctx => {
  ctx.text("这里是扫码匹配参数：stick_肥");
});
```

3.匹配关注事件

> 如果是扫码关注的，会先触发扫码事件，再触发关注事件。

```js
WeiXin.subscribe = ctx => {
  ctx.text("欢迎关注我的公众号");
};
```

4.匹配取消关注事件

```js
WeiXin.unsubscribe = ctx => {
  console.log("取消关注事件");
  ctx.success();
};
```

5.匹配定位事件

```js
WeiXin.location = ctx => {};
```

### Log 记录事件

> 文本消息，点击事件，扫码事件 匹配完之后 会触发 log 事件，用于统计分析。这里请不要做回复。

1.文本消息 log 记录
WeiXin.textLog = ctx => {};

2.点击事件 log 记录
WeiXin.clickLog = ctx => {};

3.扫码事件 log 记录
WeiXin.scanLog = ctx => {};

### 回复消息

1.文本消息

```js
ctx.text("这里是无关键词");
```

2.图文消息

```js
ctx.news([
  {
    title: "你想知道的都在这里",
    description: "毛孩子的生活哲学。FURLOSOPHY IS THE NEW PHILOSOPHY。",
    picUrl: "https://mmbiz.qpic.cn/mmbiz_jpg",
    url: "https://mp.weixin.qq.com/"
  }
]);
```

3.视频消息

```js
ctx.video({
  mediaId: ""
});
```

4.图片消息

```js
ctx.image({
  mediaId: ""
});
```

5.语音消息

```js
ctx.voice({
  mediaId: ""
});
```

6.音乐消息

```js
ctx.music({
  title: "",
  description: "",
  url: "",
  hqUrl: ""
});
```

7.回复 success 字符串，事件未匹配时也会使用这个

```js
ctx.success();
```

8.转发消息到客服系统,文本消息未匹配时也会使用这个

```js
ctx.transfer();
```

### 其他接口

1.发送模板消息

data 数据的 value 为字符串时会转为 json 对象

例如 keyword1: "公众号开发课程" 等同于
keyword1: {value:"公众号开发课程"}

也可以自定义颜色 keyword1: {value:"公众号开发课程",value:"#ff0000"}

```js
var result = await WeiXin.sendTemplate({
  touser: "oG-Wm0yxFP7lSrMASfHevIL8k5WA",
  template_id: "mOJ3pdY0Qc6kuvNPFl5x1EvwNiAzQJe779yZWnLIY6I",
  url: "https://www.baidu.com",
  miniprogram: {},
  topcolor: "#616161",
  data: {
    first: "这个是标题",
    keyword1: "公众号开发课程",
    keyword2: "19.9",
    keyword3: "马云",
    keyword4: "2018年8月6日"
  }
});
```

2.获取 access_token

```js
const accessToken = await WeiXin.getAccessToken();
```

```

```
