(function( win){

    /**
     * [eventHandler Gestion des evenenemt en JS]
     * @param  {[type]} sEventName [nom de l'event à ecouter]
     * @param  {[type]} oParam     [{element, callBack, criteria}]
     * @return {[type]}            [description]
     */
    function eventHandler( sEventName, oParam) {

      var element     = oParam.element || document.documentElement,
          bUseCapture = oParam.useCapture || false,
          fDefault    = function( e){ return true;},
          _handler;

      function _delegate( fCriteria) {

          _handler = function ( e) {
            var el = e.target;
            do {
              if ( !fCriteria.call(null, el)) continue;

              e.delegateTarget = el;

              if (typeof oParam.callBack === 'function') {
                oParam.callBack.apply( this, arguments);
              }

              return;

            } while( (el = el.parentNode) );
          };

          return _handler;
      }

      _handler = _delegate( oParam.criteria || fDefault);

      _handler.destroy = function () {
        return element.removeEventListener( sEventName, _handler, bUseCapture);
      };

      element.addEventListener( sEventName, _handler, bUseCapture);
      return _handler;
    }

    win.eventHandler = eventHandler;

})( window);
