/*下拉框功能*/
var checkFlag=true;
var _ajax2;
var selectSuggestNum=-1;
var _oldtext="";
var _suggest =0;
var qtextHTML ="";
/* 键盘点击*/
document.getElementById("search_qtext").onkeydown = function(){
	var event = window.event || arguments[0];
	if (event.keyCode == 13)
	{//回车
        
		try {
            event.cancelBubble = true;
            event.returnValue = false;
            event.stopPropagation();
            event.preventDefault();
   
        } 
        catch (e) {
        }
        //var httpflag = document.getElementById("httptype").value;
        clickSuggest(filterXSS(document.getElementById("search_qtext").value));
    }
	if(event.keyCode == 40||event.keyCode == 38)
	{
		var keycode = event.keyCode;
		if(keycode == 40||keycode == 38)
		{
			//向下向上
			changeSuggest(keycode);
			
		}
	}
	if(event.keyCode >=16&&event.keyCode<=47||event.keyCode == 13)
	{
		checkFlag=false;
	}else{
		checkFlag=true;
	}
	
}

function changeSuggest(keycode)
{
	
	var rownum=document.getElementById("suggestlist").getElementsByTagName("li").length;
	
	if(selectSuggestNum==-1||selectSuggestNum==undefined)
	{
		if(keycode==40) rowON=0;
		if(keycode==38) rowON=rownum+selectSuggestNum;
	}else{
		if(keycode==40) rowON=selectSuggestNum+1;
		if(keycode==38) rowON=selectSuggestNum-1;

	}
	if(rowON<0||rowON>=rownum)
	{		
		resetSelect();
		return false;
	}else{
		qtextHTML =document.getElementById("suggest_"+rowON).innerHTML;
		document.getElementById("search_qtext").value=qtextHTML;
		onSuggest(rowON);
		checkFlag=false;
	}
	if(rownum>0&&document.getElementById("searchTip").style.display!="block")
	{
		document.getElementById("searchTip").style.display="block";
		return false;
	}
}

function checkSuggest(qtext,httpflag){
	var html="";	
	if (checkFlag){
		if (qtext){//搜索框有值
			//if(_oldtext != qtext ){			
			if(_oldtext != qtext || _oldtext == qtext){
				_oldtext = qtext;
				/**20190902*/
				if(qtext.length>20){
				    qtext =qtext.substr(0,20);
			    }else {
				    qtext=qtext;
			    }
				
				/**20190902*/
				//下拉列表页开始    	 
		   		$.ajax({
					url:"search_suggest.php",
					type:"post",
					dataType:"json",
					data:{pageCount:'10', keyword:qtext},
					async:false,
					success:function(re) {						
						selectSuggestNum=-1;
						if (re =='' || re==undefined){
			            	 $("#searchTip").hide();
			             }
			             //下拉列表是否有数据
			             if(re.length > 0){
			            	 $("#searchTip ul").remove();
			            	 $("#searchTip").html(''); 
			            	 html +="<ul id='suggestlist'>";
				             for(var s in re){		
				                 html+='<li id="suggest_'+s+'"  onmouseover="onSuggest('+s+')" onclick="clickSuggest(\''+re[s].TITLE+'\')" >'+re[s].TITLE+'</li>';
				             }
				             html +="</ul>";
				             $('#searchTip').append(html);
				             $("#searchTip").show();
			             }else {
			            	 $("#searchTip").hide(); 			            	 
			             }	
					}
				});
			}
			if(!IEVersion() && qtext.trim() != ''){
				$('#wordClose').show();	
			}

	    }else{//搜索框为空		    	
			$("#searchTip").hide();
			$('#wordClose').hide();	
		    selectSuggestNum=-1;
		}
   		//$("#searchTip").show();	
	}
}


function clickSuggest(qtext){
	var type = filterXSS($("#search_top_type").val());
	var url_type = filterXSS($("#search_url_type").val());
	//window.location.href="http://"+url_type+"search.php?qtext="+encodeURIComponent(qtext)+"&type="+type;
	//var httptype =$("#httptype").val();
	window.location.href=url_type+"search.php?qtext="+encodeURIComponent(qtext)+"&type="+type;
}

function onSuggest(rowON){			
	var rownum=document.getElementById("suggestlist").getElementsByTagName("li").length;
	//var _suggest="suggest_"+rowON;	
	_suggest="suggest_"+rowON;
	if(selectSuggestNum!=-1&&selectSuggestNum!=undefined)
	{
		var sel_suggest="suggest_"+selectSuggestNum;
		document.getElementById(sel_suggest).className="";
	}
	if(rowON<0||rowON>=rownum)
	{
		resetSelect();
		return false;
	}else{
		document.getElementById(_suggest).className="cur";
		selectSuggestNum=rowON;
	}

}

function resetSelect() 
{
	var sel_suggest="suggest_"+selectSuggestNum;
	if(document.getElementById(sel_suggest)!=undefined){
		document.getElementById(sel_suggest).className="";		
	}
	selectSuggestNum=-1;
	document.getElementById("search_qtext").value = _oldtext;
	document.getElementById("searchTip").style.display="block";
	checkFlag=false;
}

//  输入框
//获取焦点
$('#search_qtext').on('focus',function(){
	$('#search_qtext').addClass('inputFocus');
	if($('#search_qtext').val() != ''){
		$('#wordClose').show();
	}
 });
 //失去焦点
 $("#search_qtext").blur(function(){
	setTimeout(function(){
		$('#search_qtext').removeClass('inputFocus');
	},150)
	setTimeout(function(){
		$('#wordClose').hide();
	},200)

 }); 

 //点击清空输入框
 $('#wordClose').on('click',function(){
	$('#qtext_str').val('');
	$('#search_qtext').val('');
	$('#wordClose').hide();
 })

 //判断ie10
 window.AESKey = '';
 // 判断浏览器是否支持placeholder属性
 function isSupportPlaceholder() {
	 var input = document.createElement('input');
	 return 'placeholder' in input;
 };
//判断是否是IE浏览器，包括Edge浏览器
function IEVersion() {
	//取得浏览器的userAgent字符串
	var userAgent = navigator.userAgent;
	//判断是否IE浏览器
	var isIE = userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1;
	if (isIE) {
		var reIE = new RegExp("MSIE (\\d+\\.\\d+);");
		reIE.test(userAgent);
		var fIEVersion = parseFloat(RegExp["$1"]);
		if(fIEVersion < 9 ){
			addCssByStyle('.search17354_ind02 .ind06{margin-right:-24px}')
		}
		if (fIEVersion < 10 || !isSupportPlaceholder()) {
			return true;
		}
	} else {
		return false;
	}
}

if(IEVersion()){
	$('#wordClose').remove();
	$('#search_qtext').css({'padding-right':'0','width':'493px'});
}

//添加css方法
function addCssByStyle(cssString){ 
    var doc=document; 
    var style=doc.createElement("style"); 
    style.setAttribute("type", "text/css"); 
   
    if(style.styleSheet){// IE 
        style.styleSheet.cssText = cssString; 
    } else {// w3c 
        var cssText = doc.createTextNode(cssString); 
        style.appendChild(cssText); 
    } 
   
    var heads = doc.getElementsByTagName("head"); 
    if(heads.length){
        heads[0].appendChild(style); 
	} else{
        doc.documentElement.appendChild(style); 
	}
} 