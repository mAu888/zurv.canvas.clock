var zurv = zurv || {};

zurv.canvas = {};

/**
 * Point.
 * @param x
 * @param y
 */
zurv.canvas.Point = function(x, y) {
	this.x = x;
	this.y = y;
};

zurv.canvas.Point.prototype = new Object();

zurv.canvas.Point.prototype.distance = function() {
	if(arguments[0] instanceof zurv.canvas.Point) {
		var deltaX = arguments[0].x - this.x,
			deltaY = arguments[0].y - this.y;
		
		return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
	}
	else if(arguments.length == 2) {
		var deltaX = arguments[0] - this.x,
			deltaY = arguments[1] - this.y;
		
		return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
	}
	else {
		throw 'invalid argument';
	}
};

zurv.canvas.Vector2D = function(x, y) {
	this.x = x;
	this.y = y;
};

zurv.canvas.Vector2D.prototype = new zurv.canvas.Point();

zurv.canvas.Vector2D.prototype.length = function() {
	return Math.sqrt(this.x * this.x + this.y * this.y);
};

/**
 *  Bezier curve control point.
 */
zurv.canvas.BezierPoint = function(x, y, left, right) {
	this.x = x;
	this.y = y;
	this.left = typeof left !== 'undefined' ? left : new zurv.canvas.Point(x, y);
	this.right = typeof right !== 'undefined' ? right : new zurv.canvas.Point(x, y);
};

zurv.canvas.BezierPoint.prototype = new zurv.canvas.Point();

/**
 * Particle
 */
zurv.canvas.Particle = function(x, y, acceleration, mass) {
	this.x = x;
	this.y = y;
	
	this._acceleration = acceleration;
	this._mass = mass;
};

zurv.canvas.Particle.prototype = new zurv.canvas.Point();

zurv.canvas.Particle.prototype.acceleration = function() {
	if(arguments[0] instanceof zurv.canvas.Point) {
		this._acceleration = arguments[0];
	}
	else {
		return this._acceleration;
	}
};

/**
 * Drawable.
 * @param styles
 */
zurv.canvas.Drawable = function(styles) {
	this._styles = styles;
};

zurv.canvas.Drawable.prototype = new Object();

zurv.canvas.Drawable.prototype.styles = function(styles) {
	this._styles = {
		fill: styles.fill || '',
		stroke: styles.stroke || 'none',
		width: styles.width || '',
		cap: styles.cap || ''
	};
};

zurv.canvas.Drawable.prototype.saveStyles = function(g) {
	this._globalStyles = {
	    fill: g.fillStyle,
	    stroke: g.strokeStyle,
	    width: g.lineWidth,
	    cap: g.lineCap
	};
};

zurv.canvas.Drawable.prototype.beforeDraw = function(g) {
	this.saveStyles(g);
	this.applyStyles(g);
};

zurv.canvas.Drawable.prototype.afterDraw = function(g) {
	this.applyStyles(g, this._globalStyles);
};

zurv.canvas.Drawable.prototype.applyStyles = function(g, styles) {
	if(typeof styles === 'undefined') styles = this._styles;
	
	if(styles.fill) g.fillStyle = styles.fill;
	if(styles.stroke) g.strokeStyle = styles.stroke;
	if(styles.width) g.lineWidth = styles.width;
	if(styles.cap) g.lineCap = styles.cap;
};


/**
 * Canvas.
 * @param context
 */
zurv.canvas.Canvas = function(context, width, height) {
	this._context = context;
	this._width = width;
	this._height = height;
	
	this._drawables = [];
};

zurv.canvas.Canvas.prototype = new zurv.canvas.Drawable();

zurv.canvas.Canvas.prototype.add = function() {
	if(arguments.length > 0) {
		for(var i = 0; i < arguments.length; i++) {
			if(arguments[i] instanceof zurv.canvas.Drawable) this._drawables.push(arguments[i]);
		}
	}
	else {
		throw 'invalid argument';
	}
};

zurv.canvas.Canvas.prototype.draw = function() {
	// Reverse for layering (first item is lowest in paint stack)
	var objects = this._drawables.reverse();
	
	this.beforeDraw(this._context);
	
	// Reset canvas
	this.reset();
	
	for(var i = 0; i < objects.length; i++) {
		objects[i].draw(this._context);
	}
	
	this.afterDraw(this._context);
};

zurv.canvas.Canvas.prototype.reset = function() {
	var current = this._context.globalCompositeOperation;
	
	this._context.globalCompositeOperation = 'source-atop';
	this._context.fillRect(0, 0, this._width, this._height);
	
	this._context.globalCompositeOperation = current;
};


/**
 * Circle.
 * @param styles
 */
zurv.canvas.Circle = function(center, radius) {
	this._center = center;
	this._radius = radius;
};

zurv.canvas.Circle.prototype = new zurv.canvas.Drawable();

zurv.canvas.Circle.prototype.center = function(center) {
	if(typeof center === 'undefined') {
		return this._center;
	}
	else if(center instanceof zurv.canvas.Point) {
		this._center = center;
	}
	else {
		throw new 'Invalid argument';
	}
};

zurv.canvas.Circle.prototype.radius = function() {
	if(typeof arguments[0] !== 'undefined') {
		this._radius = arguments[0];
	}
	else {
		return this._radius;
	}
};

zurv.canvas.Circle.prototype.draw = function(g) {
	this.beforeDraw(g);
	
	g.beginPath();
	
	g.arc(this._center.x, this._center.y, this._radius, 0, Math.PI * 2);
	
	// Apply styles
	if(this._styles.fill !== 'none') g.fill();
	if(this._styles.stroke !== 'none') g.stroke();
	
	g.closePath();
	
	this.afterDraw(g);
};



/**
 * Line.
 * @param styles
 */
zurv.canvas.Line = function() {
	this._steps = 360;

	if(arguments.length == 2) {
		this._from = arguments[0];
		this._to = arguments[1];
		
		var deltaX = this._to.x - this._from.x,
			deltaY = this._to.y - this._from.y;
		
		this._length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
	}
	else if(arguments.length == 4 || arguments.length == 5) {
		var steps = arguments[1] / 2, // Divide the circle in how many parts
			current = arguments[2], // Current line position
			length = arguments[3], // Line length
			clocklike = arguments[4] || false; // Clocklike
			
		this._from = arguments[0]; // Center of circle
		
		this._length = length;
		this._steps = steps;
		
		if(clocklike) {
			this._to = new zurv.canvas.Point(
				this._from.x + length * Math.cos(current * Math.PI / steps - Math.PI / 2),
				this._from.y + length * Math.sin(current * Math.PI / steps - Math.PI / 2)
			);
		}
		else {
			this._to = new zurv.canvas.Point(
				this._from.x + length * Math.cos(current * Math.PI / steps),
				this._from.y - length * Math.sin(current * Math.PI / steps)
			);
		}
	}
	else {
		throw 'unknown number of parameters';
	}
};

zurv.canvas.Line.prototype = new zurv.canvas.Drawable();

zurv.canvas.Line.prototype.from = function() {
	if(arguments.length < 1) {
		return this._from;
	}
	else if(arguments.length == 1 && arguments[0] instanceof zurv.canvas.Point) {
		this._from = arguments[0];
	}
	else {
		this._from = new zurv.canvas.Point(arguments[0], arguments[1]);
	} 
};

zurv.canvas.Line.prototype.to = function() {
	if(arguments.length < 1) {
		return this._to;
	}
	else if(arguments[0] instanceof zurv.canvas.Point) {
		this._to = arguments[0];
	}
	else if(arguments.length == 1 || (arguments.length == 2 && typeof arguments[1] === 'boolean')) {
		var current = arguments[0];
		if(typeof arguments[1] === 'boolean' && arguments[1]) {
			this._to = new zurv.canvas.Point(
				this._from.x + this._length * Math.cos(current * Math.PI / this._steps - Math.PI / 2),
				this._from.y + this._length * Math.sin(current * Math.PI / this._steps - Math.PI / 2)
			);
		}
		else {
			this._to = new zurv.canvas.Point(
				this._from.x + this._length * Math.cos(current * Math.PI / this._steps),
				this._from.y - this._length * Math.sin(current * Math.PI / this._steps)
			);
		}
	}
	else if(arguments.length == 2) {
		this._to = new zurv.canvas.Point(arguments[0], arguments[1]);
	}
	else {
		throw 'invalid arguments';
	}
};

zurv.canvas.Line.prototype.draw = function(g) {
	this.beforeDraw(g);
	
	g.beginPath();
	
	g.moveTo(this._from.x, this._from.y);
	g.lineTo(this._to.x, this._to.y);
	
	// Apply styles
	g.fill();
	g.stroke();
	
	g.closePath();
	
	this.afterDraw(g);
};

/**
 * Path.
 */
zurv.canvas.Path = function() {
	this._points = [];
	
	this._drawHandles = false;
	this._drawPoints = false;
};

zurv.canvas.Path.prototype = new zurv.canvas.Drawable();

zurv.canvas.Path.prototype.drawHandles = function(draw) {
	this._drawHandles = !!draw;
};

zurv.canvas.Path.prototype.drawPoints = function(draw) {
	this._drawPoints = !!draw;
};

zurv.canvas.Path.prototype.point = function() {
	if(arguments.length < 1) {
		throw new 'Too few arguments';
	}
	else if(arguments[0] instanceof zurv.canvas.BezierPoint) {
		this._points.push(arguments[0]);
	}
	else {
		return this._points[arguments[0]] ? this._points[arguments[0]] : null;
	}
};

zurv.canvas.Path.prototype.smooth = function() {
	for(var i = 0, j = this._points.length; i < j; i++) {
		var current = this._points[i],
			next = i < j - 1 ? this._points[i + 1] : null,
			prev = i > 0 ? this._points[i - 1] : null;
		
		// blubb
		if(prev && next) {
			var slope = 0;
			if(next.x - prev.x != 0) slope = (next.y - prev.y) / (next.x - prev.x);
			
			current.left.x = current.x - ((current.x - prev.x) / 3);
			current.left.y = slope / 3 * (prev.x - current.x) + current.y;

			current.right.x = current.x + ((next.x - current.x) / 3);
			current.right.y = slope / 3 * (next.x - current.x) + current.y;
		} 
	}
};

zurv.canvas.Path.prototype.draw = function(g) {
	var last = this._points[0];
	
	this.beforeDraw(g);
	
	g.beginPath();
	
	g.moveTo(last.x, last.y);
	for(var i = 1; i < this._points.length; i++) {
		g.bezierCurveTo(last.right.x, last.right.y, this._points[i].left.x, this._points[i].left.y, this._points[i].x, this._points[i].y);
		
		last = this._points[i];
	}
	
	g.fill();
	g.stroke();
	
	g.closePath();
	
	// handles
	if(this._drawHandles) {
		g.strokeStyle = 'lightGreen';
		g.strokeWidth = 1;
		
		for(var i = 0; i < this._points.length; i++) {
			g.beginPath();
			
			g.moveTo(this._points[i].x, this._points[i].y);
			g.lineTo(this._points[i].left.x, this._points[i].left.y);
			
			g.moveTo(this._points[i].x, this._points[i].y);
			g.lineTo(this._points[i].right.x, this._points[i].right.y);
			
			g.stroke();
			
			g.closePath();
		}
	}
	
	// points
	if(this._drawPoints) {
		g.fillStyle = '#fff';
		g.strokeStyle = 'none';
		
		for(var i = 0; i < this._points.length; i++) {
			var x = this._points[i].x,
				y = this._points[i].y;
			g.fillRect(Math.round(x - 1), Math.round(y - 1), 3, 3);
		}
	}
	
	this.afterDraw(g);
};

zurv.canvas.Path.prototype.empty = function() {
	this._points = [];
};