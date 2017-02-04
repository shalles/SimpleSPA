# Style Rules

### 整体构思

1. `config.scss`/`theme.scss`属于配置文件，我们可以在里面约定定义一些全局都阔以使用的变量，以实现整个app的统一性。
theme.scss主要是一些颜色的对照，是和UI沟通取得，因此UI设计的时候的颜色色系都是这个文件中的颜色（也就是说UI给出了的颜色有偏差可以提醒他），直接用就可以了。可能你会奇怪有config还要theme吗？当然theme.scss也可以合并到配置文件里面。我们还没有多种theme的需求。
/``

### 引用@import

**子页面引入公共方法和配置变量**

```css
@charset "utf-8";
@import 'scss-utils';

```

**新首页还需要引入**

```css
@import 'reset'; //统一浏览器默认样式
```

**lib & components**

`lib/css` 和 `components`已引入`scss @import`库路径
因此，在任何地方使用`src/lib/css`或`src/components`目录下的css时可直接写后续目录路径。如：

1.在`src/entries/main/pageA/css/index.scss`中引用动画`src/lib/css/ani/...`

```css
@import 'ani/classes';
@import 'ani/elastic-in-down';
@import 'ani/fade-in-right';
@import 'ani/fade-out-right';
```

2.在`src/entries/main/pageA/css/index.scss`中引用`src/components/dialog/...`

```css
@import 'dialog/index';
```


### theme 

theme.scss
