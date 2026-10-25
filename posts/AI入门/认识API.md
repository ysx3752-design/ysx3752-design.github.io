# 认识API

API（Application Programming Interface，应用程序编程接口）是软件系统之间进行交互和通信的一种约定和工具。

## 核心概念

1. **接口（Interface）**：它是一种“约定”。API 规定了两个软件之间怎么说话——你需要提供什么参数（比如要查哪个城市的天气），它会返回什么格式的数据（比如温度、湿度）。

2. **封装与隔离**：API 把复杂的内部实现隐藏起来。你不需要知道对方的数据库怎么建、算法怎么跑，只要按它的规则调用就行。这就像你不需要知道厨房怎么炒菜，只要看菜单点菜。

3. **标准化**：只要 API 不变，对方内部怎么升级改造，你的调用方式都不用变。

---


## REST API

REST API是目前最流行的API设计风格，AI API绝大多数都是POST请求。一个完整的 REST API 请求通常包含以下几个部分：

1. **URL (端点 Endpoint)**：`https://api.example.com/v1/users/123` （`v1` 表示 API 版本）。

2. **HTTP Method (方法)**：`GET`。

3. **Headers (请求头)**：包含认证信息（如 `Authorization: Bearer 你的Token`）、数据类型（`Content-Type: application/json`）。

4. **Body (请求体)**：GET 请求一般没有 Body；POST/PUT 请求的 Body 里放要传输的数据。

举个栗子，我们去调用OpenAI：

- **端点**：`https://api.openai.com/v1/chat/completions`

- **方法**：`POST`

- **Header**：`Authorization: Bearer sk-xxxx...`，`Content-Type: application/json`

- **Body**：`{"model": "gpt-4o", "messages": [{"role": "user", "content": "你好"}]}`

**POST和GET请求可以简单理解为，提交请求和获取资源。**

---

## JSON

JSON是API通信中最常用的数据格式。

如：

`{
"model": "gpt-4o",
"messages": [
{
"role": "system",
"content": "你是一个严谨的数学老师，只给出答案，不废话。"
},
{
"role": "user",
"content": "1+1等于几？"
},
{
"role": "assistant",
"content": "等于2。"
},
{
"role": "user",
"content": "那2+2呢？"
}
],
"temperature": 0.7,
"max_tokens": 100,
"stream": false
}`

---

## API常见错误

### 一、 客户端问题

通常是因为配置或余额问题。

- **401 Unauthorized（认证失败）**

  - **原因**：API Key 填错了、Key 已过期/被禁用，或者请求头里没带认证信息。

  - **处理**：检查 `.env` 或配置文件中的 Key 是否有多余的空格，确认 Key 在后台是否有效。

- **402 Payment Required / 403 Forbidden（余额不足/无权限）**

  - **原因**：账户欠费了，或者你试图调用一个你账号权限不够的模型（比如免费号想调 GPT-4）。

  - **处理**：去官方后台充值，或检查账号的模型权限。

- **404 Not Found（找不到地址）**

  - **原因**：API 的 `base_url`（接口地址）写错了，或者请求的模型名称拼写错误。

  - **处理**：核对接口文档的 URL 和模型名（如 `gpt-4o` 不要写成 `gpt4o`）。

### 二、 请求频率与限制问题

- **429 Too Many Requests（请求超限）**

  - **原因**：短时间内发送了太多请求，超过了平台规定的 RPM（每分钟请求数）或 TPM（每分钟 Token 数）；或者免费额度用完了。

  - **处理**：**不要疯狂重试**。配合“指数退避重试”（Exponential Backoff）机制，比如等 2 秒、4 秒、8 秒后再试；或者升级账号等级。

### 三、 参数与格式错误

- **400 Bad Request（请求无效）**

  - **原因**：传的参数格式不对。比如 JSON 格式残缺（少了个括号）、字段拼写错误、给 `temperature` 传了个字符串而不是数字、或者发送的文本太长超出了上下文限制。

  - **处理**：检查请求体（Payload）的 JSON 结构，确保严格遵循官方文档。

- **413 Payload Too Large（请求体过大）**

  - **原因**：你发送的文本、图片或上传的文件太大，超过了服务器允许的上限。

  - **处理**：压缩文件、拆分长文本，或者使用支持更大上下文的模型。

### 四、 服务端问题

- **5xx Server Error（服务器错误，如 500, 502, 503）**

  - **原因**：AI 服务商那边宕机了、网络拥堵、或者网关超时。

  - **处理**：通常需要重试，或者去服务商的 Status 页面查看是否发生了故障。

- **504 Gateway Timeout（网关超时）**

  - **原因**：大模型生成的内容太长（尤其是没开流式输出时），服务器处理时间过长，导致连接断开。

  - **处理**：设置合理的 `max_tokens`，或者在请求时开启 `stream: true`（流式输出）。

