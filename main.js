function isExistKeyword(){
	if ($("#keyword").val() == "") {
		alert("切り取る言葉を入力してください");
		return false;
	}
	return true;
}


function indexPageShow(e,ui){
	var keyword = decodeURI($.getUrlVar("keyword"));
	if (keyword != "undefined") {
		$("#keyword").val(keyword);
	}
}
function twitterPageShow(e,ui){
	var keyword = decodeURI($.getUrlVar("keyword"));
	$("div#twitter > div > h1.keyword").html(keyword);
	getTweetAndRender(keyword);
}
function hatebPageShow(e,ui){
	var keyword = decodeURI($.getUrlVar("keyword"));
	$("div#hateb > div > h1.keyword").html(keyword);
	if ($("#hateb_content").html() == "") {
		getHatebAndRender();
	}
}
function myPageShow(e,ui){
	$("#my_content > ul").empty();
	renderMyDatetime();
}
function renderMyDatetime(){
	if (! localStorage.getItem("datetime")) {
		localStorage.setItem("datetime", JSON.stringify([]));
	}
	var datetime = JSON.parse(localStorage.getItem("datetime"));
	for (var i in datetime) {
		var d = datetime[i];
		$("#my_content > ul").append(
			'<li>'
		//	+'<a href="#"'
		//	+' onclick="$(\'#form'+d+'\').submit();return false;">'+d+'</a>'
		//	+'<form method="get" action="#mydata" data-ajax="false"'
		//	+' id="form'+d+'">'
		//	+'<input type="hidden" name="datetime" value="'+d+'">'
		//	+'</form>'
			+'<a href="?datetime='+d+'#mydata" rel="external">'+d+'</a>'
			+'</li>'
		);
	}
}
function mydataPageShow(e,ui){
	var datetime = $.getUrlVar("datetime");
	var data = JSON.parse(localStorage.getItem(datetime));
	if (data["hateb"]) {
		$("#mydata_content > h1").html("はてなB!");
		for (var i in data["hateb"]) {
			$("#mydata_content_content").append(data["hateb"][i]);
		};
	}
	else if(data["twitter"]) {
		$("#mydata_content > h1").html("Twitter");
		for (var i in data["twitter"]) {
			$("#mydata_content_content").append(data["twitter"][i]);
		};
	}
}

function getTweetAndRender(keyword){
	$("div#tweet_content").empty();

	if (keyword == "") {
		$("div#tweet_content").html("切り取る言葉がありません");
		return;
	}
	$.mobile.pageLoading();

	$.ajax({
		dataType: "json",
		data: {
			//q: decodeURI(keyword),
			q: keyword,
			lang: "ja"
		},
		cache: "false",
		url: "http://search.twitter.com/search.json?callback=?",
		success: renderTweet,
		error: function(xhr, textStatus, errorThrown) {
			$.mobile.pageLoading(true);
			alert("An Error Occured !! " + errorThrown);
		}
	});
}
function renderTweet(json) {
	if (json["results"]) {
		$.each(json["results"], function(){
			$("div#tweet_content").append(
				'<div class="tweet">'
				+'<div class="tweet_profile_image">'
				+  '<img src="'+ this.profile_image_url
				+  '" width="48" height="48" alt="profile_image_url">'
				+'</div>'
				+'<div class="tweet_right">'
				+  '<div class="tweet_from_user">'+ this.from_user +'</div>'
				+  '<div class="tweet_text">'+ this.text +'</div>'
				+  '<div class="tweet_created_at">'+ this.created_at +'</div>'
				+'</div>'
			);

		});
		$(".tweet_text").urlAutoLink(); // add <a>tag
	}

	$.mobile.pageLoading(true);
}

function getHatebAndRender(){
	$.mobile.pageLoading();
	$("div#hateb_content").empty();

	var keyword = $.getUrlVar("keyword");
	$("#hateb_content").rssfeed(
		  "http://b.hatena.ne.jp/t/" + keyword + "?sort=hot&threshold=5&mode=rss",
		{
			limit: 10
		},
		function(){
			$("li.rssRow").each(function(){
				var h4 = $(this).children("h4");
				var hatena_users_image_src
					= "http://b.hatena.ne.jp/entry/image/" +  h4.children("a").attr("href");
				$("<img>").attr("src", hatena_users_image_src).insertAfter(h4);
			});
			$.mobile.pageLoading(true);
		}
	);
}

function getNow(){
	var now = new Date();
	var y   = now.getFullYear().toString();
	var m   = keta(2,(now.getMonth()+1).toString());
	var d   = keta(2,now.getDate().toString());
	var hr  = keta(2,now.getHours().toString());
	var min = keta(2,now.getMinutes().toString());
	var sec = keta(2,now.getSeconds().toString());
	return parseInt(y+m+d+hr+min+sec);
}
function keta(i, str){
	if (str.length !== i) {
		var minus = i - str.length;
		for (var j = 0; j < minus; j++) {
			str = "0" + str;
		}
	}
	return str;
}

function saveData(type){
	$.mobile.pageLoading();


	var now = getNow();
	if (! localStorage.getItem("datetime")) {
		localStorage.setItem("datetime", JSON.stringify([]));
	}
	var datetime = JSON.parse(localStorage.getItem("datetime"));
	datetime.unshift(now);
	localStorage.setItem("datetime", JSON.stringify(datetime));

	var data = [];
	if (type == "hateb") {
		$("li.rssRow").each(function(){
			data.push($(this).html());
		});
		localStorage.setItem(now, JSON.stringify({ "hateb": data }));
	}
	else if (type == "twitter") {
		$(".tweet").each(function(){
			data.push($(this).html());
		});
		localStorage.setItem(now, JSON.stringify({ "twitter": data }));
	}

	$.mobile.pageLoading(true);
	alert("保存しました");
}

/////////////////////////////////////////////////////////////////
//
//  //////    ////////      ////  //////   //     //
//  /     /   //           // //  //   //   //   //
//  ///////   //////      //  //  //    //   ////
//  //  //    //         //   //  //    //    //
//  //   //   //        ////////  //   //     //
//  //    //  ///////  //     //  //////      //
//
/////////////////////////////////////////////////////////////////
$(document).ready(function(){
	$("div#index").live("pageshow", indexPageShow);
	$("div#twitter").live("pageshow", twitterPageShow);
	$("div#hateb").live("pageshow", hatebPageShow);
	$("div#my").live("pagebeforeshow", myPageShow)
	.live("pageshow", function(){
		$("#my_content > ul").listview('refresh');
	});
	$("div#mydata").live("pageshow", mydataPageShow);

	$(".btnSaveHateb").bind("tap", function(){
		saveData('hateb');
	});
	$(".btnSaveTwitter").bind("tap", function(){
		saveData('twitter');
	});
	$(".btnReloadTwitter").bind("tap", function(){
		getTweetAndRender(decodeURI($.getUrlVar('keyword')));
	});
	$(".btnReloadHateb").bind("tap", function(){
		getHatebAndRender();
	});
});

