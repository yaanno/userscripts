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
var $KK = window.KK || {};

$KK.knownBlocks = "comment commentlist comments respond cnnComments comment_container trackbacks";
$KK.currentBlocks = [];
$KK.contentWrapper = document.createElement("div");
$KK.panelConfig = {
  internalBlockCache : [],
  harvest_option : false,
  hide_option : false,
  hide_input : null,
  harvest_input : null,
  panel : null
};

// the init function
$KK.pageLoaded = function(){

  // create control panel
  $KK.createPanel();

  // setup default options for persistent storage
  if(!GM_getValue("kk_blockCache")){
    GM_setValue("kk_blockCache",$KK.knownBlocks);
  }

  if(!GM_getValue("kk_hideCommentsDefault")){
    GM_setValue("kk_hideCommentsDefault",false);
  }

  if(!GM_getValue("kk_harvestCommentsDefault")){
    GM_setValue("kk_harvestCommentsDefault",false);
  }

  // fill up the internal storage with default values
  $KK.panelConfig.harvest_option = GM_getValue("kk_harvestCommentsDefault");
  $KK.panelConfig.hide_option = GM_getValue("kk_hideCommentsDefault");

  $KK.panelConfig.harvest_input = $KK.byId("kk_harvest_checkbox");
  $KK.panelConfig.hide_input = $KK.byId("kk_hide_checkbox");

  $KK.setPanelState();

};

$KK.setPanelState = function(){

  $KK.panelConfig.hide_input.checked = $KK.panelConfig.hide_option;
  $KK.panelConfig.harvest_input.checked = $KK.panelConfig.harvest_option;
  
};

// control panel creator function
$KK.createPanel = function(){

  var kk_content = '<div id="kk_panel">';
  kk_content += '<style>';
  kk_content += '#kk_panel {display:none;width:200px;padding:15px;background:#333;color:#fff; position:fixed;top:0;left:20px;z-index:1000;font-size:11px; font-family:Helvetica;border: 5px solid #666;border-top:none}';
  kk_content += '#kk_panel *{margin:0;padding:0;text-align:left} #kk_panel p{padding: 5px; line-height: 16px}';
  kk_content += '#kk_panel a:link, #kk_panel a:visited{color:#fff} #kk_panel a:hover{color:#ddd}';
  kk_content += '</style>';
  kk_content += '<p><input id="kk_harvest_checkbox" type="checkbox"> <label for="kk_harvest_option">Harvest all comments by default</label></p>';
  kk_content += '<p><input id="kk_hide_checkbox" type="checkbox"> <label for="kk_hide_option">Hide all comments by default</label></p>';
  kk_content += '<p><input id="kk_hidecomments" type="button" value="Hide all"> or ';
  kk_content += '<input id="kk_showcomments" type="button" value="Show all"></p>';
  kk_content += '</div>';

  $KK.contentWrapper.innerHTML = kk_content;
  document.body.insertBefore($KK.contentWrapper, document.body.firstChild);

  var _panel = $KK.byId("kk_panel");
  if(_panel){
    $KK.panelConfig.panel = _panel;
  } else {
    console.log("panel not creaed");
  }

  console.log($KK.panelConfig);

};

// Handles control panel events
// TODO make this event handler more general
$KK.handleClick = function(e){

  var target = e ? e.target : this;
  //console.log(target);

  if( (target.id == "kk_harvest_checkbox") || (target.id == "kk_hide_checkbox") ){
    $KK.updateOptions(target);
  }

  else if(target.id == "kk_hidecomments"){
    $KK.hideComments();
  }

  else if(target.id == "kk_showcomments"){
    $KK.showComments();
  }

};

// Updates the persistent storage options
// TODO clean up this function using encapsulation
$KK.updateOptions = function(target){

  var value = false;
  var checkbox = null;

  if(target.id == "kk_harvest_checkbox"){
    var checkbox = $KK.panelConfig.harvest_option;
    value = true ? checkbox  : false;
    console.log("harvest set to " + value)
    GM_setValue("kk_harvestCommentsDefault", value);

  } else if(target.id == "kk_hide_checkbox"){
    var checkbox = $KK.panelConfig.hide_option;
    console.log(checkbox)
    value = true ? checkbox  : false;
    console.log("hide set to " + value)
    GM_setValue("kk_hideCommentsDefault", value);

  }

  //return;

};

// Handles keyboard events watching the open/close key press (currently: ESC)
$KK.handleKey = function(e){

  var panel = $KK.panelConfig.panel;

  if(e.ctrlKey && e.altKey && e.keyCode == 75){
    panel.style.display == 'block' ? $KK.hide(panel) : $KK.show(panel);
  }

};

// Collects all blocks that may contain comments using #id or .class names
// defined in kk_knownBlocks
$KK.getComments = function(){

  // unpack kk_knownBlocks
  $KK.knownBlocks = GM_getValue("kk_blockCache").split(" ");
  console.log($KK.knownBlocks);

  // check for ids
  for (i=0; i<$KK.knownBlocks.length;i++){
    var _tmpvar = $KK.byId($KK.knownBlocks[i]);
    if(_tmpvar){
      $KK.currentBlocks.push(_tmpvar);
    }
  }

  // check for classes
  for (i=0; i<$KK.knownBlocks.length;i++){
    var _tmpvar2 = $KK.byClass($KK.knownBlocks[i]);
    if(_tmpvar2 && _tmpvar2.length>1){
      for(j=0,_len=_tmpvar2.length;j<_len;j++){
        $KK.currentBlocks.push(_tmpvar2[j]);
      }
    }
  }

  console.log($KK.currentBlocks);


};

// Hides all comment blocks
$KK.hideComments = function(){

  if($KK.currentBlocks.length>0){
    for(i=0, _len=kk_currentBlocks.length; i<_len;i++){
      if($KK.currentBlocks[i].childNodes.length>1){
        $KK.hide($KK.currentBlocks[i]);
      }
    }
  } else {
    console.log("nothing to hide");
  }

};

// Shows all comments block (we made invisible)
$KK.showComments = function(){

  if($KK.currentBlocks.length>0){
    for(i=0, _len=kk_currentBlocks.length;i<_len;i++){
      if($KK.currentBlocks[i].childNodes.length>1){
        $KK.show($KK.currentBlocks[i]);
      }
    }
  } else {
    console.log("nothing to show");
  }

};

// Utility functions

$KK.byId = function(element){
  if(!element) return;
  return document.getElementById(element) || null;
};

$KK.byClass = function(classname){
  if(!classname) return;
  return document.getElementsByClassName(classname) || [];
};

$KK.byTag = function(tagname){
  if(!tagname) return;
  return document.getElementsByTagName(tagname) || [];
};

// Style function
$KK.show = function(element){
  element.style.display = 'block';
};

// Style function
$KK.hide = function(element){
  element.style.display = 'none';
};

// Event listeners:
// watches the window to load
window.addEventListener('load', $KK.pageLoaded, true);
// listens events delegated to control panel
$KK.contentWrapper.addEventListener('click', $KK.handleClick, true);
// watches the open/close key press event
window.addEventListener('keydown', $KK.handleKey, true);
