var zurv = zurv || {};

/**
 * Thread.
 */
zurv.Thread = function(threadFunc, expires, tick) {
	this._tick = 10;
	if(typeof tick !== 'undefined' && tick) this._tick = tick;
	if(typeof expires !== 'undefined' && expires) this._expires = expires * 1000;
	
	this._running = false;
	this._threadFunc = threadFunc;
};

zurv.Thread.prototype = new Object();

/**
 * Start thread.
 */
zurv.Thread.prototype.run = function() {
	this._running = true;
	
	var run = function() {
		if(this._expires * 1000 < this._tick) return;
		if(! this._running) return;
		
		this._threadFunc();
		
		if(typeof this._expires !== 'undefined') this._expires -= this._tick;
		
		var base = this;
		window.setTimeout(function() {
			run.apply(base);
		}, this._tick);
	};
	
	run.apply(this);
};

/**
 * Stop thread.
 */
zurv.Thread.prototype.stop = function() {
	this._running = false;
};

/**
 * Continue thread.
 */
zurv.Thread.prototype.notify = function() {
	this.run();
};