# CHORA 验证记录

日期：2026-09-29。环境：macOS、Node.js 25.9、Chromium、Vite 6.4。自动回归使用合成设备；用户报告镜头问题后，已按其请求在当前浏览器开启真实摄像头进行连接验证，详见最新记录。

## 2026-09-29 GitHub Pages公网发布验收

- 用户已确认公开源码和网页，公开仓库：[Jack-YunhaoJia/chora-gesture-choir](https://github.com/Jack-YunhaoJia/chora-gesture-choir)；分享地址：[CHORA](https://jack-yunhaojia.github.io/chora-gesture-choir/)。提交`95024fb`的[Actions运行36584902920](https://github.com/Jack-YunhaoJia/chora-gesture-choir/actions/runs/36584902920)build/deploy均成功，原始日志45 tests/45 pass/0 fail，Faust 2.89.2编译74,616字节。
- 公网HTTPS首页200；HTML/主JS/CSS引用的路径和MIME正确。独立内存下载7项核心资源＋6段试听，13/13 HTTP 200且SHA256与本地public完全一致。模型7,819,105字节，vision WASM 11,453,626字节；六段WAV均11.8秒、正确audio/wav。
- Playwright直接运行公网生产包，真实Faust AudioWorklet输出通过：Ambient、合成MediaStream输入Vocoder非零且有限；右腕暗/亮/回中均改变频谱，预设底色/音高/配器不变。Esc后context关闭、合成音轨ended；声音接零增益隔离。
- 浏览器实际MediaPipe通过正常摄像头入口初始化，输入为空白Canvas合成640×480视频，持续读帧，CAMERA LIVE/运行状态正确；停止后视频srcObject清空、所有合成轨道ended、音频context关闭。未请求实体摄像头/麦克风，不是人手识别率或真人歌唱验收。
- 初轮验收在大资源读取时触发90秒外层超时；独立HTTP完整性检查通过，延长验收脚本等待后实际浏览器资源、模型与试听阶段通过。原始结果和复跑入口位于`output/playwright/public-pages-*.json`与`output/browser/public-pages-run.mjs`，本地输出不提交。

## 2026-09-29 GitHub Pages构建修复

- 首次[Actions运行36583412908](https://github.com/Jack-YunhaoJia/chora-gesture-choir/actions/runs/36583412908)在`npm ci`失败：锁文件依赖下载地址指向企业内部镜像，GitHub runner无法解析该域名；尚未进入声音编译或网页部署。
- 提交`95024fb`将98个下载地址改为公开`registry.npmjs.org`，保留全部版本与integrity；项目`.npmrc`固定公开源。独立逐包下载核验98/98 HTTP 200且SRI完全一致，无私有依赖。
- 隔离源码副本＋全新依赖缓存安装成功，45项测试、实际模型下载/Faust编译/六段试听/144组离线边界与Pages子路径构建通过。新编译的公开资源与原工程逐文件相同，只有报告的generatedAt变化。验证目录`output/github-pages-validation/`不提交。

## 2026-09-29 GitHub Pages发布准备

- `.github/workflows/pages.yml` 已准备，使用官方Pages构建/发布动作（固定已核实提交SHA），Node24，npm ci→assets→test→按Pages base_path打包；只上传dist。此节为发布前历史记录；实际GitHub Actions和公网结果见上方最新验收。
- 当前源码与产物审计无本地凭证/设备录音图像发现；依赖、环境文件和本地测试输出在.gitignore中。公开源码将包含本项目MEMORY/TODO/说明，发布前待确认；用户随后确认公开，当前状态见上方最新记录。
- 本地以 `/chora-gesture-choir/` 构建，独立静态服务器测试通过：真实生产AudioWorklet RMS约0.0917，7项WASM/模型/声音/图标资源200且非空，6段试听可读时长11.8s，所有URL保持仓库子路径；结束context closed。无设备请求，输出零增益隔离。证据 `output/playwright/pages-check.json`。
- 该检查不等于公网访问或GitHub构建成功；实际URL已按上方最新记录验收。

## 2026-09-29 双腕倾斜可见性与声音修复

- 用户反馈右腕听感不明显，并指出参考左腕切大/小。确认旧路径并未断开，但只让brightness偏移±0.25；原滤波主要在和弦主能量上方，变化弱。左腕默认关闭且入口隐藏在和声方式选择中。
- 新版默认左腕控制大/小，并有显式开关、角度/已确认性质。右腕独立wristTone在0/0.5/1对应暗/原色/亮，未改预设brightness、音高与声部；滑杆在摄像头时只读跟随，试听可手动操作。
- 修正图像宽高比：map→角色→解释器完整传递实际videoWidth/videoHeight，640×480的真实30°不再低估为23.4°。横竖屏/镜像/32指型/缩放平移测试通过；保留左腕约±12°迟滞，右腕约±30°全范围。度数仅指镜像画面中侧倾，不覆盖前后翻掌。
- 全套45项自动测试通过；真实Faust编译WASM 74,616字节。中立音色与独立编译旁通逐样本完全一致，六条中立对比样本不变。相同干信号暗/中/亮频谱质心：Ambient月面183/206/249Hz、玻璃207/290/359Hz、暖流200/378/554Hz；Vocoder月面231/627/810Hz、玻璃304/608/674Hz、暖流212/542/761Hz。
- 变化来自频谱结构，非仅音量：以上干信号端点RMS相对原色为-3.33到+2.12dB，单音FFT基频最大变化0.0132音分；144组44.1/48/96kHz×模式/预设×腕端点×低高音区×旋钮极值均有限，最高峰0.854965。回中残差<=0.000719（单精度平滑渐近残余）、最大相邻采样差0.123993，端点全声部关闭/静音麦输入为0。详见 `public/audio/demos/report.json`、`docs/sound-design.md`。
- 合成21关节→真实mapper/角色/平滑/防抖→当前main的28项断言通过：左±20°C/Cm、右±30°0/1、回中0.5、固定性质、顺阶与重启开门、丢手、交换标签、试听专用控件禁用，glass底色68%与配器不变。AudioContext/getUserMedia均0，源码副本SHA与当前一致。记录 `output/browser/wrist-main-check.json`、`output/playwright/wrist-ui-verification.md`。这是逻辑链路证据，不是MediaPipe真人识别验收。
- 正式包 `index-Bx4IeuVR.js` 的真实Faust Worklet（44.1kHz）完成11组腕部检查：三预设×两模式×暗/中/亮/回中，UI腕值到达DSP，brightness恒0.58、音高/声部/strike/力度/context不变。Ambient暗/中/亮质心约182/205/240、196/233/281、199/378/562Hz；固定合成麦Vocoder约214/296/375、195/347/454、187/226/290Hz；各组高频占比随暗亮增加。Vocoder实际MediaStream输入且demo=0，没有真实设备请求。
- 正式浏览器同时验证默认左腕开关与和声选择双向同步、试听禁用左腕/可拖动右腕、预设保留腕量、静音/取消静音/停止释放，无console错误或DSP异常；扬声器由零增益隔离。原始摘要 `output/playwright/wrist-summary.json`、报告 `output/playwright/wrist-verification.md`、复跑 `output/browser/wrist-run.mjs`。返回0.5是参数回中；独立振荡器随时间变化，浏览器不同时间窗口不能称波形完全相同（静态旁通等价来自离线测量）。
- 新界面390px无横向溢出；双腕卡片各322px。实体摄像头/歌唱、艺术听感和端到端延迟仍待用户排练。

## 2026-09-29 完整交互与三种音色更新

- 全套39项自动测试与TypeScript/正式打包通过。保留原默认顺阶音列，增加各调性下自由大/小、开放/转位/七和弦/色彩、低八度；包括确认、防抖、丢手/拳形/仅拇指静音及引擎参数与编译元数据匹配。
- `npm run audio:compile` 真实编译Faust 2.89.2，WASM 71,886字节；六种模式/预设有不同发声路径。六个11.8秒固定条件WAV与合成元音来源/报告在 `public/audio/demos/`。离线测试覆盖静音、全部声部关闭、麦克风输入停止衰减、切换/重奏、质感效果、44.1/48/96kHz。
- 同输入/控制下起音15–75ms相对音体RMS：月面0.212、玻璃1.484、暖流0.639；极端参数最高峰值0.818。各音色频带能量不同；这是输出结构证据，不是主观品质或唱词清晰度结论。方法及完整数字见 `docs/sound-design.md` 与 `public/audio/demos/report.json`。
- 生产浏览器真实Faust Worklet、48kHz，15项断言通过；最终生产包 `index-BZR53vWj.js` 已另跑音频启动/预设/比较/停止smoke通过。UI预设0/1/2实际到达DSP，六组合均有限且非零；固定旋钮后频带分布仍不同。模式/音色切换保留音高/声部/context；重按和弦增加strike；所有声部关闭、静音、授权拒绝、重启及迟到流清理通过。没有导入开发源码替代生产音频路径。
- 浏览器模拟麦克风通过真实MediaStream输入，三预设均由输入驱动且demo=0；输入静音3.2秒后RMS约1.05e-5。Esc后context关闭、模拟音轨ended。所有物理设备请求被替换，输出通过零增益隔离，本轮没有打开实体设备或让扬声器发声。
- 六个生产样本都能解码、互斥播放；打开对比时实时乐器静音（RMS约1.85e-11），关闭时样本暂停/归零、乐器恢复。试听中手势专用控件禁用，保留已确认静态和声。详细原始结果与复跑入口在 `output/playwright/audio-qa-verification.md`、`output/browser/run-audio-qa.mjs`（临时验收文件）。
- 页面手势集成16项状态观察通过：对当前main.ts仅增加测试导出、使用手工构造GestureFrame，不启声音/镜头。设置变更即时重新判定开门；首次配器/性质确认、pending保持、丢手恢复、转位名称/音符、Glass明亮度基准68%＋腕调至93%、手动三和弦退出跟随、试听固定状态/禁用及对比恢复均通过。`output/browser/gesture-main-check.json` sourceStillMatches=true；不是MediaPipe模型或真人推理证据。
- 生产UI检查自由大/小得到D/Dm，六段比较弹窗及390px宽页面无横向溢出。截图 `output/playwright/sound-upgrade-{desktop,mobile}.png`、`sound-comparison-desktop.png`。
- 参考完整指南与公开客户端已核实；右手控制配器/八度，左腕才控制大/小。默认顺阶与自由性质、色彩配器的调外音边界均标明。本轮未读取/采集真人画面和录音，未验证新版真人手势准确率、声压、演出延迟或Safari/手机性能。

## 2026-09-29 摄像头入口修复

- 用户报告镜头无法打开。实际检查当前本地页面，点击旧「开始演奏」后成功获得真实640×480摄像头，视频readyState=4、持续播放并出现双手骨架；当时没有设备权限错误。此结果不能确定用户先前失败的唯一原因。
- 改进：舞台中央与顶部新增明确「开启摄像头」按钮；视图按钮改名；摄像头权限请求与音频启动并行；预览先于模型就绪显示；新增授权/预览/模型状态；麦克风独立按需启用。
- 新增临时浏览器回归：强制AudioContext.resume不返回、阻塞模型下载，摄像头仍在点击中立即请求，预览可见、占位隐藏、CAMERA LIVE与模型加载提示正确。取消清理track与srcObject；迟到授权返回的track也为ended。`output/browser/camera-start-check.html`，passed=true。
- TypeScript/正式打包及25项测试通过。物理摄像头验证仅确认连接、视频帧与关节叠加；未保存真人图像到工程，不代表演唱音色、稳定性与延迟验收。

## 2026-09-29 双手演奏更新

- 按用户SynthGesture参考，改为双手完整和弦指型与独立表情控制。来源与观察边界见 `docs/reference-synthgesture.md`。
- 全套25项测试通过：包括32种五指几何、7种完整指型、140ms稳定确认/250ms过渡超时、失去角色/握拳、角色交换、数组重排与交叉、12调性三/七和弦。
- 实际MediaPipe 0.10.32 CPU模型：原始食指样例被标为Right（0.993），镜像为Left（0.997）；默认采用Tasks分类值并提供角色交换。
- 用同一官方样例与镜像合成双手图像：模型识别两个角色（约0.999/0.988），140ms后选I并开门；调换检测数组顺序保持I；空检测立即关闭。不是真人双手质量统计。
- 用Canvas合成视频流驱动实际HandTracker和Faust：13个回调内完成检查，第5帧开始开门，8帧读取到非零输出，最高归一化输出指标0.189；停止后视频track=ended、srcObject=null、AudioContext=closed。未调用真实摄像头/麦克风。
- 新版正式打包与浏览器界面通过：七个和弦、Am三和弦及A3/C4/E4/A4配器、Vocoder切换保留和弦、7键Bdim、F键关闭八度声部、Esc停止；390px无横向溢出且麦克风按钮可达。
- 镜头主舞台、双手关节叠加、视图切换、全屏入口已实现；本次未采集真人画面，也未听辨参考音轨或声称复制其具体音色。Faust DSP本身未修改，复用已验证编译产物。
- 临时本地合成检查页：`output/browser/handcheck.html`、`twohandcheck.html`、`livecheck.html`；不随源码提交。

以下是双手更新前的初版基线记录，单手用例不代表新版仍采用单手交互。

## 已通过

- `npm test`：10 项。四指独立选择、旋转/镜像、透视世界坐标、防抖、丢失手部、异常关节、控制平滑、12 调性下和弦音关系及边界迟滞。
- `npm run build`：TypeScript 检查与正式打包通过。主 JS 约 192KB（gzip 60KB）；完整产物约 31MB，主要为本地手势 WASM 与模型。Faust 包中 Node 专用 `fs/url` 分支有 Vite externalized 提示，实际浏览器运行路径已验证。
- 真正的 Faust 编译与离线渲染：Ambient、合成元音 Vocoder、合成麦克风 Vocoder 均发声，四声部全关为零，麦克风静音后输出衰减到阈值内；无非有限数值或测试幅度溢出。
- 生产版浏览器 AudioWorklet：Ambient RMS 约 0.057、Vocoder 试听约 0.030、合成 MediaStream 输入约 0.068。输入静音后输出约 0.000009；数值为测试信号和设置下的指标，不是响度或艺术质量评价。
- 权限拒绝、重复启动/停止、停止后延迟返回的麦克风授权，均验证释放或保留正确会话。
- MediaPipe 真实本地模型对官方食指图像的推理：最近 100 帧均识别 21 个关节且只选中第一声部；无手图像不选声部。
- 手势跟踪显式停止约 28ms 释放声部；画面冻结约 289ms 释放声部；GPU 初始化/运行失败均可切至真实 CPU 模型。终止错误与设备中断可通知主会话停止。
- 浏览器界面：试听与两模式切换；玻璃花园预设更新空间到 84%、明亮度到 88%；C→D 调性更新为 Dmaj7；快捷键切和弦、开声部、空格静音、Esc 停止；帮助弹窗；桌面布局与 390px 窄屏无横向溢出，麦克风按钮可达。

## 本次修复的集成问题

- Faust 动态生成的工作线程受到生产压缩影响：改为编译阶段保存原始静态 Worklet，不依赖压缩后的函数字符串。
- 无麦克风时 AudioWorklet 输入总线为空导致合成器不计算：连接零值输入，确保设备免授权试听实际发声。
- 按钮焦点挡住演奏快捷键：对非输入控件统一处理快捷键。
- 识别器内部错误停止后页面状态残留：增加错误回调，统一停止会话并释放设备。
- 快速切换启动的竞争：在等待关闭旧会话之前取得启动所有权，并检查操作代次。
- Ambient 被麦克风拒绝阻断：保留摄像头演奏路径，同时明确 Vocoder 需要真实人声输入。
- active 关闭时淡出总音量，防止静音后长混响尾音继续输出。

本地原始检查摘要与截图在 `output/playwright/`（不随源码提交）：`vision/verification.md`、`audio-verification.md`、`chora-desktop.png`、`chora-mobile.png`。

## 尚未验证

真人演唱音色、不同手形/手指联动/遮挡/光线的识别率、实体设备端到端延迟、演出音响链路、长时间持续使用、Safari 和手机性能。当前结果不能替代这些检查。网页已发布到公网；实体设备、真人演唱和多浏览器性能仍未完成验收。
