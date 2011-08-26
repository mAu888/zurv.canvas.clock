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
	if(arguments.length == 2) {
		this.from = arguments[0];
		this.to = arguments[1];
	}
	else if(arguments.length == 4 || arguments.length == 5) {
		var steps = arguments[1] / 2, // Divide the circle in how many parts
			current = arguments[2], // Current line position
			length = arguments[3], // Line length
			clocklike = arguments[4] || false; // Clocklike
			
		this.from = arguments[0]; // Center of circle
		
		if(clocklike) {
			this.to = new zurv.canvas.Point(
				this.from.x + length * Math.cos(current * Math.PI / steps - Math.PI / 2),
				this.from.y + length * Math.sin(current * Math.PI / steps - Math.PI / 2)
			);
		}
		else {
			this.to = new zurv.canvas.Point(
				this.from.x + length * Math.cos(current * Math.PI / steps),
				this.from.y - length * Math.sin(current * Math.PI / steps)
			);
		}
	}
	else {
		throw 'unknown number of parameters';
	}
};

zurv.canvas.Line.prototype = new zurv.canvas.Drawable();

zurv.canvas.Line.prototype.draw = function(g) {
	this.beforeDraw(g);
	
	g.beginPath();
	
	g.moveTo(this.from.x, this.from.y);
	g.lineTo(this.to.x, this.to.y);
	
	// Apply styles
	g.fill();
	g.stroke();
	
	g.closePath();
	
	this.afterDraw(g);
};