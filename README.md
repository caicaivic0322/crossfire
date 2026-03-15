# CrossFire Demo

一个基于 `Three.js` 的轻量级网页 FPS 原型，主入口是根目录下的 `index.html`。当前版本已经包含战术 HUD、小地图雷达、程序化音效，以及 `Q` 键一键隐藏 HUD 的能力。

## 功能概览

- 第一人称移动、射击、换弹、敌人 AI 与击杀反馈
- 右上角小地图：以玩家朝向为正上方，实时显示友军与敌军位置
- 程序化战场音效：脚步、开枪、换弹、受击、命中提示
- 战术 HUD：左上战况、左下武器状态、中央准星，按 `Q` 可隐藏/恢复

## 目录说明

- `index.html`：当前正式入口，包含主要场景、UI 和游戏逻辑
- `audio-utils.js` / `radar-utils.js` / `hud-utils.js`：音效、雷达投影、HUD 控制辅助模块
- `*.test.mjs`：对应工具模块的 Node 测试
- `test.html`：最小浏览器连通性检查页
- `game.js`：早期独立实现，当前未接入主页面

## 本地运行

项目没有构建步骤，直接启动静态文件服务即可：

```bash
python3 -m http.server 8080
```

打开 `http://127.0.0.1:8080/index.html`。

操作说明：`WASD` 移动，鼠标瞄准，左键射击，`R` 换弹，空格跳跃，`Q` 隐藏/显示 HUD。浏览器会限制自动播放音频，所以需要先点击“开始游戏”或与页面交互一次来激活音效。

## 测试

```bash
node --test audio-utils.test.mjs hud-utils.test.mjs radar-utils.test.mjs
```

这些测试覆盖脚步声触发、武器音效配置、HUD 切换和雷达坐标投影。UI 级改动建议再做一次浏览器手动冒烟检查。

## 部署到 Render

这个仓库适合部署为 **Static Site**，不需要 `Web Service`。

- Service Type：`Static Site`
- Branch：`main`
- Root Directory：留空；当前仓库根目录就是站点根目录
- Build Command：可填 `echo "Static site ready"` 作为空构建
- Publish Directory：`.`
- Auto-Deploy：建议开启，后续每次推送都会自动触发部署

补充注意点：

- 页面依赖 `cdnjs.cloudflare.com` 提供的 `Three.js` CDN，最终访问环境需要能正常请求外部 CDN
- 当前没有环境变量、后端服务或数据库依赖
- 如果后续改成打包流程，再把 Render 的 `Build Command` 和 `Publish Directory` 改为实际产物目录
