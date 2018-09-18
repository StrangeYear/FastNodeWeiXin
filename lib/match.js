exports.text = function(keyWordMatch, callBack) {
  //多关键词匹配放到程序启动时
  var keyWordArray = keyWordMatch.split(",");
  for (const index in keyWordArray) {
    let keyWord = keyWordArray[index];
    if (keyWord.charAt(0) != "*") {
      keyWord = "^" + keyWord;
    }
    if (keyWord.charAt(keyWord.length - 1) != "*") {
      keyWord += "$";
    }
    keyWord = keyWord.replace(/\*/g, ".*");

    for (const key in this.textStack) {
      //重复关键词判断
      const element = this.textStack[key];
      if (element.keyWord == keyWord) {
        const error = new Error("定义了重复的关键词");
        throw error;
      }
    }
    this.textStack.push({ keyWord, callBack });
    console.log(">>>>>>>>>>已注册关键词匹配事件：" + keyWord + "<<<<<<<<<<");
  }
  return this;
};

exports.menu = function(keyWord, callBack) {
  for (const key in this.menuStack) {
    //重复按钮点击事件判断
    const element = this.menuStack[key];
    if (element.keyWord == keyWord) {
      const error = new Error("定义了重复的按钮事件");
      throw error;
    }
  }
  this.menuStack.push({ keyWord, callBack });
  console.log(">>>>>>>>>>已注册按钮点击匹配事件：" + keyWord + "<<<<<<<<<<");
  return this;
};

exports.scan = function(keyWord, callBack) {
  for (const key in this.scanStack) {
    //重复扫码事件判断
    const element = this.scanStack[key];
    if (element.keyWord == keyWord) {
      const error = new Error("定义了重复的扫码事件");
      throw error;
    }
  }

  if (keyWord.charAt(0) != "*") {
    keyWord = "^" + keyWord;
  }
  if (keyWord.charAt(keyWord.length - 1) != "*") {
    keyWord += "$";
  }
  keyWord = keyWord.replace(/\*/g, ".*");

  this.scanStack.push({ keyWord, callBack });
  console.log(">>>>>>>>>>已注册扫码匹配事件：" + keyWord + "<<<<<<<<<<");
  return this;
};
