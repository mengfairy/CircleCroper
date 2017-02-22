
# CircleCroper

基于Canvas的图片裁剪插件,兼容IE9+，不依赖其他插件。


# Usage

1.HTML
```html
<div id="elem-id">
    <div class="circle-croper-layout">
        <div class="croper-box">
            <i></i>
            <div class="canvas-wrap">
                <canvas class="init-canvas"></canvas>

                <canvas class="croper-canvas"></canvas>

            </div>
        </div>
        <div class="btn-group">

            <a href="javascript:void(0)" class="choose-button btn">
                <span>选择图片</span>
                <input title="123" accept="image/gif, image/jpeg, image/x-png" class="img-input" type="file" action-type="changeFile" node-type="file1" name="pic1">
            </a>
            <a href="javascript:void(0)" class="btn confirm"><span>确认</span></a>

        </div>
        <canvas class="result-canvas"></canvas>
    </div>
</div>
```
2.引入CSS和JS
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
