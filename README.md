
# CircleCroper

基于Canvas的图片裁剪插件,兼容IE9+，不依赖其他插件。


# Usage

1.引入CSS和JS
```javascript
<link rel="stylesheet" href="./css/circleCroper.css"/>

<script type="text/javascript" src="./js/CanvasCard.min.js"></script>
```

2.使用
```javascript
new CircleCroper(elem,options)
```
参数说明：
`    	- elem:容器元素ID
    	- options:可选参数，包括：
			size:裁剪区大小、最小200。
			exportSize:导出图片大小，不能大于裁剪区大小。
			callback：确认裁剪后回调函数，接收参数为图片base64码。`
