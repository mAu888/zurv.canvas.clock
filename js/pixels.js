(function(window) {
	var d = document;
	
	window.onload = function() {
		var pixels = [],
			c = d.getElementById('canvas'),
			context = c.getContext('2d'),
			CIRCLES = 20,
			SPEED = 5,
			MIN_SPEED = .25;
	
		c.width = document.width;
		c.height = document.height;
		
		var canvas = new zurv.canvas.Canvas(context, c.width, c.height);
		
		// force
		var force = new zurv.canvas.Circle(new zurv.canvas.Point(c.width/2 -1, c.height/2 - 1), 10);
		force.styles({ fill: 'rgba(255, 0, 0, .3)', stroke: 'rgba(255,0,0,.5)', width: 2 });
		force.Q = -0.2;
		canvas.add(force);
		
		// particles
		for (var i = 0; i < CIRCLES; i++) {
			var x = Math.floor(Math.random() * (c.width - 20) + 10),
				y = Math.floor(Math.random() * (c.height - 20) + 10),
				pixel = new zurv.canvas.Circle(
				    new zurv.canvas.Particle(
				        x, y, new zurv.canvas.Vector2D(Math.min(Math.random()*2-1, MIN_SPEED) * SPEED, Math.min(Math.random()*2-1, MIN_SPEED) * SPEED), 1), // last parameter is mass (not used right now)
				    //(Math.random() * 10 + 10) - 5
				        5
				);
			
			pixel.styles({
			    fill: 'rgba(' + Math.floor(Math.random() * 255) + ', ' + Math.floor(Math.random() * 255) + ', ' + Math.floor(Math.random() * 255) + ', 1)',
			    stroke: 'none'
			});
			
			canvas.add(pixel);
			
			pixels.push(pixel);
		}
		
		canvas.styles({ fill: 'rgba(0, 0, 0, 1);' });
		canvas._context.globalCompositeOperation = 'lighter';
		
		(function() {
			var gi = 0;
			
			var thread = new zurv.Thread(function(o) {
				canvas.draw();
				
				gi += .02;
				
				for(var i = 0; i < pixels.length; i++) {
					var acceleration = pixels[i].center().acceleration(),
						radius = pixels[i].radius();
					
					// calculate force
					var direction = new zurv.canvas.Vector2D(force.center().x - pixels[i].center().x, force.center().y - pixels[i].center().y),
						distance = direction.length(),
						actForce = (force.Q * 1000) / (distance * distance);

					var length = direction.length();
					
					//normalize
					if(distance > 10) {
						direction.x = direction.x / length * actForce;
						direction.y = direction.y / length * actForce;
					}
					else {
						direction.x = 0; direction.y = 0;
					}
					
					if(isNaN(direction.x)) direction.x = 0;
					if(isNaN(direction.y)) direction.y = 0;
					
					acceleration.x += direction.x;
					acceleration.y += direction.y;
					
					acceleration.x = (acceleration.x < 0 ? -1 : 1) * Math.min(Math.abs(acceleration.x), 10);
					acceleration.y = (acceleration.y < 0 ? -1 : 1) * Math.min(Math.abs(acceleration.y), 10);
					
					pixels[i].radius(Math.max(acceleration.length(), 1));
					
					if(pixels[i].center().x + radius + acceleration.x > c.width || pixels[i].center().x + acceleration.x - radius < 0) {
						acceleration.x *= -1;
					}
					else {
						pixels[i].center().x += acceleration.x;
					}
					
					if(pixels[i].center().y + acceleration.y + radius > c.height || pixels[i].center().y + acceleration.y - radius < 0) {
						acceleration.y *= -1;
					}
					else{ 
						pixels[i].center().y += acceleration.y;
					}
				}
			}, false, 1000/30);
			
			thread.run();
			
			window.addEventListener('click', function() {
				thread.running() ? thread.stop() : thread.notify();
			}, false);
		})();
	};
})(window);