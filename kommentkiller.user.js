// KommentKiller user script
// version 1.0 alpha
// 2009-05-17
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
$KK.console = null;
$KK.panelConfig = {
  harvest_option : false,
  hide_option : false,
  hide_input : null,
  harvest_input : null,
  panel : null,
  known_textarea : null
};

// the init function
$KK.pageLoaded = function(){

  // create control panel
  $KK.createPanel();
  
  // debug
  $KK.console = $KK.byId("kk_console");
  var _panel = $KK.byId("kk_panel");
  if(_panel){
    $KK.panelConfig.panel = _panel;
    $KK.log("Panel created")
  } else {
    $KK.log("Panel not created");
  }


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
  $KK.panelConfig.known_texarea = $KK.byId("kk_knownblocks");
  
  
  // set default panel state
  $KK.panelConfig.hide_input.checked = $KK.panelConfig.hide_option;
  $KK.panelConfig.harvest_input.checked = $KK.panelConfig.harvest_option;
  $KK.panelConfig.known_texarea.value = GM_getValue("kk_blockCache");
  
  // do the default processing
  $KK.doProcess();
  
};

// control panel creator function
$KK.createPanel = function(){

  var kk_content = '<div id="kk_panel">';
  kk_content += '<style>';
  kk_content += '#kk_panel {display:none;min-width:200px;padding:15px;background:#333;position:fixed;top:0;left:20px;z-index:1000;font-size:11px; font-family:Helvetica;border: 5px solid #666;border-top:none}';
  kk_content += '#kk_panel *{margin:0;padding:0;text-align:left;color:#fff;font-size:11px} #kk_panel p{padding: 5px; line-height: 16px}';
  kk_content += '#kk_panel * input{background: #fefefe; color: #000; font-weight: bold}';
  kk_content += '#kk_console {border: 1px solid #fff; background: #9f3; color: #333}';
  kk_content += '</style>';
  kk_content += '<p><input id="kk_harvest_checkbox" type="checkbox" /> <label for="kk_harvest_checkbox">Harvest all comments by default</label></p>';
  kk_content += '<p><input id="kk_hide_checkbox" type="checkbox" /> <label for="kk_hide_checkbox">Hide all comments by default</label></p>';
  kk_content += '<p><input id="kk_hidecomments" type="button" value="Hide all"> or ';
  kk_content += '<input id="kk_showcomments" type="button" value="Show all"></p>';
  kk_content += '<p>Known identifiers (separate values with space) <br>';
  kk_content += '<input type="text" id="kk_knownblocks" /> <input id="kk_knownblocks_save" type="button" value="Save"></p>';
  kk_content += '<p id="kk_console">This is the console</p>';
  kk_content += '</div>';

  $KK.contentWrapper.innerHTML = kk_content;
  document.body.insertBefore($KK.contentWrapper, document.body.firstChild);

};

$KK.log = function(msg){

  $KK.console.innerHTML = msg;

};


$KK.doProcess = function(){

  if($KK.panelConfig.harvest_option){
    $KK.getComments();
  };
  
  if($KK.panelConfig.hide_option){
    $KK.hideComments();
  };
  
};

// Handles control panel events
// TODO make this event handler more general
$KK.handleClick = function(e){

  var target = e ? e.target : this;

  if( (target.id == "kk_harvest_checkbox") || (target.id == "kk_hide_checkbox") ){
    $KK.updateOptions(target);
  }

  else if(target.id == "kk_hidecomments"){
    $KK.hideComments();
  }

  else if(target.id == "kk_showcomments"){
    $KK.showComments();
  }
  
  else if(target.id == "kk_knownblocks_save"){
    $KK.updateKnownBlocks();
  }

};

// Updates the persistent storage options
$KK.updateOptions = function(target){

  var checkbox = $KK.byId(target.id);
  var value = true ? checkbox.checked  : false;
  
  if(target.id == "kk_harvest_checkbox"){
    GM_setValue("kk_harvestCommentsDefault", value);
  } else if(target.id == "kk_hide_checkbox"){
    GM_setValue("kk_hideCommentsDefault", value);
  }

};

$KK.updateKnownBlocks = function(){
  
  var input = $KK.panelConfig.known_texarea;
  
  if( (input.value != "") && ($KK.knownBlocks != input.value) ){
    $KK.knownBlocks = input.value;
    GM_setValue("kk_blockCache",$KK.knownBlocks);
  }
  
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
  
  $KK.log("Got " + $KK.currentBlocks.length + " comment blocks");

};

// Hides all comment blocks
$KK.hideComments = function(){

  if($KK.currentBlocks.length>0){
    for(i=0, _len=$KK.currentBlocks.length; i<_len;i++){
      if($KK.currentBlocks[i].childNodes.length>1){
        $KK.hide($KK.currentBlocks[i]);
      }
    }
    
    $KK.log($KK.currentBlocks.length + " elements hidden");
    
  } else {
    $KK.log("nothing to hide");
  }

};

// Shows all comments block (we made invisible)
$KK.showComments = function(){

  if($KK.currentBlocks.length>0){
    for(i=0, _len=$KK.currentBlocks.length;i<_len;i++){
      if($KK.currentBlocks[i].childNodes.length>1){
        $KK.show($KK.currentBlocks[i]);
      }
    }
    
    $KK.log($KK.currentBlocks.length + " elements got visible");
    
  } else {
    $KK.log("nothing to show");
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
