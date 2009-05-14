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
var knownCommentIdentifiers = ['comment','commentlist', 'comments', 'respond', 'cnnComments','comment_container','hozzaszolas'],
commentBlocks = [];

window.pageLoaded = function(){
  kommentKillerPanel = document.createElement("div");
  kommentKillerPanel.innerHTML = '<div id="kommentkillerpanel"><style> #kommentkillerpanel {display:none;width:200px;height:80px;background:#000;color:#fff; position:absolute;z-index:1000}</style><p>This will be the panel</p></div>';
  document.body.insertBefore(kommentKillerPanel, document.body.firstChild);
};

window.handleClick = function(e){
  var target = e ? e.target : this;
};

window.handleKey = function(e){
  
  var panel = kommentKillerPanel.firstChild;
  
  if(e.keyCode == 27){
    panel.style.display == 'block' ? panel.style.display  = 'none' : panel.style.display  = 'block';
  }

};

window.harvestComments = function(){
  // check for ids
  for (i=0; i<knownCommentIdentifiers.length;i++){
    var _tmpvar = document.getElementById(knownCommentIdentifiers[i]);
    if(_tmpvar){
      commentBlocks.push(_tmpvar);
    }
  }

  // check for classes
  for (i=0; i<knownCommentIdentifiers.length;i++){
    var _tmpvar2 = document.getElementsByClassName(knownCommentIdentifiers[i]);
    if(_tmpvar2 && _tmpvar2.length>1){
      for(j=0;j<_tmpvar2.length;j++){
        commentBlocks.push(_tmpvar2[j]);
      }
    } 
  }
};

window.hideComments = function(){

  if(commentBlocks.length>0){
    for(i=0;i<commentBlocks.length;i++){
      if(commentBlocks[i].childNodes.length>1){
        window.hideElement(commentBlocks[i]);
      }
    }
  }

};

window.showComments = function(){

  if(commentBlocks.length>0){
    for(i=0;i<commentBlocks.length;i++){
      if(commentBlocks[i].childNodes.length>1){
        window.showElement(commentBlocks[i]);
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
window.addEventListener('click', window.handleClick, true);
window.addEventListener('keypress', window.handleKey, true);
