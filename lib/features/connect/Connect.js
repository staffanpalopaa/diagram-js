import {
  getMid
} from '../../layout/LayoutUtil';


export default function Connect(eventBus, dragging, modeling, rules) {

  // rules

  function canConnectReverse(source, target) {
    return canConnect(target, source);
  }

  function canConnect(source, target) {
    return rules.allowed('connection.create', {
      source: source,
      target: target
    });
  }


  // event handlers

  eventBus.on('connect.hover', function(event) {
    var context = event.context,
        start = context.start,
        hover = event.hover,
        canExecute;

    // cache hover state
    context.hover = hover;

    canExecute = context.canExecute = canConnect(start, hover);

    // ignore hover
    if (canExecute === null) {
      return;
    }

    if (canExecute !== false) {
      context.target = hover;
      context.source = start;

      return;
    }

    // attempt to connect hover -> start
    canExecute = context.canExecute = canConnectReverse(start, hover);


    // ignore hover
    if (canExecute === null) {
      return;
    }

    if (canExecute !== false) {
      context.target = start;
      context.source = hover;
    }
  });

  eventBus.on([ 'connect.out', 'connect.cleanup' ], function(event) {
    var context = event.context;

    context.target = null;
    context.source = null;
    context.hover = null;

    context.canExecute = false;
  });

  eventBus.on('connect.end', function(event) {

    var context = event.context,
        start = context.start,
        hover = context.hover,
        startPosition = context.startPosition,
        source = context.source,
        target = context.target,
        endPosition = {
          x: event.x,
          y: event.y
        },
        canExecute = context.canExecute || canConnect(start, hover);

    // TODO(nikku): swap -> must verify if canConnect(hover, start) works
    if (!canExecute) {
      return false;
    }

    var attrs = null,
        hints = {
          connectionStart: start === source ? startPosition : endPosition,
          connectionEnd: start === source ? endPosition : startPosition
        };

    if (typeof canExecute === 'object') {
      attrs = canExecute;
    }

    modeling.connect(source, target, attrs, hints);
  });


  // API

  /**
   * Start connect operation.
   *
   * @param {DOMEvent} event
   * @param {djs.model.Base} source
   * @param {Point} [startPosition]
   * @param {Boolean} [autoActivate=false]
   */
  this.start = function(event, source, startPosition, autoActivate) {

    if (typeof startPosition !== 'object') {
      autoActivate = startPosition;
      startPosition = getMid(source);
    }

    dragging.init(event, 'connect', {
      autoActivate: autoActivate,
      data: {
        shape: source,
        context: {
          start: source,
          startPosition: startPosition
        }
      }
    });
  };
}

Connect.$inject = [
  'eventBus',
  'dragging',
  'modeling',
  'rules'
];
