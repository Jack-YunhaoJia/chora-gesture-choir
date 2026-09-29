# 发布 CHORA 到 GitHub Pages

本项目是静态网页，可通过 GitHub Pages 提供 HTTPS 分享地址，无需单独运行后端。摄像头、麦克风与声音计算在访问者浏览器内进行。网页不是限时链接，需在不使用时主动取消发布。

## 发布前选择

- **公开源码仓库 + Pages**：最直接；仓库源码、说明及项目记忆文件对所有人可见，网页也公开。
- **私有源码仓库 + Pages**：取决于 GitHub 账户计划是否支持；源码私有不表示 Pages 网页私有。也可保留私有源码，另把构建产物发布到公开的演示仓库或其他静态托管服务。

用户已确认公开源码与网页。公开仓库：[Jack-YunhaoJia/chora-gesture-choir](https://github.com/Jack-YunhaoJia/chora-gesture-choir)。首次发布进行中；工作流自动读取 Pages 的路径。

## 首次发布

1. 把本目录作为独立 Git 仓库上传，主分支用 `main`，先确定仓库可见性。
2. 仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。
3. 在 **Actions → Publish CHORA to GitHub Pages → Run workflow** 启动；以后推送 `main` 自动更新。
4. 成功后，在部署环境或 **Settings → Pages** 获取实际地址。项目站通常是 `https://<账号>.github.io/<仓库名>/`。

工作流在 `.github/workflows/pages.yml`，使用 Node.js 24、锁文件安装依赖，准备本地模型与 Faust 音频后运行测试、按 Pages 子路径构建，只发布 `dist/`。首次联网下载模型，实际耗时受 GitHub 排队与下载速度影响。

`.gitignore` 排除依赖、本地测试输出、设备测试素材与环境文件；手势模型与 MediaPipe 运行库由构建生成。公开网页包含必要的模型、WASM 与合成试听音频，不包含 `MEMORY.md`、`TODO.md`、测试目录或 Obsidian 文件。若源码仓库公开，其中已跟踪的项目记忆和说明仍可被阅读。

## 本地模拟项目子路径

```bash
npm run assets
npm test
npm run build -- --base /chora-gesture-choir/ --outDir output/pages-preview/chora-gesture-choir
python3 -m http.server 4181 --bind 127.0.0.1 --directory output/pages-preview
```

打开 `http://127.0.0.1:4181/chora-gesture-choir/`。这里只模拟路径，真正发布后还要验证公网模型/AudioWorklet/试听加载，并在使用的设备上允许摄像头和麦克风。

## 暂时下线

在仓库 **Settings → Pages** 选择 **Unpublish site**。如需避免下一次推送重新上线，同时暂停 Actions 中的发布工作流。源码仓库可继续保留。

官方说明：[GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages)、[自定义发布工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。
