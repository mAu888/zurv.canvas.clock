var zurv = zurv || {};

zurv.canvas = {};

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

zurv.canvas.Canvas.prototype = new Object();

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
	
	// Reset canvas
	this.reset();
	
	for(var i = 0; i < objects.length; i++) {
		objects[i].draw(this._context);
	}
};

zurv.canvas.Canvas.prototype.reset = function() {
	this._context.fillStyle = '#f5f5f5';
	this._context.fillRect(0, 0, this._width, this._height);
};

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
 * Circle.
 * @param styles
 */
zurv.canvas.Circle = function(center, radius) {
	this._center = center;
	this._radius = radius;
};

zurv.canvas.Circle.prototype = new zurv.canvas.Drawable();

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