
var path                         = require('path');
var events                       = require('events');
var fs                           = require('fs');

var Electron                     = require('electron');
var app                          = Electron.app;
var BrowserWindow                = Electron.BrowserWindow;
var Tray                         = Electron.Tray;

var extend                       = require('extend');
var Positioner                   = require('electron-positioner');

var _oOpt                        = {};
var _oApp                        = {};
var _oCachedBounds;
var _bSupportsTrayHighlightState = false;


// http://api.wikiwix.com/?action=voiture&lang=fr&format=vocabulary
// http://thesaurus.altervista.org/thesaurus/v1?word=peace&language=en_US&output=json&key=test_only&callback=process
// http://words.bighugelabs.com/api.php

// --> http://thesaurus.altervista.org/thesaurus/v1?word=voiture&language=fr_FR&key=EnWmeZLLgF9DxpNKzM6I&output=json
/***************************
  _     _ _     _ _
 | |__ (_) |__ | (_)
 | '_ \| | '_ \| | |
 | |_) | | |_) | | |
 |_.__/|_|_.__/|_|_|

****************************/

  /**
   * [hideWindow description]
   * @return {[type]} [description]
   */
  function hideWindow () {
       if (_bSupportsTrayHighlightState){
          _oApp.tray.setHighlightMode('never') ;
       }

       if (!_oApp.window){
          return true;
       }
       _oApp.emit('hide');
       _oApp.window.hide();
       _oApp.emit('after-hide');
     }

  /**
   * [windowClear description]
   * @return {[type]} [description]
   */
  function windowClear () {
   delete _oApp.window;
   _oApp.emit('after-close');
  }

  /**
   * [emitBlur description]
   * @return {[type]} [description]
   */
  function emitBlur () {
   _oApp.emit('focus-lost');
  }



  /**
   * [completeOption description]
   * @param  {[type]} oOpt [description]
   * @return {[type]}      [description]
   */
  function completeOption( oOpt){
    if (typeof oOpt === 'undefined'){
      oOpt = {dir: app.getAppPath()};
    }
    if (typeof oOpt === 'string'){
      oOpt = {dir: oOpt};
    }
    if (!oOpt.dir){
      oOpt.dir = app.getAppPath();
    }
    if (!(path.isAbsolute(oOpt.dir))){
      oOpt.dir = path.resolve(oOpt.dir);
    }
    if (!oOpt.index){
      oOpt.index = 'file://' + path.join( oOpt.dir, 'index.html');
    }
    if (!oOpt.windowPosition){

      if(process.platform === 'win32'){
        oOpt.windowPosition = 'trayBottomCenter' ;
      }else{
        oOpt.windowPosition = 'trayCenter';
      }
    }
    if (typeof oOpt.showDockIcon === 'undefined'){
       oOpt.showDockIcon = false;
    }

    oOpt.width   = oOpt.width   || 400;
    oOpt.height  = oOpt.height  || 236;
    oOpt.tooltip = oOpt.tooltip || '';

    return oOpt;
  }

  /**
   * [showWindow description]
   * @param  {[type]} trayPos [description]
   * @return {[type]}         [description]
   */
  function showWindow ( trayPos) {

    var noBoundsPosition = null;
    var position , x, y;

    if (_bSupportsTrayHighlightState){
      _oApp.tray.setHighlightMode('always');
    }

    if (!_oApp.window) {
      createWindow()
    }

    _oApp.emit('show');

    if (trayPos && trayPos.x !== 0) {
      // Cache the bounds
      _oCachedBounds = trayPos
    } else if (_oCachedBounds) {
      // Cached value will be used if showWindow is called without bounds data
      trayPos = _oCachedBounds
    } else if (_oApp.tray.getBounds) {
      // Get the current tray bounds
      trayPos = _oApp.tray.getBounds()
    }

    // Default the window to the right if `trayPos` bounds are undefined or null.

    if ((trayPos === undefined || trayPos.x === 0) &&
         _oOpt.windowPosition.substr(0, 4) === 'tray'
       ){
      noBoundsPosition = (process.platform === 'win32') ? 'bottomRight' : 'topRight';
    }

    position = _oApp.positioner.calculate( noBoundsPosition || _oOpt.windowPosition, trayPos)

    x = (_oOpt.x !== undefined) ? _oOpt.x : position.x;
    y = (_oOpt.y !== undefined) ? _oOpt.y : position.y;

    _oApp.window.setPosition(x, y);
    _oApp.window.show();
    _oApp.emit('after-show');
    return
  }

  /**
   * [createWindow description]
   * @return {[type]} [description]
   */
  function createWindow () {
        _oApp.emit('create-window');

        var defaults = {
          show        : false,
          frame       : false,
          transparent : true,
          resizable   : false,
          movable     : false,
          alwaysOnTop : true,
          hasShadow   : true
        };

        var winOpts  = extend( defaults, _oOpt)
        _oApp.window = new BrowserWindow( winOpts)

        _oApp.positioner = new Positioner( _oApp.window)

        _oApp.window.on('blur', function () {
          _oOpt.alwaysOnTop ? emitBlur() : hideWindow()
        })

        if (_oOpt.showOnAllWorkspaces !== false) {
          _oApp.window.setVisibleOnAllWorkspaces(true)
        }

        _oApp.window.on('close', windowClear)
        _oApp.window.loadURL(_oOpt.index)
        _oApp.emit('after-create-window')
      }

  /**
   * [clicked description]
   * @param  {[type]} e      [description]
   * @param  {[type]} bounds [description]
   * @return {[type]}        [description]
   */
  function clicked ( oEvent, bounds) {
    if (oEvent.altKey || oEvent.shiftKey || oEvent.ctrlKey || oEvent.metaKey) return hideWindow();
    if ( _oApp.window &&  _oApp.window.isVisible()) return hideWindow();
    _oCachedBounds = bounds || _oCachedBounds;
    showWindow( _oCachedBounds)
  }


  /**
   * [appReady description]
   * @return {[type]} [description]
   */
  function appReady(){

    var iconPath =  _oOpt.icon ||  path.join( _oOpt.dir, 'icon.png');
    var defaultClickEvent = _oOpt.showOnRightClick ? 'right-click' : 'click';

    _oApp.app.dock.hide();

    _oApp.tray =  _oOpt.tray || new Tray( iconPath);
    _oApp.tray.on(defaultClickEvent, clicked);
    _oApp.tray.on('double-click', clicked);
    _oApp.tray.setToolTip( _oOpt.tooltip);

    try {
     _oApp.tray.setHighlightMode('never');
     _bSupportsTrayHighlightState = true;
    } catch (e) {}

    if ( _oOpt.preloadWindow){
      createWindow();
    }

    _oApp.showWindow = showWindow;
    _oApp.hideWindow = hideWindow;
    _oApp.emit('ready');

  }


/*************************************************
  _______  ______   ___  ____ _____
 | ____\ \/ /  _ \ / _ \|  _ \_   _|
 |  _|  \  /| |_) | | | | |_) || |
 | |___ /  \|  __/| |_| |  _ < | |
 |_____/_/\_\_|    \___/|_| \_\|_|  s

**************************************************/


module.exports = function init( oOpt){

/*************************************
  ____ _____  _    ____ _____
 / ___|_   _|/ \  |  _ \_   _|
 \___ \ | | / _ \ | |_) || |
  ___) || |/ ___ \|  _ < | |
 |____/ |_/_/   \_\_| \_\|_|

*************************************/

 _oOpt     = completeOption( oOpt);


 _oApp     = new events.EventEmitter();
 _oApp.app = app;


 // set
  _oApp.setOption = function (opt, val) {
    _oOpt[opt] = val
  }

 // get
  _oApp.getOption = function (opt) {
    return _oOpt[opt]
  }

  app.on('ready', appReady);//appReady

 return _oApp;
};
