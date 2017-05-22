var Remote    = require('electron').remote;
var FileSaver = Remote.require('./filesaver');

/********************************************************
  _____ _   _ _   _  ____ _____ ___ ___  _   _
 |  ___| | | | \ | |/ ___|_   _|_ _/ _ \| \ | |
 | |_  | | | |  \| | |     | |  | | | | |  \| |
 |  _| | |_| | |\  | |___  | |  | | |_| | |\  |
 |_|    \___/|_| \_|\____| |_| |___\___/|_| \_|

**********************************************************/

/**
 * [cancel description]
 * @param  {[type]} e [description]
 * @return {[type]}   [description]
 */
function cancel(e) {
 if (e.preventDefault) { e.preventDefault(); }
 return false;

}

/**
 * [addFile description]
 * @param {[type]} e [description]
 */
function addFile(e){


  var dt    = e.dataTransfer;
  var files = dt.files;

  if (e.preventDefault) {
    e.preventDefault();
  }

  var element = this;


  for (var i=0; i<files.length; i++) {

    var file = files[i];
    var reader = new FileReader();

    reader.addEventListener( 'loadend', endLoad.bind( reader, element));
    reader.readAsDataURL(file);

  }

  return false;
}

/**
 * [endLoad description]
 * @param  {[type]} e    [description]
 * @param  {[type]} file [description]
 * @return {[type]}      [description]
 */
function endLoad(){
  var element                   = arguments[ 0 ];
  var bin                       = this.result;
  element.style.backgroundImage = 'url('+bin+')';
}

/**
 * [updateLimite description]
 * @param  {[type]} event [description]
 * @return {[type]}       [description]
 */
function updateLimite( eCurrent){

    var iLimit       = eCurrent.dataset.max,
        iValue       = parseInt( iLimit - eCurrent.innerText.length),
        oCurrentText = eCurrent.parentNode.querySelector('.js--limit-char');

    oCurrentText.innerText = iValue;

    if( iValue < 0 && !oCurrentText.classList.contains( 'error')){
      oCurrentText.classList.add( 'error');
    }else if( iValue >= 0 ){
      oCurrentText.classList.remove( 'error');
    }

    checkSize();
    resetHelper();
    _oTextEdit = eCurrent;

    return iLimit;

}

/**
 * [checkLimit description]
 * @param  {[type]} event [description]
 * @return {[type]}       [description]
 */
function checkLimit( event){
      var iLimit = updateLimite( event.target);
      //event.target.value = event.target.value.substr( 0, iLimit);
}

/**
 * [splitValue description]
 * @param  {[type]} sText    [description]
 * @param  {[type]} sReplace [description]
 * @param  {[type]} iStart   [description]
 * @param  {[type]} iEnd     [description]
 * @return {[type]}          [description]
 */
function splitValue( sText, sReplace, iStart, iEnd) {
    return  sText.substring(0, iStart) + sReplace +  sText.substring( iEnd);
}

/**
 * [resetHelper description]
 */
function resetHelper(){
  _oHelperClass.remove('open');
  _oTextEdit = null,
  _iStart         = 0,
  _iFinish        = 0,
  _sSel           = '';

  setTimeout( function(){
    resize( _iHeightStart);
  }, 310);
}

/**
 * [criteriaTemplate description]
 * @param  {[type]} aCriteria [description]
 * @return {[type]}           [description]
 */
function criteriaTemplate( aCriteria){
    return function( el){
      return ( ~aCriteria.indexOf( el));
    };
  }

/**
 * [checkSize description]
 * @return {[type]} [description]
 */
function checkSize(){
  var oTmpSize   = _oContent.getBoundingClientRect();
  var _iHeightTmp   = oTmpSize.bottom;
  if( _iHeightTmp != _iHeightStart){
    resize( _iHeightTmp);
    _iHeightStart = _iHeightTmp;
  }
}

/**
 * [resize description]
 * @return {[type]} [description]
 */
function resize( sHeight) {
    _oWin.setSize( 500, sHeight, false);
}

/**
 * [buildChildPropal description]
 * @param  {[type]} aWord [description]
 * @return {[type]}       [description]
 */
function buildChildPropal( aWord){
  var docFragment = document.createDocumentFragment();
  var aResult     = [];
  var oLu         = document.querySelector('.js--contenthelper');

  aWord.map( function( obj){
    var aRes = obj.list.synonyms.split( '|');
    aResult = aResult.concat( aRes);
  });


  aResult.map( function( sValue){
    var oLI       = document.createElement("li");
    oLI.innerText = sValue;
    oLI.className = "txt item-helper js--change";
    docFragment.appendChild( oLI);
  });

  oLu.innerHTML = '';
  oLu.appendChild( docFragment);

}

/**
 * [findHelp description]
 * @param  {[type]} sWord     [description]
 * @param  {[type]} fCallback [description]
 * @return {[type]}           [description]
 */
function findHelp( sWord, fCallback){
  var xhttp = new XMLHttpRequest();
  var jsonObj = {};
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 ){
       if( this.status == 200){

          jsonObj = JSON.parse( this.responseText);
          buildChildPropal( jsonObj.response);
          fCallback();
       }
    }
  };
  xhttp.open( "GET", "http://thesaurus.altervista.org/thesaurus/v1?word="+sWord+"&language=fr_FR&key=EnWmeZLLgF9DxpNKzM6I&output=json", true);
  xhttp.send();
}

/**
 * [cleanPaste description]
 * @param  {[type]} event [description]
 * @return {[type]}       [description]
 */
function cleanPaste( event){
  event.preventDefault();
  var sText = event.clipboardData.getData("text/plain");
  document.execCommand("insertHTML", false, sText);
}

/****************************************************************
  ____  ____   ___   ____ _____ ____  _   _ ____  _____
 |  _ \|  _ \ / _ \ / ___| ____|  _ \| | | |  _ \| ____|
 | |_) | |_) | | | | |   |  _| | | | | | | | |_) |  _|
 |  __/|  _ <| |_| | |___| |___| |_| | |_| |  _ <| |___
 |_|   |_| \_\\___/ \____|_____|____/ \___/|_| \_\_____|

****************************************************************/


    var aLimitText     = [].slice.call( document.querySelectorAll('.js--limit'));
    var aNavOnglet     = [].slice.call( document.querySelectorAll('.js--nav'));
    var aNavSpace      = [].slice.call( document.querySelectorAll('.js--space'));
    var aPreview       = [].slice.call( document.querySelectorAll('.js--preview'));
    var _oContent      = document.querySelector('.js--size');
    var oDefaultSize   = _oContent.getBoundingClientRect();
    var _iHeightStart  = oDefaultSize.bottom;
    var _oWin          = Remote.getCurrentWindow();

    var _oContentHelper = document.querySelector('.js--helper');
    var _oHelperClass   = _oContentHelper.classList;

    var handleNav, handleReplace;

    var fClean         = function(o){ o.classList.remove('current');};

    var _oTextEdit = null,
        _iStart         = 0,
        _iFinish        = 0,
        _sSel           = '';

    // action textarea
    aLimitText.map( function( oElement){
      oElement.addEventListener('keyup', checkLimit, false);
      oElement.addEventListener('focus', checkLimit, false);
      oElement.addEventListener('paste', cleanPaste, false);
    });


    resize( _iHeightStart);

    /**
     * [handleNav description]
     * @type {[type]}
     */
    handleNav = window.eventHandler('click', {
      element  : document.body,
      criteria : criteriaTemplate( aNavOnglet),
      callBack : function( event){

        var index  = aNavOnglet.indexOf( event.delegateTarget);

        aNavSpace.map( fClean);
        aNavOnglet.map( fClean);
        aNavSpace[index].classList.add('current');
        aNavOnglet[index].classList.add('current');
        checkSize();

      }
    });

    /**
     * [handleReplace description]
     * @type {[type]}
     */
    handleReplace = window.eventHandler('click', {
      element  : document.querySelector('.list-helper'),
      criteria : function( el){
        return ( ~el.className.indexOf( 'js--change'));
      },
      callBack : function( event){

        _oTextEdit.innerText = splitValue(
                                            _oTextEdit.innerText,
                                            event.delegateTarget.innerText,
                                            _iStart,
                                            _iFinish
                                          );

        updateLimite( _oTextEdit);
        resetHelper();

      }
    });

    /**
     *
     */
    aPreview.map( function( oDrop){
      oDrop.addEventListener( 'dragover', cancel, false);
      oDrop.addEventListener( 'dragenter', cancel, false);
      oDrop.addEventListener( 'drop', addFile.bind( oDrop), false);
    })

    document.getElementById('saveFile').addEventListener('click', function(){

        var aExport = aLimitText.map(function( oElement){
            return oElement.innerText;
        });

        FileSaver.saveFile( aExport, function( sMessage){
          console.log( sMessage);
        });
    });



    document.getElementById('wordHelper').addEventListener('click', function(){

        var oSelObj   = window.getSelection();
        var oSelRange = oSelObj.getRangeAt(0);
        var iHeight   = 0;

        if( _oTextEdit !== null ){

            _iStart  = oSelRange.startOffset;
            _iFinish = oSelRange.endOffset;

            _sSel    = _oTextEdit.innerText.substring( _iStart, _iFinish);


            findHelp( _sSel, function(){
              iHeight = _oContentHelper.getBoundingClientRect().height - 25;
              resize( _iHeightStart + iHeight);
              _oHelperClass.add('open');
            })
        }
    });
