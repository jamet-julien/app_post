var fs       = require('fs');
var Electron = require('electron');
var dialog   = Electron.dialog;



var exports  = module.exports = {};
exports.saveFile = function( aContent, callBack){

  var sContent = aContent.join("\n\n");




  dialog.showSaveDialog({

    filters : [
      { name:"Text", extensions: ['txt']}
    ],
    buttonLabel : "Sauver POST"

  }, function( sFileName) {

      if (sFileName === undefined){
           return;
      }

      fs.writeFile( sFileName, sContent, function (err){

          if(err){
              callBack.call(null, err.message)
          }

          callBack.call(null,"The file has been succesfully saved");
      });
  }
);

};
