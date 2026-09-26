# tanzhouhu.github.io

Personal academic homepage of **Zhouhu Tan (谭周湖)** — https://tanzhouhu.github.io

纯静态站点，没有构建步骤。`.nojekyll` 让 GitHub Pages 原样发布，**不要删**。

## 文件地图

```
index.html          # 主页（改内容主要动这个）
cv/index.html       # CV 页
404.html            # 404 页
assets/css/main.css # 样式（配色、字号、布局都在这）
assets/js/main.js   # 交互（主题切换、菜单、滚动动效）
images/             # 头像 profile.jpg 和浏览器图标 favicon
```

## 常见修改

所有 HTML 都是 UTF-8 编码，**务必用 UTF-8 保存**（VSCode 右下角可查看/切换编码），
否则中文会变乱码。改内容只动文字，**不要删尖括号标签**（`<div>`、`<li>` 等）。

### 改文字

打开 `index.html`，搜注释 `===== About =====`、`===== Research =====`
等标记即可定位板块。`<strong>` 是加粗，`<em>` 是橙色斜体，`<a href="...">` 是链接。

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

时间用相对表述（Now / Freshman year / Present），**不要写入学年份**。

### 换头像

新照片重命名为 `profile.jpg` 覆盖 `images/` 里的旧文件。
建议 1200×900 的 4:3 横图；换成其他比例也能显示（不裁切）但留白不均匀。

### 改配色 / 字号

`assets/css/main.css` 最顶部 `:root` 就是调色板，`--accent` 是橙色主色；
深色模式在紧接着的 `html.dark { ... }` 里。字号搜 `body`、`.hero-name`、`.section-title`。

### CV 页

`cv/index.html`，结构同理。有论文后要加 Publications 板块，
参考文件里 Publications 注释块的说明。

## 本地预览

```powershell
cd D:\code\tanzhouhu.github.io
python -m http.server 8421
# 打开 http://127.0.0.1:8421/ ，改完刷新页面即可
```

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
