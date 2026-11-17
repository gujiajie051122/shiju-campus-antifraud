
if ((/Android|webOS|iPhone|iPod|BlackBerry|opera mini|opera mobile/i.test(navigator.userAgent))) {
	console.log(JumpUrl);
	window.location.href =JumpUrl;
}

function trim(str)
{  
   return str.replace(/(^\s*)|(\s*$)/g, "");
}
//表单提交
function searchForm_submit()
{

	var str = filterXSS(trim($("#search_qtext").val()));
	var str_type = filterXSS(trim($("#search_top_type").val()));
	if(str.length>0){
		$("#search_channel").val("");
		  $("#searchform").submit();		
	}else{
		window.location.href="index.php?type="+str_type;
	}
}

//首页页面跳转
var type_falg ="";
function queryByType(qtype)
{

	/*if (qtype=="podcast"){
		$("#video").addClass('cur').siblings().removeClass("cur");
		var str = trim($("#search_qtext").val());
		var xiyou_url="http://xiyou.cntv.cn/search?keyword="+encodeURIComponent(str);
		window.open(xiyou_url);
		return false;
	}else {*/
		if (qtype =='web'){
			$("#web").addClass('cur').siblings().removeClass("cur");		
		}else if(qtype =='audio'){
			$("#audio").addClass('cur').siblings().removeClass("cur");
		}else {
			$("#video").addClass('cur').siblings().removeClass("cur");
		}
		$("#search_top_type").val(qtype);
		var str = trim($("#search_qtext").val());
		if(str.length>0){
			$("#search_channel").val("");
	        $("#searchform").submit();
		}
		
		type_falg = qtype;
		if (type_falg){
			var urlflag ="";
			urlflag = filterXSS($("#search_url_type").val());
			$("#hotword").html('');
			showHotWord(urlflag);
		}
		
    //}
}
//获取热词
function showHotWord(urlflag)
{
	var type = filterXSS($("#search_top_type").val());
	//var ref ="http://"+urlflag+"search.php?type="+type+"&qtext=";
	var ref =urlflag+"search.php?type="+type+"&qtext=";

	$("#hotword").html('');
	if(wordArray!=undefined&&wordArray.length>0)
	{
		var hot_str='';
		for(var i=0;i<wordArray.length;i++)
		{
			hot_str+="<a href='"+ref+encodeURIComponent(wordArray[i]['word'])+"'>"+wordArray[i]['startflag']+wordArray[i]['word']+wordArray[i]['endflag']+"</a>";
		}
		$("#hotword").append(hot_str);
	}
}


//转换秒开始
function formatSeconds(a) {
	  var hh = parseInt(a/3600);  
	  //if(hh<10) hh = "0" + hh;  
	  var mm = parseInt((a-hh*3600)/60);  
	  if(mm<10) mm = "0" + mm;  
	  var ss = parseInt((a-hh*3600)%60);  
	  if(ss<10) ss = "0" + ss;  
	  if (hh>0){
		  var length = hh + ":" + mm + ":" + ss; 
	  }else {
	      var length = mm + ":" + ss; 
	  }
	  if(a>0){  
	    return length;  
	  }else{  
	    return "NaN";  
	  }  
} 

//获取时间
function getdatelist(playlistid){
	var listLength=0;	
    var getyears ="";
    var listNum ="";

   if(playlistid in playlistArray && playlistArray !=undefined){
    //if(playlistArray !=undefined && playlistArray.length >=0){
        if (playlistArray[playlistid]['moban']=='1'){//电视剧模板    	    	
        	var playlist =playlistArray[playlistid]['video'];
       	    var listLength = playlist.length; 
       	    listNum ='<span>共'+listLength+'集</span>';	
            $('.vedio-list .years-list #listNum_'+playlistid).append(listNum);
           /*listNum ='<span>共'+listLength+'集</span>';       
       	    $('.years-list #listNum_').append(listNum); */
        }else {    	
        	var playlistdate =new Array();
       	    playlistdate= playlistArray[playlistid]['date'];
       	    var getDate  = new Array();
       	    var yearArray=new Array();
       	    var monthArray  = new Array();
       	    $.each(playlistdate,function(i, n){ 					                    
       	       yearArray.push(i);									                               		 			                               		 			                            		 
       	    });           	   
    	    var getbtn="";          	     
    	    getyears +='<ul>';	
       	    yearArray.sort(function(a,b){return a<b?1:-1});
    	    if(yearArray.length <=10){
    	       $("#"+playlistid+"_years_l_r").hide();
    	    }						                                	 
       	    for(var s=0;s<yearArray.length;s++){
       	   		/*if (s==0){ 	   			
       	    	    getyears +='<li id ="'+playlistid+'_'+yearArray[s]+'" playlistid="'+ playlistid +'" yearlist="'+ yearArray[s] +'" class="year_cur"><span>'+yearArray[s]+'</span></li>';
       	   		}else {
       	    	    getyears +='<li  id ="'+playlistid+'_'+yearArray[s]+'" playlistid="'+ playlistid +'" yearlist="'+ yearArray[s] +'"><span class="year">'+yearArray[s]+'</span></li>'; 
       	        }*/   		
       	   	    getyears +='<li id ="'+playlistid+'_'+yearArray[s]+'" playlistid="'+ playlistid +'" yearlist="'+ yearArray[s] +'"><span class="year">'+yearArray[s]+'</span></li>';
       	    	
       	   	    var monthArray = playlistdate[yearArray[s]];				                               		 
       		    monthArray.sort(function(a,b){return b-a});	
       	    }
       	    getyears +='</ul>';      	    
            $('.years-list  #'+playlistid+'_years_ul').empty();
       	    $('.years-list  #'+playlistid+'_years_ul').append(getyears);						                                	 						                               	  						                                	                                                         						                                	    					                        														                                	 
        } 
    }  
}

//拼装月份方法
function make_month(id,year,showtype,type,url_str,year_id,http_type){
	
	$('.months').html('');
	var monthlist = playlistArray[id]['date'][year];
	var getMonths = "";
	for (var j=0;j < monthlist.length;j++){		
		if (showtype =='list'){
			 //getMonths +="<span><div  onclick=\"getMonthList('"+id+"','"+year+monthlist[j]+"','list','month','"+type+"','"+url_str+"','"+year_id+"')\">"+monthlist[j]+"月</div></span>";
			 //getMonths +="<span id='month_"+year+monthlist[j]+"' ><div  onclick=\"getMonthList('"+id+"','"+year+monthlist[j]+"','list','month','"+type+"','"+url_str+"','"+year_id+"')\" >"+monthlist[j]+"月</div></span>";
			 getMonths +="<span id='month_"+year+monthlist[j]+"' ><div  onclick=\"getMonthList('"+id+"','"+year+monthlist[j]+"','list','month','"+type+"','"+url_str+"','"+year_id+"','"+http_type+"')\" >"+monthlist[j]+"月</div></span>";
				
		}else{
		    //getMonths +="<span><div  onclick=\"getMonthList('"+id+"','"+year+monthlist[j]+"','video_list','month','"+type+"','"+url_str+"','"+year_id+"')\">"+monthlist[j]+"月</div></span>";
		    //getMonths +="<span id='month_"+year+monthlist[j]+"'><div  onclick=\"getMonthList('"+id+"','"+year+monthlist[j]+"','video_list','month','"+type+"','"+url_str+"','"+year_id+"')\" >"+monthlist[j]+"月</div></span>";
		    getMonths +="<span id='month_"+year+monthlist[j]+"'><div  onclick=\"getMonthList('"+id+"','"+year+monthlist[j]+"','video_list','month','"+type+"','"+url_str+"','"+year_id+"','"+http_type+"')\" >"+monthlist[j]+"月</div></span>";
		}				
	} 
	
	$('#' + id + '_months').html(getMonths);
	
	//月份添加底色
	var monthdate =monthflag[id];
	if (monthdate){
		$("#"+id+"_months #month_"+monthdate).css("background","#1e63b0");
		$("#"+id+"_months #month_"+monthdate).css("color","#fff");
		$("#"+id+"_months #month_"+monthdate).addClass("year_cur").siblings().removeClass("year_cur");
	}
} 





//获取月份数据 
function getMonthList(pid,datelist,showtype,dateflag,type,url_str,year_id,http_type){
	
	if (pid !=""){
		searchdateflag[pid] = datelist;
		//月份添加底色
		monthflag[pid] = datelist;
		$("#"+pid+"_months #month_"+datelist).css("background","#1e63b0");
		$("#"+pid+"_months #month_"+datelist).css("color","#fff");
		$("#"+pid+"_months #month_"+datelist).siblings().removeAttr("style");
		$("#"+pid+"_months #month_"+datelist).addClass("year_cur").siblings().removeClass("year_cur");
		
		//年份添加底色	
		$("#"+year_id).addClass("year_cur").siblings().removeClass("year_cur");	
		$("#"+pid+"_years_ul ul li span").addClass("year");
		$("#"+year_id+" span").removeClass("year");
		
		var load_url='https://r.img.cctvpic.com/so/cctv/list/';
		//var load_url= http_type+"r.img.cctvpic.com/so/cctv/list/";
				
		var mulu= Math.ceil(parseInt(pid.substr(1))/5000);
		var playlist_url=load_url+mulu+'/'+datelist+'/'+pid+'_'+datelist+'.js';+new Date().getTime();
		jQuery.getScript(playlist_url)
		.done(function() {
			 //加载成功 /
			 getPlaylist(pid,datelist,showtype,dateflag,type,url_str);
			//列表轮播图	
			 for(var i=1;i<5;i++){
				 if (showtype=='list'){//列表轮播图	
				     var obj03={
					     oUl:"#ind01_0"+i+" .ind-r .vedio-list .lvedio .lcon",
						 oLi:"#ind01_0"+i+" .ind-r .vedio-list .lvedio .lcon ul",
						 btnl:"#ind01_0"+i+" .ind-r .vedio-list .lvedio .dots-btns .lbtnl",
						 btnr:"#ind01_0"+i+" .ind-r .vedio-list .lvedio .dots-btns .lbtnr",
						 dot:"#ind01_0"+i+" .ind-r .vedio-list .lvedio .dots-btns .dots li"
					 }
				     var lunbo03=new Lunbo(obj03);
				     
				 	var btnw =$("#ind01_0"+i+" .lvedio .lcon ul").length;
				 	
					var dotW=$("#ind01_0"+i+" .ind-r .vedio-list .lvedio .dots-btns").width();
					if (btnw<=27 && btnw !=0){
						if (dotW !=null || dotW !=""){
							$("#ind01_0"+i+" .ind-r .vedio-list .lvedio .dots-btns").css("margin-left",-Math.ceil(dotW/2)+"px");							
						} 
					}else if (btnw>27 && btnw<=33  &&btnw !=0){
						if (dotW !=null  || dotW !=""){
							$("#ind01_0"+i+" .ind-r .vedio-list .lvedio .dots-btns").css("margin-left",-Math.ceil(dotW/1.5)+"px");							
						} 	
					}else if (btnw>=42&&btnw !=0){
						if (dotW !=null  || dotW !=""){							
							$("#ind01_0"+i+" .ind-r .vedio-list .lvedio .dots-btns").css("margin-left","-353px");							
						} 
					}else {
						if (dotW !=null || dotW !=""){
						    $("#ind01_0"+i+" .ind-r .vedio-list .lvedio .dots-btns").css("margin-left",-Math.ceil(dotW/1.1)+"px");
						}
					}
				 }else{//缩略图轮播图	
					 var obj02={
						oUl:"#ind01_0"+i+" .ind-r .vedio-list .svedio .vl ul",
						oLi:"#ind01_0"+i+" .ind-r .vedio-list .svedio .vl ul li",
						btnl:"#ind01_0"+i+" .ind-r .vedio-list .svedio .vb-l",
						btnr:"#ind01_0"+i+" .ind-r .vedio-list .svedio .vb-r",
						ml:10,
						group:5
					} 			       
					var lunbo02=new Lunbo(obj02);
				 }
			 }
					
		 })
		.fail(function() {
			//没有加载成功 
		   //getMonthList(pid,datelist);		
		});
    }
}


function page_list(playlist,playlistid){
	$(".ind-r .vedio-list .lvedio #vedio_con_" + playlistid.substr(1, 18)).siblings().remove(); 
	var len_tmp=0;
    len_tmp = playlist.length;
    var duts_str="";
    var page = Math.ceil(len_tmp/9);  
    if (page>=42){
    	page ="42";
    }
    if(page > 1  ){
    	duts_str = '<div class="dots-btns"><span class="lbtnl"></span><ul class="dots">';  	
   	    for(var j=0; j<page;j++ ){
    		if(j == 0){
    			duts_str += '<li class="cur"></li>'
    		}else{
        		duts_str += '<li></li>'	
    		}
    	}

    	duts_str += '</ul><span class="lbtnr"></span></div>';
    }
    $(".ind-r .vedio-list .lvedio #vedio_con_" + playlistid.substr(1, 18)).after(duts_str); 	
}
//获取左右滑动
function move_page(vedio_playlist,playlistid){
	var btn_tmp ="";
	$(".vedio-list #svedio_"+playlistid).find('span').remove();
	if (vedio_playlist.length>5){
		btn_tmp +="<span class='vb vb-l'></span>";
		btn_tmp +="<span class='vb vb-r'></span>";
		$(".vedio-list #svedio_"+playlistid).append(btn_tmp);	
	}
	
}




//获取无结果页的视频图片
function get_noresult(toplistArray,type){
	var toplist_word ="";
	var toplist_search="";
	var no_res ="";	
	var word_arr =new Array();
	var word_search =new Array();
	var message_search =new Array();
	for (var i=0;i<toplistArray.length;i++){ 
		if(toplistArray[i]['search'].length>1){
			word_arr[i] =toplistArray[i]['search'];			
	    }		
	}
	var randNum = randomNum(0,1);//随即取出前两条数据
	var randWord =new Array();
	for(var k=0;k<word_arr.length;k++){
	    randWord[k] = word_arr[k][randNum];
	}
    var message =shuffle(randWord);
    message_word = message.slice(0, 5);   
	for (var i in message_word){ 
		no_res +='<li>';
		no_res +='<div class="jvedio">';
		if (type=='web'){
			var ref="web.php?qtext="+message_word[i].TITLE+"&type="+type;
		}else {
		    var ref="video.php?qtext="+message_word[i].TITLE+"&type="+type;
	    }
		//no_res +='<a href="link_p.php?targetpage='+message_word[i].FILEURL+'&point=no_result&ref='+encodeURIComponent(ref)+'" target="_blank" title="'+message_word[i].TITLE+'"  class="image"><img src="'+message_word[i].PICPATH+'"/></a>';
		
		no_res +='<a href="'+message_word[i].FILEURL+'" lanmu1="'+message_word[i].FILEURL+'" lanmu2="'+ref+'" lanmu3="no_result" target="_blank" title="'+message_word[i].TITLE+'"  class="image"><img src="'+message_word[i].PICPATH+'" id="no_res_'+i+'"/></a>';
		
		
		no_res +='<div class="pd_tim">';
		no_res +='<span class="pd">'+message_word[i].CHANNEL+'</span>';
		no_res +='<span class="tim">'+formatSeconds(message_word[i].DURATIONS)+'</span>';		    		
		no_res +='</div>';
		no_res +='</div>';
		//no_res +='<a href="link_p.php?targetpage='+message_word[i].FILEURL+'&point=no_result&ref='+encodeURIComponent(ref)+'" target="_blank" title="'+message_word[i].TITLE+'" ><h3 class="tit">'+showshort(message_word[i].TITLE,'48')+'</h3></a>';
		
		no_res +='<a href="'+message_word[i].FILEURL+'"  lanmu1="'+message_word[i].FILEURL+'" lanmu2="'+ref+'"  lanmu3="no_result" target="_blank" title="'+message_word[i].TITLE+'" ><h3 class="tit" id="no_res_tit_'+i+'">'+showshort(message_word[i].TITLE,'48')+'</h3></a>';
	
		no_res +='</li>';
 	}
	$('.column_wrapper_w1200 .col_w1015 .search17354_hotV .con ul').html('');
	$('.column_wrapper_w1200 .col_w1015 .search17354_hotV .con ul').append(no_res);
	
	/*var message =shuffle(word_arr);
	message = message.slice(0, 5);		
	for(var j=0;j<message.length;j++){	
		 message_search =message[j];
		 var message_word =shuffle(message_search);	
		 message_word = message_word.slice(0, 1);	
		 for (var i in message_word){ 
			no_res +='<li>';
			no_res +='<div class="jvedio">';
	 		if (type=='web'){
				var ref="web.php?qtext="+message_word[i].TITLE+"&type="+type;
			}else {
			    var ref="video.php?qtext="+message_word[i].TITLE+"&type="+type;
		    }
			no_res +='<a href="link_p.php?targetpage='+message_word[i].FILEURL+'&point=no_result&ref='+encodeURIComponent(ref)+'" target="_blank" title="'+message_word[i].TITLE+'"  class="image"><img src="'+message_word[i].PICPATH+'"/></a>';
			no_res +='<div class="pd_tim">';
			no_res +='<span class="pd">'+message_word[i].CHANNEL+'</span>';
			no_res +='<span class="tim">'+formatSeconds(message_word[i].DURATIONS)+'</span>';		    		
			no_res +='</div>';
			no_res +='</div>';
			no_res +='<a href="link_p.php?targetpage='+message_word[i].FILEURL+'&point=no_result&ref='+encodeURIComponent(ref)+'" target="_blank" title="'+message_word[i].TITLE+'" ><h3 class="tit">'+showshort(message_word[i].TITLE,'48')+'</h3></a>';
			no_res +='</li>';
    	}
		$('.column_wrapper_w1200 .col_w1015 .search17354_hotV .con ul').html('');
		$('.column_wrapper_w1200 .col_w1015 .search17354_hotV .con ul').append(no_res);
	}*/
	
}

/**
随机化原数组
**/
function shuffle(array) {
	var m = array.length,
	    t, i;
	// 如果还剩有元素…
	while (m) {
	    // 随机选取一个元素…
	    i = Math.floor(Math.random() * m--);
	    // 与当前元素进行交换
	    t = array[m];
	    array[m] = array[i];
	    array[i] = t;
	}
	return array;
}

/*function get_noresult(wordstr,pageNum,type){
	var no_res ="";	
	$.ajax({
		url:"nosearch.php",
	    type:"get",
	    async:false,
	    dataType:"json",
	    data:{wordstr:wordstr,pageSize:pageNum},
	    success:function(re) {
	    	if (re.total>0) {
	    		var relist = re.list;
	    		if (type=='web'){
	    			var ref="web.php?qtext="+wordstr+"&type="+type;
	    		}else {
	    		    var ref="vedio.php?qtext="+wordstr+"&type="+type;
	    	    }
	    		for (var i in relist){   			
	    			no_res +='<li>';
	    			no_res +='<div class="jvedio">';
	    			no_res +='<a href="link_p.php?targetpage='+relist[i].urllink+'&point=no_result&ref='+encodeURIComponent(ref)+'" target="_blank" title="'+relist[i].all_title+'"  class="image"><img src="'+relist[i].imglink+'"/></a>';
	    			no_res +='<div class="pd_tim">';
	    			no_res +='<span class="pd">'+relist[i].channel+'</span>';
	    			no_res +='<span class="tim">'+formatSeconds(relist[i].durations)+'</span>';		    		
	    			no_res +='</div>';
	    			no_res +='</div>';
	    			no_res +='<h3 class="tit"><a href="link_p.php?targetpage='+relist[i].urllink+'&point=no_result&ref='+encodeURIComponent(ref)+'" target="_blank" title="'+relist[i].all_title+'" >'+relist[i].title+'</a></h3>';
	    			no_res +='</li>';
		    	}
	    		$('.column_wrapper_w1200 .col_w1015 .search17354_hotV .con ul').html('');
	    		$('.column_wrapper_w1200 .col_w1015 .search17354_hotV .con ul').append(no_res); 
	    	}	    			    	
	    }
	});	
}*/


//生成指定范围内的数字
function randomNum(minNum,maxNum){ 
    switch(arguments.length){ 
        case 1: 
            return parseInt(Math.random()*minNum+1); 
        break; 
        case 2: 
            return parseInt(Math.random()*(maxNum-minNum+1)+minNum); 
        break; 
        default: 
            return 0; 
        break; 
    } 
} 
//获取排行榜
function showTopword(urlflag)
{	
	var type = filterXSS($("#search_top_type").val());
	//var strUrl ="http://"+urlflag+'search.php?type=video&qtext=';
	//var strUrl ="http://"+urlflag+"search.php?type="+type+"&qtext=";
	var strUrl =urlflag+"search.php?type="+type+"&qtext=";
	$(".col_w166 .search17354_ind04 .ind04_bd ul").html('');
		
	if(toplistArray!=undefined&&toplistArray.length>0)
 	{
 		 var wordstr ="";
 		  for(var j = 0; j <toplistArray.length; j++) {
 			  //wordstr+='<li><i>'+toplistArray[j].sortnum+'</i><a  target="_blank" href="'+strUrl+encodeURI(toplistArray[j].word)+'">'+toplistArray[j].word+'</a></li>';
 		      wordstr+='<li><i>'+toplistArray[j].sortnum+'</i><a  target="_blank" href="'+strUrl+encodeURIComponent(toplistArray[j].word)+'">'+toplistArray[j].word+'</a></li>';
 		 } 
 		  //console.log(wordstr);
 	    $(".col_w166 .search17354_ind04 .ind04_bd ul").append(wordstr);
 	}
 	
}


//获取列表页
function get_web_data(currentPage,qtext,sort,pageNum,type,datepid,channel){
	var web_html ="";
    var findnum ="";
    var ref="";
    //ref="ifsearch?qtext="+qtext+"&sort="+sort+"&type="+type+"&vtime="+vtime+"&datepid="+datepid+"&channel="+channel+"page="+currentPage;
    ref="ifsearch?qtext="+qtext+"&sort="+sort+"&type="+type+"&datepid="+datepid+"&channel="+channel+"page="+currentPage;    
    $.ajax({
	    url:"ifsearch.php",
	    type:"get",
	    async:false,
	    dataType:"json",
	    //data:{page:currentPage,qtext:qtext,sort:sort,pageSize:pageNum,type:type,vtime:vtime,datepid:datepid,channel:channel},
	    data:{page:currentPage,qtext:qtext,sort:sort,pageSize:pageNum,type:type,datepid:datepid,channel:channel},
	    success:function(re) {
		}
    });
	
} 


//获取快速入口文件
//function get_fast_playlist(fast_playlistid,url_str){
function get_fast_playlist(fast_playlistid,url_str,epg_falg){	
	if (playlistArray !=undefined || playlistArray!=""  ){						
		//if(playlistArray[fast_playlistid] !=undefined || playlistArray[fast_playlistid] !="" || fast_playlistid in playlistArray){				
		if(playlistArray[fast_playlistid] !=undefined && playlistArray[fast_playlistid] !="" && fast_playlistid in playlistArray){		
			var fast_playlist =playlistArray[fast_playlistid]['fast'];	
			var fast_html='';	
		    /*修改开始*/
			fast_html +='<div class="image">';
			fast_html +=' <table width="100%" height="100%" cellspacing="0" cellpadding="0">';
			fast_html +='<tbody>';
			fast_html +='<tr>';
			fast_html +='<td valign="middle" align="center">';	
			fast_html +='<span lanmu1="'+fast_playlist.fast_targetpage+'" lanmu2="'+url_str+'" lanmu3="web_recomm">';
			fast_html +='<a href="'+fast_playlist.fast_targetpage+'"  id="fast_play" class="play" target="_blank">';
			if(fast_playlist.fast_logopath==""){
				fast_html +='<img src="style/noImg/243143.jpg">';
			}else{
				fast_html +='<img src="'+fast_playlist.fast_logopath+'">';
			}	
			fast_html +='</a>';
			fast_html +='</span>';
			fast_html +='</td>';
			fast_html +='</tr>';
			fast_html +='</tbody>';
			fast_html +='</table>';
			fast_html +='</div>';
			/*修改结束*/
			fast_html +='<div class="ind-r">';
			fast_html +='<div class="tit_bre">';
			//fast_html +='<h3 class="tit"><a href="link_p.php?targetpage='+fast_playlist.fast_targetpage+'&point=web_recomm&ref='+encodeURI(url_str)+'" target="_blank">'+decodeURIComponent(fast_playlist.word)+'</a></h3>';	
			fast_html +='<h3 class="tit"><span lanmu1="'+fast_playlist.fast_targetpage+'" lanmu2="'+url_str+'" lanmu3="web_recomm"><a href="'+fast_playlist.fast_targetpage+'" id="fast_cont" target="_blank">'+decodeURIComponent(fast_playlist.word)+'</a></span></h3>';
			fast_html +='<p class="bre">简介：'+decodeURIComponent(fast_playlist.brief)+'</p>';
			fast_html +='</div>';
			/*fast_html +='<div class="xiangqing"><a href="link_p.php?targetpage='+fast_playlist.fast_targetpage+'&point=web_recomm&ref='+encodeURI(url_str)+'" target="_blank">查看详情</a></div>';*/
			//20180425开始
			//fast_html +='<div class="xiangqing"><a href="link_p.php?targetpage='+fast_playlist.fast_targetpage+'&point=web_recomm&ref='+encodeURI(url_str)+'" target="_blank">查看详情</a></div>'; 
			fast_html +='<div class="xiangqing"><span lanmu1="'+fast_playlist.fast_targetpage+'" lanmu2="'+url_str+'" lanmu3="web_recomm"><a href="'+fast_playlist.fast_targetpage+'" id="fast_xiangqing" target="_blank">查看详情</a></span></div>'; 	
			if (epg_falg>0){
			    fast_html +='<div class="xiangqing" ><a target="_blank" href="https://tv.cctv.cn/epg/">更多节目单</a></div>';
			}
			//20180425结束
			fast_html += '</div>';
			$(".column_wrapper_w1200 .col_w1015 .search17354_ind05 #ind05").empty();
			$(".column_wrapper_w1200 .col_w1015 .search17354_ind05 #ind05").append(fast_html);
		}
	}
}
//专题开始
//function get_zhuanti_playlist(fast_playlistid,url_str){	
function get_zhuanti_playlist(fast_playlistid,url_str,flag){	
	if (playlistArray !=undefined || playlistArray !=""){		
		//if (playlistArray[fast_playlistid]!=undefined || playlistArray[fast_playlistid]!="" || fast_playlistid in playlistArray){					
		if (playlistArray[fast_playlistid]!=undefined && playlistArray[fast_playlistid]!="" && fast_playlistid in playlistArray){
			
			if (flag=='zhuanti'){
				var fast_playlist =playlistArray[fast_playlistid]['zhuanti'];				
			}
			if (flag=='zhibo'){
				var fast_playlist =playlistArray[fast_playlistid]['zhongguo'];				
			}
			if (flag=='ydzb'){
				var fast_playlist =playlistArray[fast_playlistid]['ydzb'];				
			}
			var fast_html='';	
			    /*修改开始*/	
				fast_html +='<div class="image">';
				fast_html +='<table width="100%" height="100%" cellspacing="0" cellpadding="0">';
				fast_html +='<tbody>';
				fast_html +='<tr>';
				fast_html +='<td valign="middle" align="center">';
				fast_html +='<span lanmu1="'+fast_playlist.fast_targetpage+'" lanmu2="'+url_str+'" lanmu3="web_recomm">';
				fast_html +='<a href="'+fast_playlist.fast_targetpage+'"  id="zhuanti_play'+fast_playlistid+'" class="play" target="_blank">';	
				if(fast_playlist.fast_logopath==""){
					fast_html +='<img id="img_'+fast_playlistid+'" src="style/noImg/243143.jpg">';
				}else{
					fast_html +='<img id="img_'+fast_playlistid+'" src="'+fast_playlist.fast_logopath+'">';
				}
				fast_html +='</a>';
				fast_html +='</span>';	
				fast_html +='</td>';
				fast_html +='</tr>';
				fast_html +='</tbody>';
				fast_html +='</table>';	
				fast_html +='</div>';
				/*修改结束*/		
				fast_html +='<div class="ind-r">';
				fast_html +='<div class="tit_bre">';	
				fast_html +='<h3 class="tit">';	
				fast_html +='<span lanmu1="'+fast_playlist.fast_targetpage+'" lanmu2="'+url_str+'" lanmu3="web_recomm"><a href="'+fast_playlist.fast_targetpage+'" id="zhuanti_cont'+fast_playlistid+'" target="_blank">'+decodeURIComponent(fast_playlist.word)+'</a></span>';
				
				//fast_html +='<div class="zhuanti_01">专题 </div>';
				if (flag=='zhuanti'){
					fast_html +='<div class="zhuanti_01">专题</div>';
				}
				if (flag=='zhibo'){
					fast_html +='<div class="zhuanti_01">直播中国</div>';
				}
				if (flag=='ydzb'){
					fast_html +=' ';
				}
				fast_html +='</h3>';
				
				fast_html +='<p class="bre">简介：'+decodeURIComponent(fast_playlist.brief)+'</p>';
				fast_html +='</div>';
				fast_html +='<div class="xiangqing"><span lanmu1="'+fast_playlist.fast_targetpage+'" lanmu2="'+url_str+'" lanmu3="web_recomm"><a href="'+fast_playlist.fast_targetpage+'" id="zhuanti_xiangqing'+fast_playlistid+'" target="_blank">查看详情</a></span></div>'; 	
				fast_html += '</div>';		
				//$(".column_wrapper_w1200 .col_w1015 .search17354_ind05 #ind05").empty();		
				$(".column_wrapper_w1200 .col_w1015 .search17354_ind05 #ind05"+fast_playlistid).empty();	
				$(".column_wrapper_w1200 .col_w1015 .search17354_ind05 #ind05"+fast_playlistid).append(fast_html);
				$(".column_wrapper_w1200 .col_w1015 .search17354_ind05 .ind05").css("display","block");
		   }
		}
	}
//专题结束
//计算图片尺寸
function ResizeImage1(ImgD,iwidth,iheight) {
	var myImage = new Image();
	//var iwidth = width; 定义允许图片宽度
	//var iheight = height; 定义允许图片高度	
	myImage.src = ImgD.src;
	if (myImage.width > 0 && myImage.height > 0) {
		if (myImage.width / myImage.height >= 1) {//宽版
			
			if (myImage.width > iwidth) {				
				ImgD.width = iwidth;
				ImgD.height = (myImage.height * iwidth) / myImage.width;
			} else {		
				ImgD.width = iwidth;
			    //ImgD.height = myImage.height;
			}
		}else {//竖版
			/*if (myImage.height > iheight){
				ImgD.height = iheight;
				ImgD.width = (myImage.width * iheight) / myImage.height;
			}else {
				ImgD.width = myImage.width;
				ImgD.height = myImage.height;
			}*/
			ImgD.width = iwidth;
			ImgD.height = iheight;
		}
	}
}

function ResizeImage2(ImgD,iwidth,iheight,id) {

	var myImage = new Image();	
	myImage.src = ImgD.src;	
	if (myImage.width > 0 && myImage.height > 0) {			
		if (myImage.width / myImage.height >= 1) {//宽版			
			if(iwidth ==149){//相关视频集				
				if (myImage.width > iwidth) {
					ImgD.width = iwidth;
					ImgD.height = (myImage.height * iwidth) / myImage.width;		
				} else {
					ImgD.width = iwidth;	
				}		
				//$('.search17354_ind02 .ind06 ul.post li .image #img_'+id).css('margin-top','45px');
				var dheight =(iwidth/myImage.width)*myImage.height;
				var sheight = (iheight-dheight)/2;
				$('.search17354_ind02 .ind06 ul.post li .image #img_'+id).css('margin-top',sheight)+'px';
			}else {//视频
				//$('.search17354_ind03 .ind03 .jieguo ul li .jvedio .image').css('background-color','');
				$('.search17354_ind03 .ind03 .jieguo ul li .jvedio .image #play_img_'+id).css('width','100%');			
			}
		}else {//竖版
			 if(iwidth ==149){//相关视频集
				 $('.search17354_ind02 .ind06 ul.post li .image #img_'+id).css('margin-top','0px');
				 $('.search17354_ind02 .ind06 ul.post li .image #img_'+id).css('height','100%');					
				 ImgD.width = iwidth;
				 ImgD.height = iheight;	
			 }else {//视频
					var widthMargin=($('.search17354_ind03 .ind03 .jieguo ul li' ).width()-$('#play_img_'+id).width())/2;			
					$('.search17354_ind03 .ind03 .jieguo ul li .jvedio .image').css('background-color','#000000');
					$('.image #play_img_'+id).css('height','100%');
					$('.image #play_img_'+id).css('margin-left',Math.ceil(myImage.width/iwidth)+"px");				
					$('#play_img_'+id).css('margin-left',widthMargin)+"px";
					ImgD.height = iheight;	

			 }							
		}
	}
}

//获取子视频
/*
 * playlistid  ID
 * datelist    获取年月  初始状态为空
 * showtype   子视频显示类型  list为列表模式 video_list视频模式
 * dateflag   显示数据类型  all为默认数据  month为月份数据
 * type       判断类型 web为图文 video为视频
 * url_str   路径
 * 
 * */

function getPlaylist(playlistid,datelist,showtype,dateflag,type,url_str){
	
	var playlist =new Array();
    var vedio_playlist =new Array();
	var str_tmp="";
    var vedio_tmp = "";
	var listRecent =0;
	var vedio_listRecent=0;
	var replace_title="";
	var end_title ="";
	var end_vedio_title="";
	if (dateflag =='all'){//是否是初始状态
	    $(".ind-r .vedio-list .lvedio #vedio_con_"+playlistid.substr(1, 18)+" ul").remove();
	       	
		// if (playlistArray !=undefined && playlistArray.length>=0){
		 if (playlistid in playlistArray &&  playlistArray !=undefined ){
	       if (playlistArray[playlistid]['moban']=='1'){//电视剧模板
		        playlist =playlistArray[playlistid]['video'];
		  }else {
		        playlist= playlistArray[playlistid]['video']['recent'];
		  }
	    //console.log(playlistArray[playlistid]['moban']);
        if (showtype =='list'){//列表
		    str_tmp = "<ul>";		  
		    for(var s in playlist){
		        var playlistHtml ="";
			    var title = decodeURIComponent(playlist[s]['title']); 
			    
			    end_title = showshort(title,'36');
			    //return false;
			    if(s % 9 == 0 && s != 0){	
			    	str_tmp += "</ul><ul>";
			    }
			    if (type=='video'){ 
			       // str_tmp += '<a href="link_p.php?targetpage='+playlist[s].targetpage+'&point=video_recomm&ref='+url_str+'" title="'+title+'" target="_blank"><li>'+end_title+'</li></a>';
			    	str_tmp += '<a  href="'+playlist[s].targetpage+'" lanmu1="'+playlist[s].targetpage+'" lanmu2="'+url_str+'" lanmu3="video_recomm"  title="'+title+'" target="_blank"><li id="video_l_flag'+playlistid+s+'">'+end_title+'</li></a>';
			    }else if (type=='audio'){
			       // str_tmp += '<a href="link_p.php?targetpage='+playlist[s].targetpage+'&point=video_recomm&ref='+url_str+'" title="'+title+'" target="_blank"><li>'+end_title+'</li></a>';
			    	str_tmp += '<a  href="'+playlist[s].targetpage+'" lanmu1="'+playlist[s].targetpage+'" lanmu2="'+url_str+'" lanmu3="audio_recomm"  title="'+title+'" target="_blank"><li id="audio_l_flag'+playlistid+s+'">'+end_title+'</li></a>';
			    }else {
	    	        //str_tmp += '<a href="link_p.php?targetpage='+playlist[s].targetpage+'&point=web_recomm&ref='+url_str+'" title="'+title+'" target="_blank"><li>'+end_title+'</li></a>';
			    	str_tmp += '<a  href="'+playlist[s].targetpage+'" lanmu1="'+playlist[s].targetpage+'" lanmu2="'+url_str+'" lanmu3="web_recomm"  title="'+title+'" target="_blank"><li id="web_type_l_flag'+playlistid+s+'">'+end_title+'</li></a>';//列表首次
			    }
	        }	
	        str_tmp += "</ul>";		        	        
        }else{//缩略图
        	$(".vedio-list .svedio .vl #vl_"+playlistid+" li").remove();
	        vedio_listRecent=(playlist.length/5)*828;	       
	        $(".vedio-list .svedio .vl vl_"+playlistid).css("width",vedio_listRecent+"px");
	        //获取视频列表详情
	        for(var k in playlist){
			    var vedio_title = decodeURIComponent(playlist[k]['title']); 
			    //end_vedio_title = showshort(vedio_title,'37');
			    
			    //end_vedio_title = showshort(vedio_title,'35');	
			    if (vedio_title.indexOf("《") == -1){
			    	 end_vedio_title = showshort(vedio_title,'37');
			    }else{
			    	 end_vedio_title = showshort(vedio_title,'35');
			    }			    			    
			    if (type=='video'){
    	        			    	
			    	vedio_tmp += "<li>";    	        	    	        	
    	        	vedio_tmp +="<a lanmu1='"+playlist[k].targetpage+"' lanmu2='"+url_str+"' lanmu3='video_recomm' href='"+playlist[k].targetpage+"' class='vimg' target='_blank' title='"+vedio_title+"'>";     	        	
       	        	vedio_tmp +="<img  id='video_s_flag"+playlistid+k+"' onerror=\"nofind('13880','"+playlistid+k+"');\" src='"+playlist[k].imagelink.replace("http://","https://")+"'/>";
       	        	if (playlist[k].duration<=0){
           	        	vedio_tmp +="<div class='pd_tim'><div class='tim'></div></div></a>";            	       	
       	        	} else {
          	        	vedio_tmp +="<div class='pd_tim'><div class='tim'>"+formatSeconds(playlist[k].duration)+"</div></div></a>";      	        		
       	        	}     	        	
       	        	vedio_tmp +="<a  lanmu1='"+playlist[k].targetpage+"' lanmu2='"+url_str+"' lanmu3='video_recomm' href='"+playlist[k].targetpage+"' target='_blank' title='"+vedio_title+"'><p class='bre' id='video_type_s_flag"+playlistid+k+"'>"+end_vedio_title+"</p></a>";   	        	
    	        	vedio_tmp += "</li>";
			    }else if (type=='audio'){

					vedio_tmp += "<li>";
					vedio_tmp +="<a lanmu1='"+playlist[k].targetpage+"' lanmu2='"+url_str+"' lanmu3='audio_recomm' href='"+playlist[k].targetpage+"' class='vimg' target='_blank' title='"+vedio_title+"'>";
					vedio_tmp +="<img  id='audio_s_flag"+playlistid+k+"' onerror=\"nofind('13880','"+playlistid+k+"');\" src='"+playlist[k].imagelink.replace("http://","https://")+"'/>";
					if (playlist[k].duration<=0){
						vedio_tmp +="<div class='pd_tim'><div class='tim'></div></div></a>";
					} else {
						vedio_tmp +="<div class='pd_tim'><div class='tim'>"+formatSeconds(playlist[k].duration)+"</div></div></a>";
					}
					vedio_tmp +="<a  lanmu1='"+playlist[k].targetpage+"' lanmu2='"+url_str+"' lanmu3='audio_recomm' href='"+playlist[k].targetpage+"' target='_blank' title='"+vedio_title+"'><p class='bre' id='audio_type_s_flag"+playlistid+k+"'>"+end_vedio_title+"</p></a>";
					vedio_tmp += "</li>";
				}else {
    	        	vedio_tmp += "<li>";
    	        	/*vedio_tmp +="<a href='link_p.php?targetpage="+playlist[k].targetpage+"&point=web_recomm&ref="+url_str+"' class='vimg' target='_blank' title='"+vedio_title+"'><img src='"+playlist[k].imagelink+"'/><div class='pd_tim'><div class='tim'>"+formatSeconds(playlist[k].duration)+"</div></div></a>";
    	        	vedio_tmp +="<a href='link_p.php?targetpage="+playlist[k].targetpage+"&point=web_recomm&ref="+url_str+"' target='_blank' title='"+vedio_title+"'><p class='bre'>"+end_vedio_title+"</p></a>";
    	        	*/
                    vedio_tmp +="<a lanmu1='"+playlist[k].targetpage+"' lanmu2='"+url_str+"' lanmu3='video_recomm' href='"+playlist[k].targetpage+"' class='vimg' target='_blank' title='"+vedio_title+"'>";     	        	
       	        	vedio_tmp +="<img  id='web_s_flag"+playlistid+k+"' onerror=\"nofind('web_s_flag','"+playlistid+k+"');\" src='"+playlist[k].imagelink.replace("http://","https://")+"'/>";
       	        	if (playlist[k].duration<=0){
           	        	vedio_tmp +="<div class='pd_tim'><div class='tim'></div></div></a>";            	       	
       	        	} else {
          	        	vedio_tmp +="<div class='pd_tim'><div class='tim'>"+formatSeconds(playlist[k].duration)+"</div></div></a>";      	        		
       	        	}       	           	     	
    	        	vedio_tmp +="<a  href='"+playlist[k].targetpage+"' lanmu1='"+playlist[k].targetpage+"' lanmu2='"+url_str+"' lanmu3='web_recomm' target='_blank' title='"+vedio_title+"'><p  id='web_type_s_flag"+playlistid+k+"' class='bre'>"+end_vedio_title+"</p></a>";
    	        	vedio_tmp += "</li>";    	        	
	    	    }
            }
        }       
	}
	}else {//点击月份状态
	    $(".ind-r .vedio-list .lvedio #vedio_con_"+playlistid.substr(1, 18)+" ul").remove();
		playlist =playlistArray[playlistid]['video'][datelist]; 

	    if (showtype =='list'){//列表
			//获取前列表详情		 
		    listRecent=Math.ceil((playlist.length/9)*735)+1000;
		    $(".lvedio #vedio_con_"+playlistid.substr(1, 18)).css("width",listRecent+"px");
		    str_tmp = "<ul>";	
		    
		    for(var s in playlist){
			    var title = decodeURIComponent(playlist[s]['title']); 	       		        
		        // return false;
			    end_title = showshort(title,'36');
		        if(s % 9== 0 && s != 0){  
		    	    str_tmp += "</ul><ul>";
		        }
		        if (type=='video'){			    	 
			       // str_tmp += '<a href="link_p.php?targetpage='+playlist[s].targetpage+'&point=video_recomm&ref='+url_str+'" title="'+title+'" target="_blank"><li>'+end_title+'</li></a>';
			        str_tmp += '<a  href="'+playlist[s].targetpage+'" lanmu1="'+playlist[s].targetpage+'" lanmu2="'+url_str+'" lanmu3="web_recomm"  title="'+title+'" target="_blank"><li id="web_m_flag'+playlistid+s+'">'+end_title+'</li></a>';
		        }else {			    	 
		            //str_tmp += '<a href="link_p.php?targetpage='+playlist[s].targetpage+'&point=web_recomm&ref='+url_str+'" title="'+title+'" target="_blank"><li>'+end_title+'</li></a>';
		        	str_tmp += '<a  href="'+playlist[s].targetpage+'" lanmu1="'+playlist[s].targetpage+'" lanmu2="'+url_str+'" lanmu3="web_recomm"  title="'+title+'" target="_blank"><li id="web_type_m_flag'+playlistid+s+'">'+end_title+'</li></a>';
		        	
		        }	 		                                                         
		    }
		    str_tmp += "</ul>";

		    
		}else {//缩略图
			$(".vedio-list .svedio .vl #vl_"+playlistid+" li").remove();
    	    $(".vedio-list .svedio .vl vl_"+playlistid).css("width","");
    	    vedio_listRecent=(playlist.length/5)*828;
    	    $(".vedio-list .svedio .vl #vl_"+playlistid).css("width",vedio_listRecent+"px");
	        //获取视频列表详情
		    for(var j in playlist){
			    var vedio_title = decodeURIComponent(playlist[j]['title']); 

			    //end_vedio_title = showshort(vedio_title,'37');
			    //end_vedio_title = showshort(vedio_title,'35');
			    
			    if (vedio_title.indexOf("《") == -1){
			    	 end_vedio_title = showshort(vedio_title,'37');
			    }else{
			    	 end_vedio_title = showshort(vedio_title,'35');
			    }		    
			    if (type=='video'){
    	        	vedio_tmp += "<li>";

    	            /*vedio_tmp +="<a href='link_p.php?targetpage="+playlist[j].targetpage+"&point=video_recomm&ref="+url_str+"' class='vimg' target='_blank' title='"+vedio_title+"'><img src='"+playlist[j].imagelink+"'/> <div class='pd_tim'><div class='tim'>"+formatSeconds(playlist[j].duration)+"</div></div></a>";    	            	        	
    	        	vedio_tmp +="<a href='link_p.php?targetpage="+playlist[j].targetpage+"&point=video_recomm&ref="+url_str+"' target='_blank' title='"+vedio_title+"'><p class='bre'>"+end_vedio_title+"</p></a>";*/           	   	        	
       	        	vedio_tmp +="<a  href='"+playlist[j].targetpage+"'  lanmu1='"+playlist[j].targetpage+"' lanmu2='"+url_str+"' lanmu3='video_recomm' class='vimg' target='_blank' title='"+vedio_title+"'>"; 	        	
       	        	vedio_tmp +="<img onerror=\"nofind('13780','"+playlistid+j+"');\" src='"+playlist[j].imagelink.replace('http://','https://')+"' id='video_ms_flag"+playlistid+j+"'/>";      	        	
       	        	if(playlist[j].duration<=0){
         	        	vedio_tmp +="<div class='pd_tim'><div class='tim'></div></div></a>";
       	        	}else{
         	        	vedio_tmp +="<div class='pd_tim'><div class='tim'>"+formatSeconds(playlist[j].duration)+"</div></div></a>"; 		
       	        	}         	        	
    	        	vedio_tmp +="<a href='"+playlist[j].targetpage+"' lanmu1='"+playlist[j].targetpage+"' lanmu2='"+url_str+"' lanmu3='video_recomm' target='_blank' title='"+vedio_title+"'><p class='bre'  id='video_type_ms_flag"+playlistid+j+"' >"+end_vedio_title+"</p></a>";    	       	
    	        	vedio_tmp += "</li>";
			    }else if (type=='audio'){
					vedio_tmp += "<li>";

					/*vedio_tmp +="<a href='link_p.php?targetpage="+playlist[j].targetpage+"&point=video_recomm&ref="+url_str+"' class='vimg' target='_blank' title='"+vedio_title+"'><img src='"+playlist[j].imagelink+"'/> <div class='pd_tim'><div class='tim'>"+formatSeconds(playlist[j].duration)+"</div></div></a>";
                    vedio_tmp +="<a href='link_p.php?targetpage="+playlist[j].targetpage+"&point=video_recomm&ref="+url_str+"' target='_blank' title='"+vedio_title+"'><p class='bre'>"+end_vedio_title+"</p></a>";*/
					vedio_tmp +="<a  href='"+playlist[j].targetpage+"'  lanmu1='"+playlist[j].targetpage+"' lanmu2='"+url_str+"' lanmu3='audio_recomm' class='vimg' target='_blank' title='"+vedio_title+"'>";
					vedio_tmp +="<img onerror=\"nofind('13780','"+playlistid+j+"');\" src='"+playlist[j].imagelink.replace('http://','https://')+"' id='audio_ms_flag"+playlistid+j+"'/>";
					if(playlist[j].duration<=0){
						vedio_tmp +="<div class='pd_tim'><div class='tim'></div></div></a>";
					}else{
						vedio_tmp +="<div class='pd_tim'><div class='tim'>"+formatSeconds(playlist[j].duration)+"</div></div></a>";
					}
					vedio_tmp +="<a href='"+playlist[j].targetpage+"' lanmu1='"+playlist[j].targetpage+"' lanmu2='"+url_str+"' lanmu3='audio_recomm' target='_blank' title='"+vedio_title+"'><p class='bre'  id='audio_type_ms_flag"+playlistid+j+"' >"+end_vedio_title+"</p></a>";
					vedio_tmp += "</li>";
				}else {
    	        	vedio_tmp += "<li>";
   	        	
    	         	//vedio_tmp +="<a href='link_p.php?targetpage="+playlist[j].targetpage+"&point=web_recomm&ref="+url_str+"' class='vimg' target='_blank' title='"+vedio_title+"'><img src='"+playlist[j].imagelink+"'/><div class='pd_tim'><div class='tim'>"+formatSeconds(playlist[j].duration)+"</div></div></a>";   	        	
    	        	//vedio_tmp +="<a href='link_p.php?targetpage="+playlist[j].targetpage+"&point=web_recomm&ref="+url_str+"' target='_blank' title='"+vedio_title+"'><p class='bre'>"+end_vedio_title+"</p></a>";
    	        	
    	        	vedio_tmp +="<a  href='"+playlist[j].targetpage+"'  lanmu1='"+playlist[j].targetpage+"' lanmu2='"+url_str+"' lanmu3='video_recomm' class='vimg' target='_blank' title='"+vedio_title+"'>";       	        	
       	        	vedio_tmp +="<img onerror=\"nofind('web_ms_flag','"+playlistid+j+"');\" src='"+playlist[j].imagelink.replace('http://','https://')+"' id='web_ms_flag"+playlistid+j+"'/>";      	        	
       	        	if(playlist[j].duration<=0){
         	        	vedio_tmp +="<div class='pd_tim'><div class='tim'></div></div></a>";
       	        	}else{
         	        	vedio_tmp +="<div class='pd_tim'><div class='tim'>"+formatSeconds(playlist[j].duration)+"</div></div></a>"; 		
       	        	}
    	        	
    	        	vedio_tmp +="<a href='"+playlist[j].targetpage+"' lanmu1='"+playlist[j].targetpage+"' lanmu2='"+url_str+"' lanmu3='web_recomm' target='_blank' title='"+vedio_title+"'><p class='bre'  id='web_type_ms_flag"+playlistid+j+"'>"+end_vedio_title+"</p></a>";       	
    	        	vedio_tmp += "</li>";
	    	    } 
		    }			
		}		 		  
	}
	if (showtype =='list'){
	    $(".ind-r .vedio-list .lvedio #vedio_con_"+playlistid.substr(1, 18)).css('margin-left','0px');
	    $(".ind-r .vedio-list .lvedio #vedio_con_"+playlistid.substr(1, 18)).append(str_tmp); 
	    //获取分页 
	    page_list(playlist,playlistid); 
	}else {
	    $(".vedio-list .svedio .vl #vl_"+playlistid).css('margin-left','0px');
		$(".vedio-list .svedio .vl #vl_"+playlistid).append(vedio_tmp); 		
		move_page(playlist,playlistid);
	}
}

//字符截断
function showshort(_str,_len)
{
	var len = 0;  
	var strLength = 0; 
	var str = "";
	for (var i=0; i<_str.length; i++) 
	{   
	   //转换成字节
	   var c = _str.charCodeAt(i);  
	   if ((c >= 0x0001 && c <= 0x007e) || (0xff60<=c && c<=0xff9f)) {   
		   len++;
		   strLength++;
	   }
	   else {  
		   len+=2;
		   strLength++;		   
	   }
	   if(len>=_len){	
		   str=_str.substring(0,strLength)+"...";
		   return str;
	   }
	}
	return _str;
}
//20180108 
var client_Height = document.documentElement.clientHeight;

function scrollgoto_top(div){
	var obj=$("#"+div);
	var scroll_width = $(window).width();
	var scroll_height = $(window).height();
	if (document.documentElement && document.documentElement.scrollTop){
		scroll_top = document.documentElement.scrollTop;
	}else if (document.body){
		scroll_top = document.body.scrollTop;  
	}
	if(scroll_top>scroll_height){
		obj.show();
	}else{
		obj.hide();
	}
	
}
	
window.onload=window.onresize=window.onscroll=function(){
	scrollgoto_top("goto_top");
	/*if($(window).scrollTop()>218){
		$(".search17354_ind04").addClass("totop");
	}else {
		$(".search17354_ind04").removeClass("totop");
	}*/
		
	
	/*if($(window).scrollTop()>218  && $(window).scrollTop()<900){
		$(".search17354_ind04").addClass("totop");
		console.log(111,$(window).scrollTop());
	}else if ( $(window).scrollTop()>900){
		$(".search17354_ind04").removeClass("totop");
		$(".search17354_ind04").css("position","fixed").css("bottom",276);
		console.log(222,$(window).scrollTop());
	}else {
		$(".search17354_ind04").removeClass("totop");
		$(".search17354_ind04").css("position","").css("bottom","");
		console.log(333,$(window).scrollTop());
	}*/
	if($(window).scrollTop()>218){
		$(".search17354_ind04").addClass("totop");
	}else {
		$(".search17354_ind04").removeClass("totop");	
	} 

	   var window_height = $(window).height();//窗口高度
		if (document.documentElement && document.documentElement.scrollTop){//文档根元素上滚动距离
			scroll_top = document.documentElement.scrollTop;
		}else if (document.body){
			scroll_top = document.body.scrollTop;  
		}
		
		//var scrollTop = window.pageYOffset  //用于苹果浏览器
 
		//var screen_availheight =window.screen.availHeight;//屏幕可用工作区高度
		//var screen_height = window.screen.height;//屏幕分辨率的高
		
		//console.log("文档根元素上滚动距离="+scroll_top,"窗口高度="+window_height,"文档实际高度="+$(document).height());
		
		if(scroll_top > window_height){					
			$(".bandbox").slideUp(600);//隐藏向上滑动元素
		}else{

			//$(".bandbox").slideDown(500);//向下滑动元素			
            if (scroll_top + window_height == $(document).height()) {  //滚动到底部执行事件            	  
            	$(".bandbox").slideUp(600);//隐藏向上滑动元素
            }else {
            	$(".bandbox").slideDown(500);//向下滑动元素    
            }
		}		
}
//do_get(dotype, value, obj,vtimeflag,datepidflag,channelflag)
//获取视频
//function get_data(currentPage,qtext,sort,type,vtime,datepid,channel,pageNum,pageflag){	
function get_data(currentPage,qtext,sort,type,vtime,datepid,channel,pageNum,pageflag,qtext_str){	
	var video_html ="";
    var findnum ="";
    var ref="";

    qtext =decodeURIComponent(String(qtext));   
    //添加加载状态结束	    
    $('.search17354_ind03 .ind03 .jieguo .outer .timg').css('display','block');
	var sub_title = "视频";
	if(type == "audio"){
		sub_title = "音频";
	}
	$.ajax({
	    url:"ifsearch.php",
	    type:"get",
	    async:false,
	    dataType:"json",
	    data:{page:currentPage,qtext:qtext,sort:sort,pageSize:pageNum,type:type,vtime:vtime,datepid:datepid,channel:channel,pageflag:pageflag,qtext_str:qtext_str},
	    success:function(re) {
	    	if (re.total <=0){	
//	    		$(".search17354_ind03").css('display','none');
//	    		var ref = setInterval(function(){
//	    			$('.search17354_ind03 .ind03 .jieguo .outer .timg').css('display','none');	    			
//	    			$(".ind03").css('display','blcok');
//	    			//get_data(currentPage,qtext,sort,type,vtime,datepid,channel,pageNum,pageflag);
//        	  },2000);
	    		//$(".col_w1015").html("");
				$(".jieguo").css('display','none');
				$(".search17354_wjg").css('display','block');
				$sub_title = "视频";
				if(type == "audio"){
					$sub_title = "音频";
				}
				var qtext_len ="";

				if(qtext_str.length>25){
					qtext_len = qtext_str.slice(0,25)+"...";
				}else {
					qtext_len = qtext_str;
				}
				findnum +='<span>《'+qtext_len+'》全部'+$sub_title+'结果共'+re.total+'条</span>';
				//findnum +='<span>《'+qtext+'》全部视频结果共'+re.total+'条</span>';
				$('.column_wrapper_w1200 .search17354_ind03 .lmdhd').html("");
				$('.column_wrapper_w1200 .search17354_ind03 .lmdhd').append(findnum);
	    		if ($(".search17354_wjg").length<1){

		    		$nohtml ="";
		    	    $nohtml +='<div class="search17354_wjg">';
		    		$nohtml +='<h3 class="tit">抱歉，没有找到“'+qtext+'”的相关“'+sub_title+'”结果</h3>';
		    		$nohtml +='<div class="jianyi">';
		    		$nohtml +='<span>建议您：</span>';
		    		$nohtml +='<ul>';
		    		$nohtml +='<li>检查输入的关键词是否有误</li>';
		    		$nohtml +='<li>缩短关键词</li>';
		    		$nohtml +='<li>使用相近，相同或其他语义的关键词</li>';
		    		$nohtml +='</ul>';
		    		$nohtml +='</div>';
		    		$nohtml +='</div> ';	    		
		    		// $(".col_w1015").append($nohtml);
		    		$(".search17354_ind03 .search17354_wjg").show();
	    		}
        	  return false;
          }
    	    if (re.total >0){
				$(".jieguo").css('display','block');
				$(".search17354_wjg").css('display','none');

                //添加加载状态
    	    	 $('.search17354_ind03 .ind03 .jieguo .outer .timg').css('display','none'); 
	        	//$('search17354_ind03 .lmdhd').html("");
    	    	 var qtext_len ="";

                 if(qtext_str.length>25){
                	 qtext_len = qtext_str.slice(0,25)+"...";
                 }else {
                	 qtext_len = qtext_str;
                 }
				 $sub_title = "视频";
    	    	 if(type == "audio"){
					 $sub_title = "音频";
				 }
    	    	 findnum +='<span>《'+qtext_len+'》全部'+$sub_title+'结果共'+re.total+'条</span>';
	        	//findnum +='<span>《'+qtext+'》全部视频结果共'+re.total+'条</span>';
	        	$('.column_wrapper_w1200 .search17354_ind03 .lmdhd').html("");
	        	$('.column_wrapper_w1200 .search17354_ind03 .lmdhd').append(findnum);
	        	 var date =re.list;

	        	 $('.search17354_ind03 .ind03 .jieguo ul').empty();
	        	var durations=0;
	            ref="ifsearch?qtext="+qtext+"&sort="+sort+"&type="+type+"&vtime="+vtime+"&datepid="+datepid+"&channel="+channel+"page="+currentPage;

				if(type == 'video') {
					video_html ='<ul class="video_ul_list">';
					for(var i in date){
						if (date[i].durations>0){
							durations =formatSeconds(date[i].durations) ;
						}else {
							durations ="";
						}

						video_html +='<li>';
						video_html +='<div class="jvedio">';
						/*					video_html +="<a href='link_p.php?targetpage="+date[i].urllink+"&point=video_normal&ref="+encodeURIComponent(ref)+"' lanmu1='"+date[i].urllink+"' lanmu2='"+ref+"' lanmu3='video_normal' class='image' title='"+date[i].all_title+"  "+date[i].uploadtime+"' target='_blank' alt='"+date[i].all_title + date[i].uploadtime+"'><img onerror=\"nofind('183102','"+i+"');\" src='"+date[i].imglink+"' id='img_"+i+"' /></a>";
                        */
						video_html +="<a href='link_p.php?targetpage="+encodeURIComponent(date[i].urllink)+"&point=video_normal&ref="+encodeURIComponent(ref)+"' lanmu1='"+date[i].urllink+"' lanmu2='"+ref+"' lanmu3='video_normal' class='image' title='"+date[i].all_title+"  "+date[i].uploadtime+"' target='_blank' alt='"+date[i].all_title + date[i].uploadtime+"'>";
						video_html +="<img onerror=\"nofind('183102','"+i+"');\"   onload=\"ResizeImage2(this,183,102,'"+i+"');\" src='"+date[i].imglink+"' id='play_img_"+i+"' />";
						video_html +="</a>";

						video_html +='<div class="pd_tim">';
						video_html +='<span class="pd">'+date[i].channel+'</span>';
						video_html +='<span class="tim">'+durations+'</span>';
						video_html +='</div>';
						video_html +='</div>';
						//video_html +="<a href='link_p.php?targetpage="+date[i].urllink+"&point=video_normal&ref="+encodeURIComponent(ref)+"' lanmu1='"+date[i].urllink+"' lanmu2='"+ref+"' lanmu3='video_normal' title='"+date[i].all_title+"' target='_blank'><h3 class='tit' id='video_img_tit"+i+"'><p class='img_tit' >"+date[i].title+"</p></h3></a>";

						//console.log(date[i].title);
						video_html +="<a href='link_p.php?targetpage="+encodeURIComponent(date[i].urllink)+"&point=video_normal&ref="+encodeURIComponent(ref)+"' lanmu1='"+date[i].urllink+"' lanmu2='"+ref+"' lanmu3='video_normal' title='"+date[i].all_title+"' target='_blank'><h3 class='tit' id='video_img_tit"+i+"'><p class='img_tit'> "+date[i].title+"</p></h3></a>";
						//video_html +="<a href='link_p.php?targetpage="+date[i].urllink+"&point=video_normal&ref="+encodeURIComponent(ref)+"' lanmu1='"+date[i].urllink+"' lanmu2='"+ref+"' lanmu3='video_normal' title='"+date[i].all_title+"' target='_blank'><h3 class='tit' id='video_img_tit"+i+"'><p class='img_tit' id='img_tit"+i+"' style='line-height:15px'>"+date[i].title+"</p></h3></a>";
						video_html +="</li>";
					}
					video_html +='</ul>';
				}else if(type == "audio"){
					video_html ='<ul class="audio_ul_list">';
					for(var i in date){

						if (date[i].durations>0){
							durations =formatSeconds(date[i].durations) ;
						}else {
							durations ="";
						}
						video_html +='<li>';
						video_html +="<a class='list_title audio_tit' style='width: unset !important;height: unset !important;' href='link_p.php?targetpage="+encodeURIComponent(date[i].urllink)+"&point=audio_normal&ref="+encodeURIComponent(ref)+"' lanmu1='"+date[i].urllink+"' lanmu2='"+ref+"' lanmu3='audio_normal'  title='"+date[i].all_title+"' target='_blank'>"+date[i].title+"</a>";

						video_html +='<div class="jvedio aud_dio">';
						video_html +='<div class="img-big">';
						/*					video_html +="<a href='link_p.php?targetpage="+date[i].urllink+"&point=video_normal&ref="+encodeURIComponent(ref)+"' lanmu1='"+date[i].urllink+"' lanmu2='"+ref+"' lanmu3='video_normal' class='image' title='"+date[i].all_title+"  "+date[i].uploadtime+"' target='_blank' alt='"+date[i].all_title + date[i].uploadtime+"'><img onerror=\"nofind('183102','"+i+"');\" src='"+date[i].imglink+"' id='img_"+i+"' /></a>";
                        */
						video_html +="<a href='link_p.php?targetpage="+encodeURIComponent(date[i].urllink)+"&point=audio_normal&ref="+encodeURIComponent(ref)+"' lanmu1='"+date[i].urllink+"' lanmu2='"+ref+"' lanmu3='audio_normal'  class='image' target='_blank' alt='"+date[i].all_title + date[i].uploadtime+"'>";
						video_html +="<img onerror=\"nofind('183102','"+i+"');\"   onload=\"ResizeImage2(this,183,102,'"+i+"');\" src='"+date[i].imglink+"' id='play_img_"+i+"'  width='120px'/>";
						video_html +='<span class="pd">'+date[i].channel+'</span>';
						video_html +='<img src="image/audio.png" class="pd audtags" style="width:unset !important;"/>';
						video_html +="</a>";
						video_html +='</div>';
						video_html +='<div class="text description_text">'+date[i].description+'</div>';
						video_html +='<div class="text" style="margin-bottom: 0px; height: 23px;font-size: 12px;">时长：'+date[i].duration+'</div>';
						video_html +='</div>';

						video_html +='<div class="pd_tim aud_tim">';

						video_html +='<span class="pds"></span>';
						video_html +='<span class="tim">发布时间：'+date[i].playtime+'</span>';
						video_html +='</div>';
						//video_html +="<a href='link_p.php?targetpage="+date[i].urllink+"&point=video_normal&ref="+encodeURIComponent(ref)+"' lanmu1='"+date[i].urllink+"' lanmu2='"+ref+"' lanmu3='video_normal' title='"+date[i].all_title+"' target='_blank'><h3 class='tit' id='video_img_tit"+i+"'><p class='img_tit' >"+date[i].title+"</p></h3></a>";

						//console.log(date[i].title);
						//video_html +="<a href='link_p.php?targetpage="+date[i].urllink+"&point=video_normal&ref="+encodeURIComponent(ref)+"' lanmu1='"+date[i].urllink+"' lanmu2='"+ref+"' lanmu3='video_normal' title='"+date[i].all_title+"' target='_blank'><h3 class='tit' id='video_img_tit"+i+"'><p class='img_tit' id='img_tit"+i+"' style='line-height:15px'>"+date[i].title+"</p></h3></a>";
						video_html +="</li>";
					}
					video_html +='</ul>';
				}



			$('.search17354_ind03 .ind03 .jieguo .list').append(video_html);

			     /**视频标题截取开始*/
                var p_titles = $(".img_tit");
                 for (var i = 0; i < p_titles.length; i++){
                	var $p = $(".outer ul li a h3");
                    var sheight =0;
                    sheight = $p[i].scrollHeight;
                    if (sheight>30 && sheight>p_titles.height() || sheight>30){
	                    // if(navigator.appName == "Microsoft Internet Explorer" && navigator.appVersion .split(";")[1].replace(/[ ]/g,"")=="MSIE8.0") 
	                   	//  {
	                   	// 	 $clamp(p_titles[i], {clamp:4,useNativeClamp: false});
	                   	//  } else {
	                   	// 	 $clamp(p_titles[i], {clamp:2,useNativeClamp: false});
	                   	//  }
	                    var isMac = (navigator.platform == "Mac68K") || (navigator.platform == "MacPPC") || (navigator.platform == "Macintosh") || (navigator.platform == "MacIntel");
                    	//var isMac2 = navigator.userAgent.indexOf('Mac')>=0;//浏览器用于 HTTP 请求的用户代理头的值
                    	if(!isMac){//0324浏览器的操作系统和（或）硬件平台
	                        if(navigator.appName == "Microsoft Internet Explorer" && navigator.appVersion .split(";")[1].replace(/[ ]/g,"")=="MSIE8.0") 
		                   	{
		                   		$clamp(p_titles[i], {clamp:4,useNativeClamp: false});
		                   	} else {
		                   		$clamp(p_titles[i], {clamp:2,useNativeClamp: false});
		                   	}
                    	}

                    	/*$lineEllipsis({
        					id:"img_tit"+i,
        					rows:2
        				})*/
                   }
                }

			  /**视频标题截取结束*/
                //显示分页
                pageHtml ="";
                for (var s in re.pageString){
                    pageHtml+=re.pageString[s];
                }
                $('.search17354_ind03 .ind03 .jieguo .page').html("");
				$('.search17354_ind03 .ind03 .jieguo .page').append(pageHtml); 
 
			    //显示频道列表			     
			     var channels =re.channels;
			     var channels_html =''; 
			     channels_html +='<span onclick="do_get(3,\'不限\',this)" flag="不限" ';
			     if (channelflag =='不限'){
			         channels_html +='class ="cur" ';
                 } 
			     channels_html +='><table width="100%" height="100%" cellspacing="0" cellpadding="0">';
		    	 channels_html +='<tbody>';
		    	 channels_html +='<tr>';
		    	 channels_html +='<td valign="middle" align="center">';
		    	 channels_html +='不限</td>';
		    	 channels_html +='</tr>';
		    	 channels_html +='</tbody>';
		    	 channels_html +='</table>';
			     channels_html +='</span>';
			     for (var k in channels){
			    	 channels_html +='<span onclick="do_get(3,\''+channels[k].NAME+'\',this)" flag="'+channels[k].NAME+'"';			    	
			    	 if (channelflag==channels[k].NAME){
                    	 channels_html +='class ="cur" ';
                     }
			    	 channels_html +='><table width="100%" height="100%" cellspacing="0" cellpadding="0">';
			    	 channels_html +='<tbody>';
			    	 channels_html +='<tr>';
			    	 channels_html +='<td valign="middle" align="center">';
			    	 channels_html +=channels[k].NAME;
			    	 channels_html +='</td>';
			    	 channels_html +='</tr>';
			    	 channels_html +='</tbody>';
			    	 channels_html +='</table>';
			    	 channels_html +='</span>';
                     
  	    		}
			     $(".search17354_ind03 .ind03 .cla ul .sply  .fenlei").html("");
			     $(".search17354_ind03 .ind03 .cla ul .sply  .fenlei").append(channels_html);
                	     
			     //显示视频时长	    				   	                        
			     var timespans=new Array();
                 timespans = re.timespans;
                 var timespans_html ='';                     
                 timespans_html +='<span onclick="do_get(1,-1, this)" flag="-1" ';
                  if (vtimeflag =='-1'){
                     timespans_html +='class ="cur" ';
                  } 
                 timespans_html +='>不限</span>'; 
                 for (var k1 in timespans){ 
                	 timespans_html +='<span onclick="do_get(1,'+k1+', this)" flag="'+k1+'"';
                     if (vtimeflag ==k1 ) {
                        timespans_html +=' class ="cur" ';
                     }
                	 timespans_html += '>'+timespans[k1].NAME+'</span>';
                 }
                 $(".search17354_ind03 .ind03 .cla ul .spsc  .fenlei").html("");
			     $(".search17354_ind03 .ind03 .cla ul .spsc  .fenlei").append(timespans_html);
                //显示发布时间
			     var daytimes=new Array();
			     daytimes =re.daytimes;
			     var daytimes_html='';
			     daytimes_html += '<span onclick="do_get(2,1, this)" flag="1" ';
			      if (datepidflag =='1' ) {
			    	 daytimes_html +=' class ="cur" ';
                  } 	   			     
			     daytimes_html += '>不限</span>';
			     for (var k2 in daytimes){
			    	 daytimes_html += '<span onclick="do_get(2,'+k2+', this)" flag="'+k2+'"';
			    	 if (datepidflag ==k2 ) {
			    		 daytimes_html +=' class ="cur"';
                     }
			    	 daytimes_html += '>'+daytimes[k2].NAME+'</span>';
			     }
                 $(".search17354_ind03 .ind03 .cla ul .fbsj  .fenlei").html("");
			     $(".search17354_ind03 .ind03 .cla ul .fbsj  .fenlei").append(daytimes_html);			    
                 //指定跳转位置
                 ++pageflag;
                 if (pageflag !=1){
    			     var t = $('#accountspan').offset().top;
    			     $("html,body").animate({ scrollTop: t}, 50); 
                 }
	 	    }else {
	 	    	if(toplistArray!=undefined&&toplistArray.length>0)
	         	{
 	          		get_noresult(toplistArray,'video');
	         	} 
	        }   
    	    
    	    $("#tb-beacon-aplus").remove();
    	    with(document)with(body)with(insertBefore(createElement("script"),firstChild))setAttribute("exparams","v_id=&aplus&",id="tb-beacon-aplus",src=(location>"https"?"//js":"//js")+".data.cctv.com/__aplus_plugin_cctv.js,aplus_plugin_aplus_u.js")
		}
    });	 
}

function do_get(dotype, value, obj){

	switch(dotype){
	//获取视频时长
	    case 1: //时长
	    	vtimeflag = $(obj).attr('flag');
	    	vtime = value;
		break;
		case 2: //发布时间
			datepidflag = $(obj).attr('flag');
			datepid = value;
		break;
		case 3: //视频来源
			channelflag = $(obj).attr('flag');
			channel = value;
		break;
		case 4: //排序和相关度
			$('.xgd .clas').removeClass("cur");
			$('.zxfb .clas').removeClass("cur");	
			sort =value;
		break;
	}			
	currentPage = 1;
	$(obj).siblings().removeClass();
	$(obj).addClass("cur");			
	//get_data(currentPage);
	
	//var qtext_str =$("#qtext_str").val();	
	var qtext_str =htmlEncodeByRegExp($("#qtext_str").val());
	get_data(currentPage,qtext,sort,type,vtime,datepid,channel,pageNum,pageflag,qtext_str);
	//get_data(currentPage,qtext,sort,type,vtime,datepid,channel,pageNum,pageflag);
}
//20180921开始
function  htmlEncodeByRegExp(str){  
    var s = "";
    if(str.length == 0) return "";
    s = str.replace(/&/g,"&amp;");
    s = s.replace(/</g,"&lt;");
    s = s.replace(/>/g,"&gt;");
    s = s.replace(/ /g,"&nbsp;");
    s = s.replace(/\'/g,"&#39;");
    s = s.replace(/\"/g,"&quot;");
    return s;  
}
//20180921结束

function get_wyly(qtext,page,type,sort,datepid,channel,vtime){
	window.location.href="search.php?qtext="+qtext+"&page="+page+"&type="+type+"&sort="+sort+"&datepid="+datepid+"&channel="+channel+"&vtime="+vtime+"&is_search=1";
}

function nofind(type,obj){	
	var imgstr  ="";
	if (type=='243307'){
    	imgstr ="#img_"+obj;
    	$(".ind01 .image table tr td "+imgstr).attr("src", "style/noImg/243307.png");
    }else if (type=='149177'){
	    imgstr ="#img_"+obj;
	    $(".ind06 .outer .post li "+imgstr).attr("src", "style/noImg/149177.png");
    }else if (type=='183102'){
    	//imgstr ="#img_"+obj;
    	imgstr ="#play_img_"+obj;
    	$(".ind03 .jieguo .outer ul li .jvedio "+imgstr).css("margin-left","");
    	$(".ind03 .jieguo .outer ul li .jvedio "+imgstr).css("background-color","#f7f7f7");
    	$(".ind03 .jieguo .outer ul li .jvedio "+imgstr).attr("src", "style/noImg/183102.png");
    }else if (type=='12068'){
    	imgstr ="#img_"+obj;
    	$(".ind03 .tuwenjg .outer ul .image .tright .bre "+imgstr).attr("src", "style/noImg/12068.png");
    }else if (type="13880"){//视频子视频
    	imgstr ="#video_s_flag"+obj;  	
    	$(".svedio .vl ul li "+imgstr).attr("src", "style/noImg/183102.png");
    }else if (type="web_s_flag"){
    	imgstr ="#web_s_flag"+obj;
    	$(".svedio .vl ul li "+imgstr).attr("src", "style/noImg/183102.png");
    }else if (type="web_ms_flag"){
    	imgstr ="#web_ms_flag"+obj;
    	$(".svedio .vl ul li "+imgstr).attr("src", "style/noImg/183102.png")
    }else if (type="13780"){//点击月份之后子视频
    	imgstr ="#video_ms_flag"+obj;
    	$(".svedio .vl ul li "+imgstr).attr("src", "style/noImg/183102.png");
    }
	var img=event.srcElement;  // 声明对象
	img.onerror=null;//控制不要一直跳动
}


//20180626开始
function strlen(str){
    var len = 0;
    for (var i=0; i<str.length; i++) { 
     var c = str.charcodeat(i); 
    //单字节加1 
     if ((c >= 0x0001 && c <= 0x007e) || (0xff60<=c && c<=0xff9f)) { 
       len++; 
     } 
     else { 
      len+=2; 
     } 
    } 
    return len;
}
//20180626结束

//20180703开始
function get_url(target,ref,point,flag){	
	$.ajax({
		url:"action.php",
	    type:"get",
	    async:false,
	    //async:true,
	    dataType:"json",
	    data:{targetpage:target,point:point,ref:ref,flag:flag},
	    success:function(re) {	
	    }
	    
	});
	
}

$(function(){
	$(document).click(function (e){
		var target="";
		var ref  ="";
		var v_id="";
		var point=""
		v_id = $(e.target).attr('id');
		if (v_id !=undefined){
			target = $(e.target).parent().attr('lanmu1');
			ref  = $(e.target).parent().attr("lanmu2");
			point  = $(e.target).parent().attr("lanmu3");
			//get_url(encodeURIComponent(target),encodeURIComponent(ref),point,v_id);
			if (target !=undefined && ref !=undefined){
				get_url(target,ref,point,v_id);
			}			
		}else {
			target = $(e.target).parent().parent().attr('lanmu1');
			ref  = $(e.target).parent().parent().attr("lanmu2");
			point  = $(e.target).parent().parent().attr("lanmu3");
			//get_url(encodeURIComponent(target),encodeURIComponent(ref),point,v_id);
			if (target !=undefined && ref !=undefined){
				get_url(target,ref,point,v_id);				
			}
		}
	});
})
//20180703结束