# My Best Choice · 更新版项目包

对应已发布版本：12
源码提交：5b6a062214652901782ad4f71cef22a3a36d927f
网站：https://trace-decision-studio.p-tyrionchow.chatgpt.site

包含英文默认界面、一键中英切换、Poe 服务端 API、四个我分析、商品识别、需求与资金计划、图表、示例案例及测试。源码与构建产物都已包含。

## 本地运行

1. 安装 Node.js 20.12 或更高版本。
2. 在解压后的项目目录运行 `npm run dev`。
3. 打开 http://localhost:3000 。不要直接双击 HTML，完整交互与 API 需要本地服务器。

本项目没有第三方 npm 依赖。`npm test` 运行测试；`npm run build` 重新生成 dist。

## Poe 配置

已上线网站的密钥保留在服务端，不随 ZIP 导出。
本地需要 AI 时，将 .env.example 复制为 .env 并填写 POE_API_KEY、MBC_ACCESS_CODE；默认通过 Poe 调用 DeepSeek-V3.2。运行：

```sh
npm run build
node --env-file=.env scripts/dev.mjs
```

随后在网站“连接 AI”里填写同一个项目访问码。也可以在页面临时连接个人 Poe Key。不要把 .env 上传到公共仓库。

不配置密钥也能浏览、规划及使用明确标记的演示案例。商品平台官方实时价格、评价与订单接口仍未接入。

## 验证

打包时通过语法检查、41 项测试、页面与交互渲染检查及构建。压缩包不包含 Git 历史、真实 API 密钥或个人浏览器记录。
