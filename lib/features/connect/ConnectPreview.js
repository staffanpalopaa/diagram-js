var HIGH_PRIORITY = 1100,
    LOW_PRIORITY = 900;

var MARKER_OK = 'connect-ok',
    MARKER_NOT_OK = 'connect-not-ok';

/**
 * Shows connection preview during connect.
 *
 * @param {didi.Injector} injector
 * @param {EventBus} eventBus
 * @param {Canvas} canvas
 */
export default function ConnectPreview(injector, eventBus, canvas) {
  var connectionPreview = injector.get('connectionPreview', false);

  eventBus.on('connect.move', function(event) {
    var context = event.context,
        source = context.source,
        target = context.target,
        canConnect = context.canExecute,
        lastWaypoints = context.lastWaypoints;

    var endPosition = {
      x: event.x,
      y: event.y
    };


    if (connectionPreview) {

      var hints = {
        source: source,
        target: target,
        connectionEnd: endPosition,
        waypoints: lastWaypoints
      };

      context.lastWaypoints = connectionPreview.drawPreview(context, canConnect, hints);

    }
  });

  eventBus.on('connect.hover', LOW_PRIORITY, function(event) {
    var context = event.context,
        hover = event.hover,
        canExecute = context.canExecute;

    // ignore hover
    if (canExecute === null) {
      return;
    }

    canvas.addMarker(hover, canExecute ? MARKER_OK : MARKER_NOT_OK);
  });

  eventBus.on([ 'connect.out', 'connect.cleanup' ], HIGH_PRIORITY, function(event) {
    var context = event.context;

    // remove marker before target is removed from context
    if (context.target) {
      canvas.removeMarker(context.target, context.canExecute ? MARKER_OK : MARKER_NOT_OK);
    }
  });

  eventBus.on('connect.cleanup', function(event) {
    if (connectionPreview) {
      connectionPreview.cleanUp(event.context);
    }
  });
}

ConnectPreview.$inject = [
  'injector',
  'eventBus',
  'canvas'
];
