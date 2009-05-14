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

window.setTimeout(function() {

// TODO externalize the identitifers
var knownCommentIdentifiers = ['comment','commentlist', 'comments', 'respond', 'cnnComments','comment_container','hozzaszolas'],
commentBlocks = [];

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

// TODO create a hide/show panel with options
// hide 'em all
if(commentBlocks.length>0){
  for(i=0;i<commentBlocks.length;i++){
    if(commentBlocks[i].childNodes.length>1){
      commentBlocks[i].style.display = 'none';
    }
  }
}

}, 0);