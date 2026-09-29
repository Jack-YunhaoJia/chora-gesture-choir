# CHORA 工作约定

继续本项目时先读 `MEMORY.md`、`TODO.md` 和 `VALIDATION.md`。重要会话收尾同步更新本项目文件与用户 Obsidian Codex 的 `projects/chora-gesture-choir.md`，只保存简洁、可核验的事实，不保存凭证或对话转储。

保持本项目与 StyleRAG-Adapter 独立。不要把 CHORA 的记忆或代码写入 StyleRAG-Adapter 的项目文件。

真实设备、合成设备、离线 DSP 与真人演唱验收需要分开报告。更改声音源码后重新运行 `npm run audio:compile`；发布产物也必须验证 AudioWorklet，不以开发服务器发声代替生产版检查。
