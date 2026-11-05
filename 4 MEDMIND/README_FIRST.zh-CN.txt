本次更新：患者端青绿色／医生端深蓝色；顶部 English / 中文切换，默认英文。详见 CHANGELOG_20261103.zh-CN.md。

MEDMIND · Windows 双入口版（x64）

1. 解压整个 ZIP 到可写文件夹（例如桌面），不要在压缩包预览窗口中双击。
2. 双击 MEDMIND_Patient.exe，仅打开 Patient App。
3. 双击 MEDMIND_Doctor.exe，仅打开 Doctor Web。
4. 两个入口可先后运行，共用同一个本机服务和 data/medmind.sqlite 数据库。首次启动可能需要数秒。
5. 正常使用无需安装 Node.js 或运行 npm；需要 Windows x64 和默认浏览器。

直接访问：
Patient App  http://127.0.0.1:3001/patient/
Doctor Web  http://127.0.0.1:3001/doctor/

演示账户：
Jason Wong    jason@medmind.demo    jason-demo
Mrs. Chan     chan@medmind.demo     chan-demo
Dr. Lee       lee@medmind.demo      lee-demo

数据和运行日志写入 data 文件夹。若启动失败，查看 data/server.log；端口 3001 不能被其他程序占用。
本地服务在后台运行，关闭浏览器并不停止服务；重启电脑后可重新双击任一入口。
所有账户与记录都是虚构演示数据，请勿输入真实患者资料。该版本没有互联网服务器或真实用户的安全部署配置。

源码：apps/medmind-patient、apps/medmind-doctor、src、server、launcher。
重新构建前端：安装 Node.js 24+ 后运行 npm ci、npm run build。
重新构建 Windows 入口：用 Go 1.25+ 设置 GOOS=windows GOARCH=amd64 CGO_ENABLED=0，
分别以 -ldflags="-H windowsgui -X main.surface=patient" 或 doctor 编译 ./launcher。
