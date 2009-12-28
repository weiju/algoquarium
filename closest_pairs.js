// Namespace
var cp = {};

// Point class
cp.Point = function (_x, _y) {
  this.x = _x;
  this.y = _y;
};
cp.square = function(x) { return x * x; };
cp.Point.prototype.toString = function () {
	return '(' + this.x + ', ' + this.y + ')';
};
cp.Point.prototype.dist = function (p) {
  return Math.sqrt(cp.square(p.x - this.x) + cp.square(p.y - this.y));
};

// PointSet class
cp.PointSet = function () {
	this.points = [];
};
cp.PointSet.prototype.add =	function (point) {
	this.points.push(point);
};
cp.PointSet.prototype.length = function () {
	return this.points.length;
};
cp.PointSet.prototype.get = function (index) {
	return this.points[index];
};
cp.PointSet.prototype.sort = function () {
	this.points.sort(function (p1, p2) {
		return p1.x - p2.x;
	});
};
cp.PointSet.prototype.toString = function () {
	var result = '{';
	for (var i = 0; i < this.points.length; i++) {
		var p = this.points[i];
		if (i > 0) { result += ', '; }
		result += p.toString();
	}
	result += '}';
	return result;
};

// helper functions
if (typeof Log === "undefined" || ! Log) {
	var Log = {};
}
Log.enable = true;
Log.debug = function(msg) {
	if (Log.enable && console) {
		console.log('DEBUG: ' + msg);
	}
};

