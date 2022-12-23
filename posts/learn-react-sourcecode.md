---
title: React 源码学习
publish_date: 2022-12-24
tags: ['React']
---

# 2.1 JSX 到 JavaScript 的转化过程
[Babel转化过程链接](https://babeljs.io/repl)

```JSX
function Comp() {
	return <a>123</a>
}

<Comp id="div_Id" key="key">
  <span>test1</span>
  <span>test2</span>
</Comp>
```
上面一段 JSX 代码转化之后是这样的：

```js
"use strict";

function Comp() {
  return /*#__PURE__*/React.createElement("a", null, "123");
}
/*#__PURE__*/React.createElement(Comp, {
  id: "div_Id",
  key: "key"
}, /*#__PURE__*/React.createElement("span", null, "test1"), /*#__PURE__*/React.createElement("span", null, "test2"));
```
`React.createElement`方法的参数分别是：
1. 组件名 或者 组件变量，如果标签名为小写，那么组件名是标签名，如果是大写，那么就是组件变量
2. 传递进去的参数的对象
3. 之后的参数全是 childrens