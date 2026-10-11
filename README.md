# tanzhouhu.github.io

Personal academic homepage of **Zhouhu Tan (谭周湖)** — https://tanzhouhu.github.io

纯静态站点，没有构建步骤。`.nojekyll` 让 GitHub Pages 原样发布，**不要删**。

## 文件地图

```
index.html          # 主页（改内容主要动这个）
cv/index.html       # CV 页
404.html            # 404 页
assets/css/main.css # 样式（配色、字体、字号、布局都在这）
assets/js/main.js   # 交互（打字机、粒子、研究图谱、主题/语言切换）
assets/fonts/       # 自托管字体（中文楷体子集等）
images/             # 头像 profile.jpg、favicon、小涂鸦插图
videos/             # 横幅视频 hero-banner-v5.mp4
```

想改什么 → 动哪个文件：

| 想改什么 | 动哪个文件 |
|---|---|
| 页面上的字、栏目、加一段介绍 | `index.html` |
| 字体、颜色、间距、圆角 | `assets/css/main.css` |
| 打字机、粒子名字、研究图谱 | `assets/js/main.js` |

改完存盘，刷新浏览器就看到。不用编译、不用装环境。

## 常见修改

所有 HTML 都是 UTF-8 编码，**务必用 UTF-8 保存**（VSCode 右下角可查看/切换编码），
否则中文会变乱码。改内容只动文字，**不要删尖括号标签**（`<div>`、`<li>` 等）。

### 改文字（中英双语是这样存的）

页面上每个中英双语的地方都是这个套路：**英文写在标签里，中文放在 `data-zh` 里**。

```html
<h2 data-zh="对<em>智能</em>充满好奇">
  Curious about <em>intelligence</em>
</h2>
```

- 改英文 → 改标签中间的字
- 改中文 → 改 `data-zh="..."` 引号里的字
- **两处都要改**，不然切换语言时对不上

搜注释 `===== About =====`、`===== Research =====` 等标记可定位板块；
或在 VSCode 里 `Ctrl+F` 搜 `data-zh` 一个个跳。
`<strong>` 是加粗，`<em>` 是橙色斜体，`<a href="...">` 是链接。

### 加一条 News（发论文就加这里）

搜 `news-list`，把下面这段复制到 `<ul>` 的最上面（新的在前）：

```html
<li class="news-item reveal">
  <div class="news-date">2026.09</div>
  <div class="news-body">
    <h3>事件标题</h3>
    <p>一两句话说明。</p>
  </div>
</li>
```

时间用相对表述（Now / Freshman year / Present）。

### 改字体

中文标题的楷体（霞鹜文楷）在 `assets/css/main.css` 开头的变量：

```css
--font-kai: "LXGW WenKai", "Kaiti SC", "STKaiti", "KaiTi", serif;
```

下面这条规则只在中文模式生效：

```css
html[lang="zh-CN"] .hero-name,
html[lang="zh-CN"] .hero-title,
html[lang="zh-CN"] .section-title { font-family: var(--font-kai); }
```

- 不想用楷体：删掉上面这几个选择器，回到默认字体
- 换别的中文字体：改 `--font-kai` 引号里的名字（前提是设备上装了该字体）
- 用网络字体：字体文件放 `assets/fonts/`，照 `lxgw-wenkai-light.css` 写一个 @font-face

英文/正文在 `--font-serif`、`--font-sans`，改法一样。
字号搜 `.hero-name`（大标题）、`.section-title`（章节标题）、`.research-desc`（正文）。

### 改配色

`assets/css/main.css` 最顶部 `:root` 就是调色板：

```css
--accent: #ea580c;    /* 橙色：数字编号、em 强调词 */
--ink: #1a1a1a;       /* 主文字 */
--ink-2: #5c5c5c;     /* 次要文字 */
--bg: #faf9f7;        /* 页面底色 */
--hair: #e8e4dd;      /* 分割线 */
```

改 `--accent` 一个值，全站橙色跟着变。深色模式在紧接着的 `html.dark { ... }` 里另有一套同名变量。

### 改研究图谱 / 加分支方向

在 `assets/js/main.js` 里搜 **`RESEARCH_GRAPH`**，是三张表：

**1. 节点 `nodes`** —— 加一行就多一个圈/点：

```javascript
{ id: "rag", x: 0.18, y: 0.3, mx: 0.1, my: 0.3,
  size: "small", en: "Retrieval Augmented", zh: "检索增强" },
```

- `size`：`center` 中心 / `large` 四个大方向 / `small` 分支小点
- `x,y` 电脑上的位置，`mx,my` 手机上的位置（0~1，相对画布宽高）
- `en` / `zh` 分别是英文名、中文名

**2. 连线 `links`** —— 谁连谁：

```javascript
["llm", "rag"],   // 表示 rag 挂在 llm 下面
```

**3. 一句话简介 `notes`** —— 悬停/点小点时弹的那句：

```javascript
rag: { en: "Grounding answers in retrieved documents.",
       zh: "把回答落在检索到的文档上。" }
```

三处都加，图谱上就有新分支。改完在手机宽度下也看一眼，电脑不挤手机可能挤。

### 粒子拼的名字

`assets/js/main.js` 里搜 `var TEXT`：

```javascript
var TEXT = "Zhouhu Tan";   // 横幅里粒子拼出的字
```

旁边的 `COLOR_A` / `COLOR_B` 是粒子颜色两头的色值。

### 换图 / 换视频

| 资源 | 位置 | 怎么换 |
|---|---|---|
| 头像 | `images/profile.jpg` | 同名覆盖 |
| 横幅视频 | `videos/hero-banner-v5.mp4` | 同名覆盖（保持文件名最省事） |
| 小涂鸦插图 | `images/` 下的 png | `index.html` 里搜 `doodle` 找引用处 |

换头像建议 1200×900 的 4:3 横图；换成其他比例也能显示（不裁切）但留白不均匀。

### CV 页

`cv/index.html`，结构同理。有论文后要加 Publications 板块，
参考文件里 Publications 注释块的说明。

## 本地预览

```powershell
cd D:\code\tanzhouhu.github.io
python -m http.server 8421
# 打开 http://127.0.0.1:8421/ ，改完刷新页面即可
```

双击 `index.html` 也能看个大概，但字体、视频在本地偶尔不显示，推荐用上面的小服务。

## 发布上线

```powershell
git add -A
git commit -m "简短描述改了什么"
git push
```

push 连不上 GitHub 时先设代理：`$env:https_proxy="http://127.0.0.1:7897"` 再推。
推送后 1～2 分钟生效，强刷 https://tanzhouhu.github.io/ （Ctrl+F5）查看。

## 出错了怎么办

单个文件改坏：`git checkout -- 文件名` 撤销。

## 几条别踩的坑

1. **中英两处都要改** —— 只改一处，切语言就穿帮
2. **index.html 里的注释是给你看的**，别删，里面写了「换视频放哪」「粒子字改哪行」
3. **研究图谱的坐标改完要手机/电脑宽度都看一眼**
4. **大改动前先 `git add + commit` 一下**，改坏了随时能退回来
