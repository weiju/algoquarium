/*
 * Title:   Javascript Imageviewer.
 * Author:  Wei-ju Wu
 * Date:    September 4th, 2010
 * License: New BSD (only this file)
 * Description: An image viewer implemented with Javascript and Raphael/SVG.
 * For demonstration purposes, I have added a couple of controls that
 * make it similar to the viewer on brain-map.org.
 */
// Just a couple of helpers that we bind to the imageview namespace.
var imageview = { };

// map and filter are generally useful to have
imageview.map = function(objs, f) {
    for (var i = 0; i < objs.length; i++) { f(objs[i]); }
};
imageview.filter = function(objs, pred) {
    var result = [];
    for (var i = 0; i < objs.length; i++) {
        if (pred(objs[i])) { result.push(objs[i]); }
    }
    return result;
};

// Creates a closed path out of an array of coordinates.
// The coordinates are assumed to be in the format
// (x1, y1, ... xn, yn).
imageview.closedPath = function(points) {
    var numPoints = points.length;
    var result = 'M' + points[0] + ' ' + points[1] + ' ';
    for (var i = 2; i < numPoints; i+= 2) {
        result += 'L' + points[i] + ' ' + points[i + 1] + ' ';
    }
    result += 'L' + points[0] + ' ' + points[1];
    return result;
};

/*
 * A map object to quickly navigate within a large picture.
 */
function Map(canvas, viewImage) {
    var X      = 5;
    var Y      = 5;
    var WIDTH  = 120;
    var HEIGHT = 136;
    var viewer = viewer;
    canvas.image('slide_overview.png', X, Y, WIDTH, HEIGHT);
    var viewfinder = canvas.rect(5, 5, WIDTH, HEIGHT);
    var oldx = 0;
    var oldy = 0;
    viewfinder.attr({ stroke: 'red'});
    viewfinder.attr('stroke-width', '1.5');
    viewfinder.attr('fill', 'white');
    viewfinder.attr('fill-opacity', '0.1');
    viewfinder.attr('clip-rect', '5 5 ' + WIDTH + ' ' + HEIGHT);
    this.reposition = function() { };

    function startDrag() {
        oldx = viewfinder.attr("x");
        oldy = viewfinder.attr("y");
    }
    function moveDrag(dx, dy) {
        viewfinder.attr({x: oldx + dx, y: oldy + dy});
        var transx = -dx * 1;
        var transy = -dy * 1;
        viewImage.translate(transx, transy);
    }
    function endDrag() { }
    viewfinder.drag(moveDrag, startDrag, endDrag);
}

/*
 * Branding of the viewer.
 */
function Logo(canvas) {
    var WIDTH  = 85;
    var HEIGHT = 94;
    function calculateY() { return canvas.height - HEIGHT; }
    var img = canvas.image('logo.png', 0, calculateY(), WIDTH, HEIGHT);
    this.reposition = function() {
        img.attr({y: calculateY() });
    };
}

/*
 * This is the presented image.
 */
function ViewImage(canvas) {
    var x = 100;
    var y = 30;
    var width = 800;
    var height = 904;
    var img = canvas.image('slice1.png', x, y, width, height);
    var oldx = 0;
    var oldy = 0;

    function startDrag() {
        oldx = img.attr("x");
        oldy = img.attr("y");
    }
    function moveDrag(dx, dy) {
        img.attr({x: oldx + dx, y: oldy + dy});
    }
    function endDrag() { }
    img.drag(moveDrag, startDrag, endDrag);
    this.reposition = function() { };
    this.scale = function(scalefactor) {
        img.scale(scalefactor, scalefactor);
    };
    this.translate = function(tx, ty) {
        img.translate(tx, ty);
    };
}

/*
 * An indicator of the local position of the view (e.g. a slice in the
 * brain).
 */
function Thumb(canvas) {
    var WIDTH  = 170;
    var HEIGHT = 129;
    var MARGIN = 5;
    var oldx = 0;
    var oldy = 0;
    var marginX = MARGIN;
    var marginY = MARGIN;
    var img    = canvas.image('brain_thumb.png', 0, 0,
                              WIDTH, HEIGHT);
    function calculateX() { return canvas.width - marginX - WIDTH; }
    function calculateY() { return canvas.height - marginY - HEIGHT; }

    this.reposition = function() {
        img.attr({x: calculateX(), y: calculateY()});
    };
    function startDrag() {
        oldx = img.attr("x");
        oldy = img.attr("y");
    }
    function moveDrag(dx, dy) { img.attr({x: oldx + dx, y: oldy + dy}); }
    function endDrag() { }
    img.drag(moveDrag, startDrag, endDrag);
}

/*
 * Just a helper object to indicate the scale of the current view.
 */
function Scale(canvas, label) {
    var x            = 10;
    var y            = 530;
    var WIDTH        = 100;
    var MID          = WIDTH / 2;
    var QUARTER      = WIDTH / 4;
    var LONG_HEIGHT  = 25;
    var SHORT_HEIGHT = 15;
    var STROKE_WIDTH = 1.5;
    var l = [];

    l[0] = canvas.path('M' + x + ' ' + y + 'L' + (x + WIDTH) + ' ' + y);
    l[1] = canvas.path('M' + x + ' ' + y + 'L' + x + ' ' + (y - LONG_HEIGHT));
    l[2] = canvas.path('M' + (x + WIDTH) + ' ' + y + 'L' + (x + WIDTH) + ' ' +
                       (y - LONG_HEIGHT));
    l[3] = canvas.path('M' + (x + MID) + ' ' + y + 'L' + (x + MID) + ' ' +
                       (y - SHORT_HEIGHT));
    l[4] = canvas.path('M' + (x + QUARTER) + ' ' + y +
                       'L' + (x + QUARTER) + ' ' + (y - SHORT_HEIGHT));
    l[5] = canvas.path('M' + (x + QUARTER * 3) + ' ' + y +
                       'L' + (x + QUARTER * 3) + ' ' +
                       (y - SHORT_HEIGHT));
    for (var i = 0; i < l.length; i++) {
        l[i].attr('stroke-width', '' + STROKE_WIDTH);
    }
    canvas.text(x + MID, y + 15, label);
    this.reposition = function() { };
}


/**
 * The slider object controls the size of the given object.
 */
function MagSlider(canvas, viewImage) {
    var MARGIN   = 15;
    var WIDTH    = 200;
    var HEIGHT   = 20;
    var SLIDER_WIDTH = 15;
    var SLIDER_HEIGHT = 40;
    var triangle = null;
    var slider   = null;
    var x1 = 0, y1 = 0, x2 = 0, y2 = 0, oldx = 0;

    function calcPoints() {
        x1 = canvas.width / 2 - WIDTH / 2;
        y1 = canvas.height - MARGIN - HEIGHT;
        x2 = x1 + WIDTH;
        y2 = y1 + HEIGHT;
    }
    function makePoints() { return [ x1, y2, x2, y2, x2, y1]; }
    
    // the "magnifying" triangle
    calcPoints();
    var pathString = imageview.closedPath(makePoints());
    triangle = canvas.path(pathString);
    triangle.attr({ fill: '#ffffff'});
    triangle.attr('stroke-width', '1.5');
    triangle.attr('fill-opacity', '0.5');
    slider = canvas.rect(x1, y1 - HEIGHT / 2, SLIDER_WIDTH, SLIDER_HEIGHT, 5);
    slider.attr({ fill: '#ffffff'});

    this.reposition = function() {
        calcPoints();
        triangle.attr({ path: imageview.closedPath(makePoints()) });
        slider.attr({x: x1 });
        slider.attr({y: y1 - HEIGHT / 2 });
    };
    function startDrag() {
        oldx = slider.attr("x");
    }
    function moveDrag(dx, dy) {
        if (oldx + dx < x1) {
            dx = 0;
        } else if (oldx + dx > (x2 - SLIDER_WIDTH / 2)) {
            dx -= (oldx + dx) - (x2 - SLIDER_WIDTH / 2);
        }
        var scale = dx / 500.0;
        var scaleFactor = 1.0 + scale;        
        viewImage.scale(scaleFactor);
        slider.attr({x: oldx + dx});
    }
    function endDrag() { }
    slider.drag(moveDrag, startDrag, endDrag);
}

/*
 * The Viewer class's main responsibility is to maintain the consistency of
 * the view and its sub objects.
 */
function Viewer(id, options) {
    var selector = '#' + id;
    var canvas = null;
    var viewerObjects = [];

    /**
     * Public API.
     * - resize(): call after the element which defines the
     *   canvas has been resized
     */
    this.resize = function() {
        canvas.setSize($(selector).width(), $(selector).height());
        imageview.map(viewerObjects, function(obj) { obj.reposition(); });
        return false;
    };

    // initialization
    canvas = Raphael(id, $(selector).width(), $(selector).height());
    var viewImage = new ViewImage(canvas);
    viewerObjects.push(viewImage);
    viewerObjects.push(new Map(canvas, viewImage));
    viewerObjects.push(new Thumb(canvas));
    viewerObjects.push(new Scale(canvas, '640 microns'));
    viewerObjects.push(new Logo(canvas));
    viewerObjects.push(new MagSlider(canvas, viewImage));
    this.resize();
    
    var win = this;
    $(window).resize(function () {
        return win.resize();
    });
}
