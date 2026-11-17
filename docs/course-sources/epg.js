//获取时间浮标开始
function getTimedis(_now){
  var _h = _now.getHours();
  var	_m = _now.getMinutes();
  var moveDistance = 0;
  if(_h==0){
      moveDistance = 0;
  }else{
      if(_m>=30 && _m <=60){
          if(_h==23){
              moveDistance = 280 *(2*_h-1);
          }else{
              moveDistance = 280 * 2*_h;
          }
      }
      else{
          moveDistance = 280 *(2*_h-1)>0?280 *(2*_h-1):0;
      }
  }
  $(".rightbox").scrollLeft(moveDistance);
  var leftTimedis = 280 * 2*_h + 280/30*_m;
  $(".nowTime").css("left",leftTimedis+"px");
  $(".timeMarker").css("left",leftTimedis+"px");
  $(".nowTime").show();
  $(".timeMarker").show();
}
//获取时间浮标结束
//function setItem1(data){
function setItem1(data,url,domain){
	 
	for(var a in data){
	  var listId = "";
	  var ulStr ="";
	  listId = a;/*cctv1*/
	  //获取频道名称并放入页面
	  $(".channelName").html(listId);
	  //$(".channelChinses").html(data[a].channelName+"频道");
	  $(".channelChinses").html(data[a].z_channelName);

	 
	  var liveSt = _now.valueOf()/1000;
	  var zhibo="";
	  var huibo  ="";
	  var weibo="";
    if(data[a].program){
      for(i=0;i<data[a].program.length;i++){
          var stime = new Date(data[a].program[i].st*1000),
          etime = new Date(data[a].program[i].et*1000),
          dtime = data[a].program[i].duration/60,
          perminutes = 280/30,
          li_length = perminutes*dtime-1;
          zhibo = "https://tv."+domain+"/live/"+data[a].channelName+"/";
          huibo = "https://tv."+domain+"/live/"+data[a].channelName+"/index.shtml?stime="+data[a].program[i].st+"&etime="+data[a].program[i].et+"&type=lbacks";
          weibo ="https://tv."+domain+"/epg/";
          //console.log(stime);
        if(i==0){
            var h = stime.getHours();
            var m = stime.getMinutes()+h*60;
            if(m>=0){
                ulStr += "<li style=\"width:"+(m*perminutes-1)+"px\"></li>";
            }
        }
        if( liveSt==undefined || liveSt=="" ){
            liveSt = _now.valueOf()/1000;
        }
        var hh_s = stime.getHours()>9?stime.getHours():"0"+stime.getHours();
        var hh_e = etime.getHours()>9?etime.getHours():"0"+etime.getHours();
        var mm_s = stime.getMinutes()>9?stime.getMinutes():"0"+stime.getMinutes();
        var mm_e = etime.getMinutes()>9?etime.getMinutes():"0"+etime.getMinutes();
        if(data[a].program[i].st<liveSt&&data[a].program[i].et>liveSt){
            ulStr += "<li style=\"width:"+li_length+"px\" class=\"cur\"> <div class=\"innerbox\">";

          //ulStr +="<h3 title=\""+data[a].program[i].t+"\"><a target='_blank' href=\"link_p.php?targetpage="+encodeURIComponent(zhibo)+"&point=pindao&ref="+url+"\">"+data[a].program[i].t+"</a></h3>";
          ulStr +="<h3 title=\""+data[a].program[i].t+"\"><span lanmu1=\""+zhibo+"\" lanmu2=\""+url+"\" lanmu3='pindao'><a target='_blank' id='zhibo_"+i+"' href=\""+zhibo+"\">"+data[a].program[i].t+"</a></span></h3>";
          ulStr += "<p><span>"+hh_s+":"+mm_s+"</span>~<span>"+hh_e+":"+mm_e+"</span></p>";
          //ulStr += "<p><a target='_blank' href=\"link_p.php?targetpage="+encodeURIComponent(zhibo)+"&point=pindao&ref="+url+"\" stime='"+data[a].program[i].st+"' class='huikan' style='color:#f00'>直播</a></p>";
          ulStr += "<p><span lanmu1='"+zhibo+"' lanmu2='"+url+"' lanmu3='pindao'><a target='_blank' id='zhibo_flag_"+i+"' href=\""+zhibo+"\" stime='"+data[a].program[i].st+"' class='huikan' style='color:#f00'>直播</a></span></p>";
        }else{
            if(liveSt>data[a].program[i].et){
                ulStr += "<li style=\"width:"+li_length+"px\"> <div class=\"innerbox\">";
                //ulStr +="<h3 title=\""+data[a].program[i].t+"\"><a target='_blank' href=\"link_p.php?targetpage="+encodeURIComponent(huibo)+"&point=pindao&ref="+url+"\">"+data[a].program[i].t+"</a></h3>";
                ulStr +="<h3 title=\""+data[a].program[i].t+"\"><span lanmu1='"+huibo+"' lanmu2='"+url+"' lanmu3='pindao'><a target='_blank' id='huibo_"+i+"' href=\""+huibo+"\">"+data[a].program[i].t+"</a></span></h3>";
                ulStr += "<p><span>"+hh_s+":"+mm_s+"</span>~<span>"+hh_e+":"+mm_e+"</span></p>";
                //ulStr += "<p><a target='_blank' href=\"link_p.php?targetpage="+encodeURIComponent(huibo)+"&point=pindao&ref="+url+"\" class='huikan' style='color:#1e63b0' stime='"+data[a].program[i].st+"'>回看</a></p>";
                ulStr += "<p><span lanmu1='"+huibo+"' lanmu2='"+url+"' lanmu3='pindao'><a target='_blank' href=\""+huibo+"\" id='huibo_flag_"+i+"' class='huikan' style='color:#1e63b0' stime='"+data[a].program[i].st+"'>回看</a></span></p>";
            }else if(liveSt<data[a].program[i].st){
                ulStr += "<li style=\"width:"+li_length+"px\"> <div class=\"innerbox\">";
                //ulStr +="<h3 title=\""+data[a].program[i].t+"\"><a target='_blank' href=\"link_p.php?targetpage="+encodeURIComponent(zhibo)+"&point=pindao&ref="+url+"\" >"+data[a].program[i].t+"</a></h3>";
                ulStr +="<h3 title=\""+data[a].program[i].t+"\"><span lanmu1='"+zhibo+"' lanmu2='"+url+"' lanmu3='pindao'><a target='_blank' href=\""+zhibo+"\" id='pindao_"+i+"'>"+data[a].program[i].t+"</a></span></h3>";
                ulStr += "<p stime='"+data[a].program[i].st+"' class='no'><span>"+hh_s+":"+mm_s+"</span>~<span>"+hh_e+":"+mm_e+"</span></p>";

            }
        }
          ulStr += "</div></li>";
      }
    }

	  $("#cctvName").append(ulStr);
	}

  }


var moveTimeByBtn = {
        ismove:false,
        next:function(){
            if(this.ismove==true){
                return false;
            }else{
                var dis = $(".rightbox").scrollLeft();
                if(dis == $(".rightbox").attr("data-len")-840){
                    return false;
                }else{
                    this.ismove = true;
                    dis += 280*3;
                    if(dis>=$(".rightbox").attr("data-len")){
                        dis=$(".rightbox").attr("data-len");
                    }
                    $(".rightbox").animate({"scrollLeft":dis+"px"},300,function(){
                        moveTimeByBtn.ismove=false;
                        getPadding();
                    });
                }

            }

        },
        prev:function(){
            if(this.ismove==true){
                return false;
            }else{
                var dis = $(".rightbox").scrollLeft();
                if(dis<=0){
                    return false;
                }else{
                    this.ismove = true;
                    dis -= 280*3;
                    if(dis<=0){
                        dis=0;
                    }
                    $(".rightbox").animate({"scrollLeft":dis+"px"},300,function(){
                        moveTimeByBtn.ismove=false;
                        getPadding();
                    });
                }


            }

        }
    }

function getPadding(){
    var dis = $(".rightbox").scrollLeft();
    var ul = $(".epglist ul");
    for(var a=0;a<ul.length;a++){
        var li  = ul.eq(a).find("li");
        var liLength = 0;
        for(var i = 0;i<li.length;i++){
            liLength += (parseInt($(li).eq(i).css("width"))+1);
            if(liLength>=dis){
                var paddingLeft = parseInt($(li).eq(i).css("width"))+1-(liLength-dis);
                $(li).eq(i).find(".innerbox").animate({"paddingLeft":paddingLeft+"px"},10);
                $(li).eq(i).siblings().find(".innerbox").css("paddingLeft","0px");
                continue  ;
            }
        }
    }

}


/**获取栏目方法*/
/**0447时间方法*/
function showdate(n)  
{  
	var tomorrow_times ="";
	var uom = new Date(new Date()-0+n*86400000); 
	
	//uom = uom.getFullYear() + "-" + (uom.getMonth()+1) + "-" + uom.getDate(); 	
	uom = uom.getFullYear() + "/" + (uom.getMonth()+1) + "/" + uom.getDate()+" 00:00:00";
	//uom = uom.getFullYear()+"-"+((uom.getMonth()+1)>=10?+(uom.getMonth()+1):"0"+(uom.getMonth()+1))+"-" + uom.getDate();
	//return uom; 

	//转化为时间戳开始
	var timestamp2 = Date.parse(new Date(uom));		
	tomorrow_times = timestamp2 / 1000;
	//转化为时间戳结束
	return tomorrow_times;  
}  
/**0447时间方法*/


//function getlanmulist(data){
function getlanmulist(data,url,domain){  
	var liStr='';
	var zhibo ="";
	var huibo =""
	var weibo="";
    for(var i=0;i< data.length; i++){
        var stime = new Date(data[i].starttime*1000);
        var etime = new Date(data[i].endtime*1000);
        var hh_s = stime.getHours()>9?stime.getHours():"0"+stime.getHours();
        var hh_e = etime.getHours()>9?etime.getHours():"0"+etime.getHours();
        var mm_s = stime.getMinutes()>9?stime.getMinutes():"0"+stime.getMinutes();
        var mm_e = etime.getMinutes()>9?etime.getMinutes():"0"+etime.getMinutes();
        var liveSt = _now.valueOf()/1000;
        
        zhibo ="https://tv."+domain+"/live/"+data[i].pindao+"/";
        huibo ="https://tv."+domain+"/live/"+data[i].pindao+"/index.shtml?type=lbacks&stime="+data[i].starttime+"&etime="+data[i].endtime;
        weibo ="https://tv."+domain+"/epg/";
	    /*  if(i<3 ||i==3  ) {
	          if (data[i].starttime < liveSt && data[i].endtime > liveSt) {
	              liStr += '<li class="listbox_li" id="lanmuli_'+i+'"><div class="listbox_live epg_cur">直播中 </div><div class="listbox_channel">' + data[i].s_pindao + '</div><div class="listbox_name"><a target="_blank" href="link_p.php?targetpage='+encodeURIComponent(zhibo)+'&point=lanmu&ref='+url+'">《'+data[i].ptitle+'》</a></div></li>';	          	          
	          } else if (liveSt > data[i].endtime) {//回播
	              liStr += '<li class="listbox_li" id="lanmuli_'+i+'"><div class="listbox_live listcur">' + hh_s + ':' + mm_s + '</div><div class="listbox_channel">' + data[i].s_pindao + '</div><div class="listbox_name"><a target="_blank" href="link_p.php?targetpage='+encodeURIComponent(huibo)+'&point=lanmu&ref='+url+'">《' + data[i].ptitle + '》</a></div></li>';
	         	     	          
	          } else if(liveSt < data[i].starttime) {//未播
	              liStr += '<li class="listbox_li" id="lanmuli_'+i+'"><div class="listbox_live">' + hh_s + ':' + mm_s + '</div><div class="listbox_channel">' + data[i].s_pindao + '</div><div class="listbox_name"><a target="_blank" href="link_p.php?targetpage='+encodeURIComponent(zhibo)+'&point=lanmu&ref='+url+'">《' + data[i].ptitle + '》</a></div></li>';
	          }	          
	       }else{
	          if (data[i].starttime <liveSt  &&  data[i].endtime>liveSt  ) {
	              liStr += '<li class="listbox_li"  id="lanmuli_'+i+'" style="display:none"><div class="listbox_live epg_cur">直播中 </div><div class="listbox_channel">' + data[i].s_pindao + '</div><div class="listbox_name"><a target="_blank" href="link_p.php?targetpage='+encodeURIComponent(zhibo)+'&point=lanmu&ref='+url+'">《'+data[i].ptitle+'》</a></div></li>';
	          } else if (liveSt > data[i].endtime) {
	                  liStr += '<li class="listbox_li" id="lanmuli_'+i+'" style="display:none"><div class="listbox_live listcur">' + hh_s + ':' + mm_s + '</div><div class="listbox_channel">' + data[i].s_pindao + '</div><div class="listbox_name"><a target="_blank" href="link_p.php?targetpage='+encodeURIComponent(huibo)+'&point=lanmu&ref='+url+'">《' + data[i].ptitle + '》</a></div></li>';
	          } else if (liveSt < data[i].starttime) {
	                  liStr += '<li class="listbox_li" id="lanmuli_'+i+'" style="display:none"><div class="listbox_live">' + hh_s + ':' + mm_s + '</div><div class="listbox_channel">' + data[i].s_pindao + '</div><div class="listbox_name"><a target="_blank" href="link_p.php?targetpage='+encodeURIComponent(zhibo)+'&point=lanmu&ref='+url+'" >《' + data[i].ptitle + '》</a></div></li>';
	          }
	       }*/
        if (data[i].starttime < liveSt && data[i].endtime > liveSt) {
              //liStr += '<li class="listbox_li" id="lanmuli_'+i+'"><div class="listbox_live epg_cur">直播中 </div><div class="listbox_channel">' + data[i].s_pindao + '</div><div class="listbox_name"><a target="_blank" href="link_p.php?targetpage='+encodeURIComponent(zhibo)+'&point=lanmu&ref='+url+'">《'+data[i].ptitle+'》</a></div></li>';	          	          
              liStr += '<li class="listbox_li" id="lanmuli_'+i+'"><div class="listbox_live epg_cur">直播中 </div><div class="listbox_channel">' + data[i].s_pindao + '</div><div class="listbox_name"><span lanmu1="'+zhibo+'" lanmu2="'+url+'" lanmu3="lanmu"><a target="_blank"  id="lanmu_zhibo_'+i+'" href="'+zhibo+'">《'+data[i].ptitle+'》</a></span></div></li>';	          	          
        
        
        } else if (liveSt > data[i].endtime) {//回播
             // liStr += '<li class="listbox_li" id="lanmuli_'+i+'"><div class="listbox_live listcur">' + hh_s + ':' + mm_s + '</div><div class="listbox_channel">' + data[i].s_pindao + '</div><div class="listbox_name"><a target="_blank" href="link_p.php?targetpage='+encodeURIComponent(huibo)+'&point=lanmu&ref='+url+'">《' + data[i].ptitle + '》</a></div></li>';	         	     	          
        
              liStr += '<li class="listbox_li" id="lanmuli_'+i+'"><div class="listbox_live listcur">' + hh_s + ':' + mm_s + '</div><div class="listbox_channel">' + data[i].s_pindao + '</div><div class="listbox_name"><sapn lanmu1="'+huibo+'" lanmu2="'+url+'" lanmu3="lanmu"><a target="_blank" href="'+huibo+'" id="lanmu_huibo_'+i+'" >《' + data[i].ptitle + '》</a></sapn></div></li>';	         	     	          
     
        } else if(liveSt < data[i].starttime) {//未播        	
              //liStr += '<li class="listbox_li" id="lanmuli_'+i+'"><div class="listbox_live">' + hh_s + ':' + mm_s + '</div><div class="listbox_channel">' + data[i].s_pindao + '</div><div class="listbox_name"><a target="_blank" href="link_p.php?targetpage='+encodeURIComponent(zhibo)+'&point=lanmu&ref='+url+'">《' + data[i].ptitle + '》</a></div></li>';
                         
              //判断是否是次日数据开始             
              var tomorrow_times = showdate(1);               
              if (data[i].starttime>=tomorrow_times){//次日数据
             
                  //liStr += '<li class="listbox_li" id="lanmuli_'+i+'"><div class="listbox_live"> 次日  ' + hh_s + ':' + mm_s + '</div><div class="listbox_channel">' + data[i].s_pindao + '</div><div class="listbox_name"><a target="_blank" href="link_p.php?targetpage='+encodeURIComponent(zhibo)+'&point=lanmu&ref='+url+'">《' + data[i].ptitle + '》</a></div></li>';                             	  
                  liStr += '<li class="listbox_li" id="lanmuli_'+i+'"><div class="listbox_live"> 次日  ' + hh_s + ':' + mm_s + '</div><div class="listbox_channel">' + data[i].s_pindao + '</div><div class="listbox_name"><sapn lanmu1="'+zhibo+'" lanmu2="'+url+'" lanmu3="lanmu"><a target="_blank" href="'+zhibo+'" id="lanmu_weibo_c_'+i+'">《' + data[i].ptitle + '》</a></span></div></li>'; 
              
              }else {
                  //liStr += '<li class="listbox_li" id="lanmuli_'+i+'"><div class="listbox_live">' + hh_s + ':' + mm_s + '</div><div class="listbox_channel">' + data[i].s_pindao + '</div><div class="listbox_name"><a target="_blank" href="link_p.php?targetpage='+encodeURIComponent(zhibo)+'&point=lanmu&ref='+url+'">《' + data[i].ptitle + '》</a></div></li>';
                  liStr += '<li class="listbox_li" id="lanmuli_'+i+'"><div class="listbox_live">' + hh_s + ':' + mm_s + '</div><div class="listbox_channel">' + data[i].s_pindao + '</div><div class="listbox_name"><span lanmu1="'+zhibo+'" lanmu2="'+url+'" lanmu3="lanmu"><a target="_blank" href="'+zhibo+'" id="lanmu_weibo_'+i+'">《' + data[i].ptitle + '》</a></span></div></li>';            	  
              }
        }	      
    }
    $("#listbox").append(liStr);
    $(".bandbox_button").css("display","none")
    /*if(data.length>4){
    	
    }else{
        //隐藏全部按钮
        $(".bandbox_button").css("display","none")
    }*/
    /*if (data.length<=4){
    	$(".bandbox_button").css("display","none");
    }*/
}


function showli_list(){
	if ($(".bandbox_button").attr("flag")==0){
		 $(".listbox_li").css("display","block"); 
			$(".bandbox_button").attr("flag","1");
			$(".bandbox_button").html("收起信息<<");
	}else {
		$(".bandbox_button").attr("flag","0");
		$(".bandbox_button").html("全部信息>>");												
		 for(var i=0;i<$(".listbox_li").length;i++){
           if (i>3){
           	$("#lanmuli_"+i).css("display","none");            
           }
		} 
	}
}

