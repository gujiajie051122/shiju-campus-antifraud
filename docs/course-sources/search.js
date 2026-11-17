function MouseDirection(element, opts) {
    var $element = $(element);	
    //enter leave代表鼠标移入移出时的回调
    opts = $.extend({}, {
        enter: $.noop,
        leave: $.noop
    }, opts || {});

    var dirs = ['top', 'right', 'bottom', 'left'];

    var calculate = function (e) {
        var w = $element.outerWidth(),
            h = $element.outerHeight(),
            offset = $element.offset(),
            x = (e.pageX - offset.left - (w / 2)) * (w > h ? (h / w) : 1),
            y = (e.pageY - offset.top - (h / 2)) * (h > w ? (w / h) : 1);

        return Math.round((((Math.atan2(y, x) * (180 / Math.PI)) + 180) / 90) + 3) % 4;
    };

    $element.on('mouseenter', function (e) {
        var r = calculate(e);
        opts.enter($element, dirs[r]);
    }).on('mouseleave', function (e) {
        var r = calculate(e);
        opts.leave($element, dirs[r]);
    });
}; 
//调用函数	

//function diaoyong(id, playlist_id){
function diaoyong(id, playlist_id,dateflag,url_str,http_type){
	
	//列表和缩略图切换
    $(id+" .ind-r .vedio-list .switch .thumbnail").click(function(){  
    	$(this).addClass("cur").siblings().removeClass("cur");
		$(id+" .ind-r .vedio-list .svedio").addClass("cur");
		$(id+" .ind-r .vedio-list .lvedio").removeClass("cur");             
		var subject_id="";
	    subject_id =playlist_id;
		search_datelist = searchdateflag[subject_id];
		
		if (search_datelist){
	        //getPlaylist(subject_id,search_datelist,'video_list','month',"video",encodeURIComponent(url_str));	
	        getPlaylist(subject_id,search_datelist,'video_list','month',"video",url_str);
		}else {
		    //getPlaylist(subject_id,'','video_list','all',"video",encodeURIComponent(url_str));
		    getPlaylist(subject_id,'','video_list','all',"video",url_str);
		}
		
		//dateflag[playlist_id] ="2";	
		dateflag ="2";	
		 //$("#"+playlist_id+"_years_ul ul li:first").addClass("year_cur").siblings().removeClass("year_cur");
		//$("#"+playlist_id+"_years_ul ul li:first span").removeClass("year"); 			
		//缩略图轮播图	
		var obj02={
			oUl:id+" .ind-r .vedio-list .svedio .vl ul",
			oLi:id+" .ind-r .vedio-list .svedio .vl ul li",
			btnl:id+" .ind-r .vedio-list .svedio .vb-l",
			btnr:id+" .ind-r .vedio-list .svedio .vb-r",
			ml:10,
			group:5
		} 			       
		var lunbo02=new Lunbo(obj02);							   		
    });
    
    $(id+" .ind-r .vedio-list .switch .list").click(function(){
		$(this).addClass("cur").siblings().removeClass("cur");
		$(id+" .ind-r .vedio-list .svedio").removeClass("cur");
		$(id+" .ind-r .vedio-list .lvedio").addClass("cur");
		//dateflag[playlist_id] ="1";
		dateflag ="1";
		search_datelist = searchdateflag[playlist_id];
		if (search_datelist){                    
		    //getPlaylist(playlist_id,search_datelist,'list','month',"video",encodeURIComponent(url_str));
		    getPlaylist(playlist_id,search_datelist,'list','month',"video",url_str);
		}else {
		    //getPlaylist(playlist_id,'','list','all',"video",encodeURIComponent(url_str));
		    getPlaylist(playlist_id,'','list','all',"video",url_str);
		}
	
	   //$("#"+playlist_id+"_years_ul ul li:first").addClass("year_cur").siblings().removeClass("year_cur");
	   //$("#"+playlist_id+"_years_ul ul li:first span").removeClass("year");  
	
		var obj03={
			oUl:id+" .ind-r .vedio-list .lvedio .lcon",
			oLi:id+" .ind-r .vedio-list .lvedio .lcon ul",
			btnl:id+" .ind-r .vedio-list .lvedio .dots-btns .lbtnl",
			btnr:id+" .ind-r .vedio-list .lvedio .dots-btns .lbtnr",
			dot:id+" .ind-r .vedio-list .lvedio .dots-btns .dots li"
		}
		var lunbo03=new Lunbo(obj03);
		
	 	var btnw =$(id+" .lvedio .lcon ul").length;
		var dotW=$(id+" .ind-r .vedio-list .lvedio .dots-btns").width();
		if (btnw<=27 && btnw !=0){
			if (dotW !=null || dotW !=""){
				$(id+" .ind-r .vedio-list .lvedio .dots-btns").css("margin-left",-Math.ceil(dotW/2)+"px");							
			} 
		}else if (btnw>27 && btnw<=33  &&btnw !=0){
			if (dotW !=null  || dotW !=""){
				$(id+" .ind-r .vedio-list .lvedio .dots-btns").css("margin-left",-Math.ceil(dotW/1.5)+"px");							
			} 	
		}else if (btnw>=42&&btnw !=0){
			if (dotW !=null  || dotW !=""){							
				$(id+" .ind-r .vedio-list .lvedio .dots-btns").css("margin-left","-353px");							
			}
		}else {
			if (dotW !=null || dotW !=""){
			    $(id+" .ind-r .vedio-list .lvedio .dots-btns").css("margin-left",-Math.ceil(dotW/1.1)+"px");
			}
		}
    })

	//年份轮播图	
	var obj01={
		oUl:id+" .ind-r .vedio-list .years-list .years ul",
		oLi:id+" .ind-r .vedio-list .years-list .years ul li",
		btnl:id+" .ind-r .vedio-list .years-list .year-btn .yl",
		btnr:id+" .ind-r .vedio-list .years-list .year-btn .yr",
		ml:10,
		group:10
	}
	var lunbo01=new Lunbo(obj01);
			
		 //缩略图轮播图	
//			  var obj02={
//				oUl:id+" .ind-r .vedio-list .svedio .vl ul",
//				oLi:id+" .ind-r .vedio-list .svedio .vl ul li",
//				btnl:id+" .ind-r .vedio-list .svedio .vb-l",
//				btnr:id+" .ind-r .vedio-list .svedio .vb-r",
//				ml:10,
//				group:5
//			}
//			var lunbo02=new Lunbo(obj02);  
			
	//列表轮播图	
	var obj03={
		oUl:id+" .ind-r .vedio-list .lvedio .lcon",
		oLi:id+" .ind-r .vedio-list .lvedio .lcon ul",
		btnl:id+" .ind-r .vedio-list .lvedio .dots-btns .lbtnl",
		btnr:id+" .ind-r .vedio-list .lvedio .dots-btns .lbtnr",
		dot:id+" .ind-r .vedio-list .lvedio .dots-btns .dots li"
	}
	var lunbo03=new Lunbo(obj03);  
	//轮播图底部的点居中
	var dotW=$(id+" .ind-r .vedio-list .lvedio .dots-btns").width();
	$(id+" .ind-r .vedio-list .lvedio .dots-btns").css("margin-left",-dotW/2+"px");
	

	//鼠标滑过显示月份
	var x,y;
	$(id+" .ind-r .vedio-list .years-list .years ul li").hover(function(){
		x=$(this).position().left;
		y=$(this).position().top;
	})
	$(id+" .ind-r .vedio-list .years-list .years ul li").each(function(){
		var _this=this;
		new MouseDirection(_this,{
			enter:function(){
				$(id+" .months").css({"display":"block","left":x+"px","top":y+24+"px"});
			$(_this).addClass("cur").siblings().removeClass("cur");
			//if (dateflag[playlist_id]=="1"){	
			
			if (dateflag=="1"){
			    //make_month($(_this).attr('playlistid'), $(_this).attr('yearlist'),"list","video",encodeURIComponent(url_str),$(_this).attr('id'));
			   // make_month($(_this).attr('playlistid'), $(_this).attr('yearlist'),"list","video",url_str,$(_this).attr('id'),http_type);
			    if (http_type !=undefined){
				    make_month($(_this).attr('playlistid'), $(_this).attr('yearlist'),"list","video",url_str,$(_this).attr('id'),http_type);
			    }
			}else{
			   // make_month($(_this).attr('playlistid'), $(_this).attr('yearlist'),"video_list","video",encodeURIComponent(url_str),$(_this).attr('id'));		    	
			    //make_month($(_this).attr('playlistid'), $(_this).attr('yearlist'),"video_list","video",url_str,$(_this).attr('id'),http_type);
			    if (http_type !=undefined){
				    make_month($(_this).attr('playlistid'), $(_this).attr('yearlist'),"video_list","video",url_str,$(_this).attr('id'),http_type);
			    }
			} 
		
		},
		leave:function($element,dir){
			if(dir!="bottom"){
				$(id+" .months").css("display","none");
				$(_this).removeClass("cur");
				}
				
			}
		})
	}); 
	$(id+" .months").each(function(){
		new MouseDirection(this,{
			enter:function(){
				
			},
			leave:function($element,dir){
				if(dir!="top"){
					$(id+" .months").css("display","none");
					$(id+" .ind-r .vedio-list .years-list .years ul li").removeClass("cur");
				}
			}
		})
	});	
} 
