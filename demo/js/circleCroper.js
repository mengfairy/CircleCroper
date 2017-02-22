(function(global, factory){
    if (typeof define === 'function' && (define.amd || define.cmd)) {
        define(factory);
    } else {
        global.CircleCroper = factory();
    }
})(this,function(){
    var CircleCroper = function(elem,options){
        try {
            document.createElement("canvas").getContext("2d");
        } catch (e) {
            alert('对不起，您的浏览器不支持Canvas！');
            return false;
        }
        if(!elem || !document.getElementById(elem)){return false}
        this.elem = document.getElementById(elem);
        var defaults = {
            size: 360,
            exportSize:180
        };
        options = options || {};
        for (var key in defaults) {
            if (typeof options[key] == 'undefined') {
                options[key] = defaults[key];
            }
        }
        if(options.size && options.size<200){options.size=200};
        if(options.exportSize > options.size){options.exportSize=options.size};
        this.options = options;
        this.initCircleCroper()
    };
    CircleCroper.prototype = {
        initCircleCroper:function(){
            var _this = this;
            /*图片Canvas*/
            this.initCanvas = this.elem.getElementsByClassName('init-canvas')[0];
            this.initCxt = this.initCanvas.getContext('2d');
            /*裁剪Canvas*/
            this.croperCanvas = this.elem.getElementsByClassName('croper-canvas')[0];
            this.croperCxt = this.croperCanvas.getContext('2d');
            /*结果Canvas*/
            this.resultCanvas = this.elem.getElementsByClassName('result-canvas')[0];
            this.resultCxt = this.resultCanvas.getContext('2d');

            var imgSRC='',//图片路径
                SX=0,//croper圆心X坐标
                SY=0,//croper圆心Y坐标
                SR=0,//croper半径R
                isMove=false,//是否在移动
                isChange=false,//是否在缩放
                downX=0,//鼠标按下X坐标
                downY=0,//鼠标按下Y坐标
                CX=0,//contorl圆心X坐标
                CY=0;//contorl圆心Y坐标


            //重绘Canvas
            var redrawAllCanvas =function(){
                var image = new Image();
                image.src = imgSRC;
                image.onload = function(){
                    /*根据图片比例设置宽高*/
                    var scale = image.width/image.height;
                    if(scale>1){
                        image.width=_this.options.size;
                        image.height = image.width/scale;
                        SR = image.height*0.425;
                    }else if(scale<1){
                        image.height=_this.options.size;
                        image.width = image.height*scale;
                        SR = image.width*0.425;
                    }else if(scale==1){
                        image.width = _this.options.size;
                        image.height= _this.options.size;
                        SR = image.width/2;
                    }
                    /*设置canvas宽高=图片宽高*/
                    _this.initCanvas.width = image.width,_this.croperCanvas.width=image.width;
                    _this.initCanvas.height = image.height,_this.croperCanvas.height= image.height;
                    SX=_this.croperCanvas.width/2,SY=_this.croperCanvas.height/2;
                    _this.initCxt.drawImage(image,0,0,_this.initCanvas.width,_this.initCanvas.height);
                    drawClipArea();
                }
            }

            /*绘制裁剪区域*/
            function drawClipArea(){//绘制裁剪Canvas部分
                var croperCxt = _this.croperCxt;
                //背景
                croperCxt.clearRect(0,0,_this.croperCanvas.width,_this.croperCanvas.height);
                croperCxt.fillStyle="rgba(255,255,255,.5)";
                croperCxt.fillRect(0,0,_this.croperCanvas.width,_this.croperCanvas.height);
                //裁剪区
                croperCxt.globalCompositeOperation = 'destination-out';
                croperCxt.beginPath();
                croperCxt.fillStyle = "red";
                croperCxt.arc(SX, SY, SR, 0, Math.PI * 2, true);
                croperCxt.closePath();
                croperCxt.fill();
                //缩放圆（三角函数算缩放圆坐标）
                CX=SX+2*SR/3,CY=SY+Math.sqrt(SR*SR-4*SR*SR/9);
                croperCxt.globalCompositeOperation = 'source-over';
                croperCxt.beginPath();
                croperCxt.strokeStyle = '#333';
                croperCxt.fillStyle = "#fff";
                croperCxt.arc(CX, CY, 5, 0, Math.PI * 2, true);
                croperCxt.closePath();
                croperCxt.stroke();
                croperCxt.fill();
            }

            /*监听鼠标移入事件*/
            var mousemoveEvent = function(e){
                var bbox = _this.croperCanvas.getBoundingClientRect();
                var mx = e.clientX-bbox.left,my= e.clientY-bbox.top;

                var x= Math.abs(mx-SX),y=Math.abs(my-SY);//鼠标在canvas中的x,y坐标
                var mr = Math.sqrt(x*x+y*y);//鼠标距croper圆心的距离，如果小于croper的半径，则在该圆的里
                var cx = Math.abs(mx-CX),cy=Math.abs(my-CY);
                var cr = Math.sqrt(cx*cx+cy*cy);//鼠标距控制圆圆心距离，如果小于半径，则在控制圆中

                if(cr<5 || isChange){
                    _this.croperCanvas.style.cursor = 'nw-resize';
                    if(isChange){
                        var subX = mx-downX,subY = my-downY;
                        //判断是放大方向还是缩小方向('0':缩小，‘1’：放大，0：错误方向)
                        var direction = (subX<0 && subY<0)? '0' : (subX>0 && subY>0)? '1' : 0;
                        //错误方向、边界不做操作
                        if(!direction || ((SY+SR)>=_this.croperCanvas.height && direction=='1') || ((SX+SR)>=_this.croperCanvas.width && direction=='1') || (SR<=30 && direction=='0')){
                            return;
                        }
                        var dr = Math.sqrt(subX*subX+subY*subY);
                        dr= direction=='1'? dr:-dr;
                        SR+=dr, SX+=dr,SY+=dr;
                        if(direction=='1'){//放大界值判断
                            //缩放过大
                            if((SY+SR)>_this.croperCanvas.height){
                                var p = SY-SR;
                                var newSR = (_this.croperCanvas.height-p)/2;
                                SX -= SR-newSR;
                                SY = newSR+p;
                                SR = newSR;
                            }
                            if((SX+SR)>_this.croperCanvas.width){
                                var p = SX-SR;
                                var newSR = (_this.croperCanvas.width-p)/2;
                                SY -= SR-newSR;
                                SX = newSR+p;
                                SR = newSR;
                            }
                        }else{//缩小界值判断
                            if(SR<30){//缩放过小
                                var p = 30-SR;
                                SR=30;
                                SX+=p,SY+=p;
                            }
                        }
                        drawClipArea();
                        downX=mx,downY=my;//将当前的x,y重新赋值给鼠标移动前的x,y
                    }
                    return;
                }
                if(mr<SR || isMove){
                    _this.croperCanvas.style.cursor = 'move';
                    if(isMove){
                        var subX = mx-downX,subY = my-downY;
                        var a = SX+subX,b=SY+subY;
                        SX=a,SY=b;
                        //判断坐标出界
                        SX = a<SR? SR:SX;
                        SX = a>_this.croperCanvas.width-SR? _this.croperCanvas.width-SR:SX;
                        SY = b<SR? SR:SY;
                        SY = b>_this.croperCanvas.height-SR? _this.croperCanvas.height-SR:SY;
                        drawClipArea();
                        downX=mx,downY=my;//将当前的x,y重新赋值给鼠标移动前的x,y
                    }
                    return;
                }
                _this.croperCanvas.style.cursor = 'auto';

            }
            //鼠标按下
            var onmousedownEvent = function(e){
                var bbox = _this.croperCanvas.getBoundingClientRect();
                var mx = e.clientX-bbox.left,my= e.clientY-bbox.top;

                var x= Math.abs(mx-SX),y=Math.abs(my-SY);
                var cx = Math.abs(mx-CX),cy=Math.abs(my-CY);
                var cr = Math.sqrt(cx*cx+cy*cy);

                var fx = Math.sqrt(x*x+y*y);//鼠标距圆心的X，Y求出斜边，如果斜边小于canvas画圆的半径，则在该圆的中心
                if(cr<5){
                    isChange = true;
                    isMove=false;
                    var bbox = _this.croperCanvas.getBoundingClientRect();
                    downX = e.clientX-bbox.left,downY= e.clientY-bbox.top;
                }else if(fx<SR){
                    isChange = false;
                    isMove=true;
                    var bbox = _this.croperCanvas.getBoundingClientRect();
                    downX = e.clientX-bbox.left,downY= e.clientY-bbox.top;
                }else{
                    isMove = false;
                    isChange=false;
                }
            }
            //鼠标松开
            var mouseupEvent = function(){
                isMove = false;
                isChange=false;
            }
            //鼠标移出
            var mouseoutEvent = function(){
                isMove = false;
                isChange=false;
            }
            //选择图片
            var imgUplaod = function(event){
                if(!event.target.value){return false}//取消选择
                var files = this.files[0],oFReader;
                oFReader = new FileReader();
                oFReader.readAsDataURL(files);
                oFReader.onload = function(oFREvent){
                    imgSRC = oFREvent.target.result;
                    redrawAllCanvas();
                }
            };
            //确认
            var confirmCroper = function(){
                if(!imgSRC){alert('请先选择图片');return false}
                var image = new Image();
                image.src = imgSRC;
                image.onload = function(){
                    var s = image.width/_this.initCanvas.width;
                    _this.resultCxt.clearRect(0,0,_this.resultCanvas.width,_this.resultCanvas.height);
                    _this.resultCxt.drawImage(image,(SX-SR)*s,(SY-SR)*s,2*SR*s,2*SR*s,0,0,_this.resultCanvas.width,_this.resultCanvas.height);
                    var i = _this.resultCanvas.toDataURL();
                    if(_this.options.callback){
                        _this.options.callback(i);
                    }
                }
            }

            //设置裁剪区宽高
            var croperBox = this.elem.getElementsByClassName('croper-box')[0];
            croperBox.style.width = this.options.size+'px';
            croperBox.style.height = this.options.size+'px';
            /*设置导出宽高*/
            this.resultCanvas.width = this.options.exportSize;
            this.resultCanvas.height = this.options.exportSize;

            /*绑定事件*/
            this.elem.getElementsByClassName('img-input')[0].addEventListener('change',imgUplaod);
            this.elem.getElementsByClassName('confirm')[0].addEventListener('click',confirmCroper);
            this.croperCanvas.addEventListener('mousemove',mousemoveEvent);
            this.croperCanvas.addEventListener('mousedown',onmousedownEvent);
            this.croperCanvas.addEventListener('mouseup',mouseupEvent);
            this.croperCanvas.addEventListener('mouseout',mouseoutEvent);

        }
    };
    return CircleCroper;
});