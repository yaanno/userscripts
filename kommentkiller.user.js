// KommentKiller user script
// version 1.0 pre-pre-pre-dirty-alpha
// 2009-05-12
// Released under the Public Domain
//
// --------------------------------------------------------------------
//
// This is a Greasemonkey user script.  To install it, you need
// Greasemonkey 0.3 or later: http://greasemonkey.mozdev.org/
// Then restart Firefox and revisit this script.
// Under Tools, there will be a new menu item to "Install User Script".
// Accept the default configuration and install.
//
// To uninstall, go to Tools/Manage User Scripts,
// select "Hello World", and click Uninstall.
//
// --------------------------------------------------------------------
//
// ==UserScript==
// @name          KommentKiller
// @namespace     http://domhackers.blogspot.com
// @description   This script will try to find the comment elements on a page and hide them
// @include       *
// ==/UserScript==

// TODO externalize the identitifers

var kk_knownBlocks = "comment commentlist comments respond cnnComments comment_container hozzaszolas";
var kk_currentBlocks = [];
var kk_contentWrapper = document.createElement("div");

window.pageLoaded = function(){
  var kk_content = '<div id="kk_panel">';
  kk_content += '<style>';
  kk_content += '#kk_panel {display:none;width:200px;padding:15px;background:#333;color:#fff; position:fixed;top:0;left:20px;z-index:1000;font-size:11px; font-family:Helvetica;border: 5px solid #666;border-top:none}';
  kk_content += '#kk_panel *{margin:0;padding:0} #kk_panel p{padding: 5px; line-height: 16px}';
  kk_content += '#kk_panel a:link, #kk_panel a:visited{color:#fff} #kk_panel a:hover{color:#ddd}';
  kk_content += '</style>';
  kk_content += '<p><input id="kk_harvest_option" type="checkbox"> <label for="kk_harvest_option">Harvest all comments by default</label></p>';
  kk_content += '<p><input id="kk_hide_option" type="checkbox"> <label for="kk_harvest_option">Hide all comments by default</label></p>';
  kk_content += '<p><input id="kk_hidecomments" type="button" value="Hide all"> or ';
  kk_content += '<input id="kk_showcomments" type="button" value="Show all"></p>';
  kk_content += '</div>';
  
  kk_contentWrapper.innerHTML = kk_content;
  document.body.insertBefore(kk_contentWrapper, document.body.firstChild);
  
  if(!GM_getValue("kk_blockCache")){
    GM_setValue("kk_blockCache",kk_knownBlocks);
  }
  
  if(!GM_getValue("kk_harvestCommentsDefault")){
    GM_setValue("kk_harvestCommentsDefault",false);
  }
  
  if(GM_getValue("kk_harvestCommentsDefault") == true){
    var _kk_harvest_option =  document.getElementById("kk_harvest_option");
    _kk_harvest_option.checked = true;
    window.harvestComments();
  }
  
  if(!GM_getValue("kk_hideCommentsDefault")){
    GM_setValue("kk_hideCommentsDefault",false);
  }
  
  if(GM_getValue("kk_hideCommentsDefault") == true){
    var _kk_hide_option =  document.getElementById("kk_hide_option");
    _kk_hide_option.checked = true;
    window.hideComments();
  }
  
};

window.handleClick = function(e){
  var target = e ? e.target : this;
  console.log(target);
  
  if(target.id == "kk_harvest_option"){
    window.updateOptions(target);
  }
  
  if(target.id == "kk_hide_option"){
    window.updateOptions(target);
  }
  
  else if(target.id == "kk_hidecomments"){
    window.hideComments();
  }
  else if(target.id == "kk_showcomments"){
    window.showComments();
  }
  
  //e.stopPropagation();
  //e.preventDefault();
  
};

window.updateOptions = function(target){
  
  var _kk_harvest_option =  document.getElementById("kk_harvest_option");
  var _kk_hide_option =  document.getElementById("kk_hide_option");
  
  if(target.id == "kk_harvest_option"){
    
    if(_kk_harvest_option.checked == true){
      GM_setValue("kk_harvestCommentsDefault", true);
    } else {
      GM_setValue("kk_harvestCommentsDefault", false);
    }
    
  } else if(target.id == "kk_hide_option"){

    if(_kk_hide_option.checked == true){
      GM_setValue("kk_hideCommentsDefault", true);
    } else {
      GM_setValue("kk_hideCommentsDefault", false);
    }
  
  }

};

window.handleKey = function(e){
  
  var panel = kk_contentWrapper.firstChild;
  
  if(e.keyCode == 27){
    panel.style.display == 'block' ? panel.style.display  = 'none' : panel.style.display  = 'block';
  }

};

window.harvestComments = function(){
  
  // unpack kk_knownBlocks
  kk_knownBlocks = GM_getValue("kk_blockCache").split(" ");
  console.log(kk_knownBlocks)
  
  // check for ids
  for (i=0; i<kk_knownBlocks.length;i++){
    var _tmpvar = document.getElementById(kk_knownBlocks[i]);
    if(_tmpvar){
      kk_currentBlocks.push(_tmpvar);
    }
  }

  // check for classes
  for (i=0; i<kk_knownBlocks.length;i++){
    var _tmpvar2 = document.getElementsByClassName(kk_knownBlocks[i]);
    if(_tmpvar2 && _tmpvar2.length>1){
      for(j=0;j<_tmpvar2.length;j++){
        kk_currentBlocks.push(_tmpvar2[j]);
      }
    } 
  }
  
  console.log(kk_currentBlocks)
  
  
};

window.hideComments = function(){

  if(kk_currentBlocks.length>0){
    for(i=0;i<kk_currentBlocks.length;i++){
      if(kk_currentBlocks[i].childNodes.length>1){
        window.hideElement(kk_currentBlocks[i]);
      }
    }
  }

};

window.showComments = function(){

  if(kk_currentBlocks.length>0){
    for(i=0;i<kk_currentBlocks.length;i++){
      if(kk_currentBlocks[i].childNodes.length>1){
        window.showElement(kk_currentBlocks[i]);
      }
    }
  }

};

window.showElement = function(element){
  element.style.display = 'block';
}

window.hideElement = function(element){
  element.style.display = 'none';
}

window.addEventListener('load', window.pageLoaded, true);
kk_contentWrapper.addEventListener('click', window.handleClick, true);
window.addEventListener('keypress', window.handleKey, true);
