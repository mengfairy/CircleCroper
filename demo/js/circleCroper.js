(function(global, factory){
    if (typeof define === 'function' && (define.amd || define.cmd)) {
        define(factory);
    } else {
        global.CircleCroper = factory();
    }
})(this,function(){
    var circleCroper = function(elem,options){
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
        console.log(options)
        this.initCircleCroper()
    };
    circleCroper.prototype = {
        drawClipArea:function(){//绘制裁剪Canvas部分
            var _this =this;
            var contextCroper = _this.croperCxt,data=_this.baseData;
            //背景
            contextCroper.clearRect(0,0,_this.croperCanvas.width,_this.croperCanvas.height);
            contextCroper.fillStyle="rgba(255,255,255,.5)";
            contextCroper.fillRect(0,0,_this.croperCanvas.width,_this.croperCanvas.height);
            //裁剪区
            contextCroper.globalCompositeOperation = 'destination-out';
            contextCroper.beginPath();
            contextCroper.fillStyle = "red";
            contextCroper.arc(data.SX, data.SY, data.SR, 0, Math.PI * 2, true);
            contextCroper.closePath();
            contextCroper.fill();
            //缩放圆（三角函数算缩放圆坐标）
            data.CX=data.SX+2*data.SR/3,data.CY=data.SY+Math.sqrt(data.SR*data.SR-4*data.SR*data.SR/9);
            contextCroper.globalCompositeOperation = 'source-over';
            contextCroper.beginPath();
            contextCroper.strokeStyle = '#333';
            contextCroper.fillStyle = "#fff";
            contextCroper.arc(data.CX, data.CY, 5, 0, Math.PI * 2, true);
            contextCroper.closePath();
            contextCroper.stroke();
            contextCroper.fill();
        },
        eventBind:function(){
            var _this = this;
            var data=_this.baseData;
            var mousemoveEvent = function(e){
                var bbox = _this.croperCanvas.getBoundingClientRect();
                var mx = e.clientX-bbox.left,my= e.clientY-bbox.top;//在canvas中的坐标

                var x= Math.abs(mx-data.SX),y=Math.abs(my-data.SY);//鼠标在裁剪圆中的x,y坐标
                var bd = Math.sqrt(x*x+y*y);//鼠标距croper圆心的距离，如果小于croper的半径，则在该圆的里
                var cx = Math.abs(mx-data.CX),cy=Math.abs(my-data.CY);
                var sd = Math.sqrt(cx*cx+cy*cy);//鼠标距控制圆圆心距离，如果小于半径，则在控制圆中

                if(sd<5 || data.isChange){//控制
                    _this.croperCanvas.style.cursor = 'nw-resize';
                    if(data.isChange){
                        var subX = mx-data.downX,subY = my-data.downY;
                        //判断是放大方向还是缩小方向('0':缩小，‘1’：放大，0：错误方向)
                        var direction = (subX<0 && subY<0)? '0' : (subX>0 && subY>0)? '1' : 0;
                        //错误方向、边界不做操作
                        if(!direction || ((data.SY+data.SR)>=_this.croperCanvas.height && direction=='1') || ((data.SX+data.SR)>=_this.croperCanvas.width && direction=='1') || (data.SR<=30 && direction=='0')){
                            return;
                        }
                        var dr = Math.sqrt(subX*subX+subY*subY);//移动的距离
                        dr= direction=='1'? dr:-dr;
                        data.SR+=dr, data.SX+=dr,data.SY+=dr;
                        if(direction=='1'){//放大界值判断
                            //缩放过大
                            if((data.SY+data.SR)>_this.croperCanvas.height){
                                var p = data.SY-data.SR;
                                var newSR = (_this.croperCanvas.height-p)/2;
                                data.SX -= data.SR-newSR;
                                data.SY = newSR+p;
                                data.SR = newSR;
                            }
                            if((data.SX+data.SR)>_this.croperCanvas.width){
                                var p = data.SX-data.SR;
                                var newSR = (_this.croperCanvas.width-p)/2;
                                data.SY -= data.SR-newSR;
                                data.SX = newSR+p;
                                data.SR = newSR;
                            }
                        }else{//缩小界值判断
                            if(data.SR<30){//缩放过小
                                var p = 30-data.SR;
                                data.SR=30;
                                data.SX+=p,data.SY+=p;
                            }
                        }
                        _this.drawClipArea();
                        data.downX=mx,data.downY=my;//将当前的x,y重新赋值给鼠标移动前的x,y
                    }
                    return;
                }
                if(bd<data.SR || data.isMove){
                    _this.croperCanvas.style.cursor = 'move';
                    if(data.isMove){
                        var subX = mx-data.downX,subY = my-data.downY;
                        var a = data.SX+subX,b=data.SY+subY;
                        data.SX=a,data.SY=b;
                        //判断坐标出界
                        data.SX = a<data.SR? data.SR:data.SX;
                        data.SX = a>_this.croperCanvas.width-data.SR? _this.croperCanvas.width-data.SR:data.SX;
                        data.SY = b<data.SR? data.SR:data.SY;
                        data.SY = b>_this.croperCanvas.height-data.SR? _this.croperCanvas.height-data.SR:data.SY;

                        _this.drawClipArea();
                        data.downX=mx,data.downY=my;//将当前的x,y重新赋值给鼠标移动前的x,y
                    }
                    return;
                }
                _this.croperCanvas.style.cursor = 'auto';
            };
            var onmousedownEvent = function(e){
                var bbox = _this.croperCanvas.getBoundingClientRect();
                var mx = e.clientX-bbox.left,my= e.clientY-bbox.top;//在canvas中的坐标

                var x= Math.abs(mx-data.SX),y=Math.abs(my-data.SY);//鼠标在裁剪圆中的x,y坐标
                var bd = Math.sqrt(x*x+y*y);//鼠标距croper圆心的距离，如果小于croper的半径，则在该圆的里
                var cx = Math.abs(mx-data.CX),cy=Math.abs(my-data.CY);
                var sd = Math.sqrt(cx*cx+cy*cy);//鼠标距控制圆圆心距离，如果小于半径，则在控制圆中

                if(sd<5){
                    data.isChange = true;
                    data.isMove=false;
                }else if(bd<data.SR){
                    data.isChange = false;
                    data.isMove=true;
                }else{
                    data.isMove = false;
                    data.isChange=false;
                }
                data.downX = e.clientX-bbox.left,data.downY= e.clientY-bbox.top;
            };
            var mouseupEvent = function(){
                data.isMove = false;
                data.isChange=false;
            }
            var mouseoutEvent = function(){
                data.isMove = false;
                data.isChange=false;
            }

            /*选择图片*/
            var imgUplaod = function(event){
                if(!event.target.value){return false}//取消选择
                var files = this.files[0],oFReader;
                oFReader = new FileReader();
                oFReader.readAsDataURL(files);
                oFReader.onload = function(oFREvent){
                    _this.imgSRC = oFREvent.target.result;
                    _this.redrawAllCanvas();

                }
            };
            /*确认*/
            var confirmCroper = function(){
                if(!_this.imgSRC){alert('请先选择图片!');return false}
                var image = new Image();
                image.src = _this.imgSRC;
                image.onload = function(){
                    var s = image.width/_this.initCanvas.width;
                    _this.resultCxt.clearRect(0,0,_this.resultCanvas.width,_this.resultCanvas.height);
                    _this.resultCxt.drawImage(image,(data.SX-data.SR)*s,(data.SY-data.SR)*s,2*data.SR*s,2*data.SR*s,0,0,_this.resultCanvas.width,_this.resultCanvas.height);
                    var i = _this.resultCanvas.toDataURL();
                    if(_this.options.callback){
                        _this.options.callback(i);
                    }
                }
            };

            _this.elem.getElementsByClassName('img-input')[0].addEventListener('change',imgUplaod);
            _this.elem.getElementsByClassName('confirm')[0].addEventListener('click',confirmCroper);
            _this.croperCanvas.addEventListener('mousemove',mousemoveEvent);
            _this.croperCanvas.addEventListener('mousedown',onmousedownEvent);
            _this.croperCanvas.addEventListener('mouseup',mouseupEvent);
            _this.croperCanvas.addEventListener('mouseout',mouseoutEvent);
        },
        redrawAllCanvas:function(){
            var _this = this;
            var image = new Image();
            image.src = _this.imgSRC;
            image.onload = function(){
                /*根据图片比例设置宽高*/
                var scale = image.width/image.height;
                if(scale>1){
                    image.width=_this.options.size;
                    image.height = image.width/scale;
                    _this.baseData.SR = image.height*0.425;
                }else if(scale<1){
                    image.height=_this.options.size;
                    image.width = image.height*scale;
                    _this.baseData.SR = image.width*0.425;
                }else if(scale==1){
                    image.width = _this.options.size;
                    image.height= _this.options.size;
                    _this.baseData.SR = image.width/2;
                }
                /*设置canvas宽高=图片宽高*/
                _this.initCanvas.width = image.width,_this.croperCanvas.width=image.width;
                _this.initCanvas.height = image.height,_this.croperCanvas.height= image.height;
                _this.baseData.SX=_this.croperCanvas.width/2,_this.baseData.SY=_this.croperCanvas.height/2;
                _this.initCxt.drawImage(image,0,0,image.width,image.height);

                _this.drawClipArea();
            }
        },
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

            this.baseData={
                SX:0,//croper圆心X坐标
                SY:0,//croper圆心Y坐标
                SR:0,//croper半径R
                isMove:false,//是否在移动
                isChange:false,//是否在缩放
                downX:0,//鼠标按下X坐标
                downY:0,//鼠标按下Y坐标
                CX:0,//contorl圆心X坐标
                CY:0,//contorl圆心Y坐标
            };
            //设置裁剪区宽高
            var croperBox = this.elem.getElementsByClassName('croper-box')[0];
            croperBox.style.width = this.options.size+'px';
            croperBox.style.height = this.options.size+'px';
            /*设置导出宽高*/
            this.resultCanvas.width = this.options.exportSize;
            this.resultCanvas.height = this.options.exportSize;

            this.eventBind();//绑定事件
        }
    };
    return circleCroper;
});
