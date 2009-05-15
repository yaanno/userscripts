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


// the init function
window.pageLoaded = function(){

  // create control panel
  window.createPanel();
  
  // setup default options for persistent storage:
  // kk_blockCache stores the kk_knownBlocks
  // TODO let the user extend the stored list
  if(!GM_getValue("kk_blockCache")){
    GM_setValue("kk_blockCache",kk_knownBlocks);
  }
  
  // kk_hideCommentsDefault and kk_harvestCommentsDefault stores
  // the default behavior options
  if(!GM_getValue("kk_hideCommentsDefault")){
    GM_setValue("kk_hideCommentsDefault",false);
  }
  
  if(!GM_getValue("kk_harvestCommentsDefault")){
    GM_setValue("kk_harvestCommentsDefault",false);
  }
  
  // TODO move these into functions, that updates the panel
  // and start the processing
  if(GM_getValue("kk_harvestCommentsDefault") == true){
    var _kk_harvest_option =  document.getElementById("kk_harvest_option");
    _kk_harvest_option.checked = true;
    window.harvestComments();
  }
  
  if(GM_getValue("kk_hideCommentsDefault") == true){
    var _kk_hide_option =  document.getElementById("kk_hide_option");
    _kk_hide_option.checked = true;
    window.hideComments();
  }
  
};

// control panel creator function
window.createPanel = function(){

  var kk_content = '<div id="kk_panel">';
  kk_content += '<style>';
  kk_content += '#kk_panel {display:none;width:200px;padding:15px;background:#333;color:#fff; position:fixed;top:0;left:20px;z-index:1000;font-size:11px; font-family:Helvetica;border: 5px solid #666;border-top:none}';
  kk_content += '#kk_panel *{margin:0;padding:0} #kk_panel p{padding: 5px; line-height: 16px}';
  kk_content += '#kk_panel a:link, #kk_panel a:visited{color:#fff} #kk_panel a:hover{color:#ddd}';
  kk_content += '</style>';
  kk_content += '<p><input id="kk_harvest_option" type="checkbox"> <label for="kk_harvest_option">Harvest all comments by default</label></p>';
  kk_content += '<p><input id="kk_hide_option" type="checkbox"> <label for="kk_hide_option">Hide all comments by default</label></p>';
  kk_content += '<p><input id="kk_hidecomments" type="button" value="Hide all"> or ';
  kk_content += '<input id="kk_showcomments" type="button" value="Show all"></p>';
  kk_content += '</div>';
  
  kk_contentWrapper.innerHTML = kk_content;
  document.body.insertBefore(kk_contentWrapper, document.body.firstChild);

};

// Handles control panel events
// TODO make this event handler more general
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

// Updates the persistent storage options
// TODO clean up this function using encapsulation
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

// Handles keyboard events watching the open/close key press (currently: ALT+CRTL+K)
window.handleKey = function(e){
  
  var panel = kk_contentWrapper.firstChild;
  
  if(e.ctrlKey && e.altKey && e.keyCode == 75){
    panel.style.display == 'block' ? panel.style.display  = 'none' : panel.style.display  = 'block';
  }

};

// Collects all blocks that may contain comments using #id or .class names
// defined in kk_knownBlocks
window.harvestComments = function(){
  
  // unpack kk_knownBlocks
  kk_knownBlocks = GM_getValue("kk_blockCache").split(" ");
  //console.log(kk_knownBlocks)
  
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
      for(j=0,_len=_tmpvar2.length;j<_len;j++){
        kk_currentBlocks.push(_tmpvar2[j]);
      }
    } 
  }
  
  //console.log(kk_currentBlocks)
  
  
};

// Hides all comment blocks
window.hideComments = function(){

  if(kk_currentBlocks.length>0){
    for(i=0, _len=kk_currentBlocks.length; i<_len;i++){
      if(kk_currentBlocks[i].childNodes.length>1){
        window.hideElement(kk_currentBlocks[i]);
      }
    }
  }

};

// Shows all comments block (we made invisible)
window.showComments = function(){

  if(kk_currentBlocks.length>0){
    for(i=0, _len=kk_currentBlocks.length;i<_len;i++){
      if(kk_currentBlocks[i].childNodes.length>1){
        window.showElement(kk_currentBlocks[i]);
      }
    }
  }

};

// Style function
window.showElement = function(element){
  element.style.display = 'block';
}

// Style function
window.hideElement = function(element){
  element.style.display = 'none';
}

// Event listeners:
// watches the window to load
window.addEventListener('load', window.pageLoaded, true);
// listens events delegated to control panel
kk_contentWrapper.addEventListener('click', window.handleClick, true);
// watches the open/close key press event
window.addEventListener('keydown', window.handleKey, true);
