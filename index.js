var Menubar = require('./menubar');

var postApp = Menubar({
                        dir    : __dirname,
                        width  : 495,
                        height : 500
                      });

postApp.on('ready', function ready(){ });
