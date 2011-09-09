(function(window) {
	var d = document;
	
	window.onload = function() {
		var pixels = [],
			c = d.getElementById('canvas'),
			context = c.getContext('2d'),
			CIRCLES = 150,
			SPEED = 7,
			MIN_SPEED = .25;
	
		c.width = document.width;
		c.height = document.height;
		
		var canvas = new zurv.canvas.Canvas(context, c.width, c.height);
		
		// force
		var f1 = new zurv.canvas.Circle(new zurv.canvas.Point(c.width/2 - 1, c.height/2 - 1), 10);
		f1.styles({ fill: 'rgba(255, 0, 0, .3)', stroke: 'rgba(255,0,0,.5)', width: 2 });
		f1.Q = -0.9;
		
		var f2 = new zurv.canvas.Circle(new zurv.canvas.Point(c.width/2 - 201, c.height/2 -1), 8);
		f2.styles({ fill: 'rgba(255, 0, 0, .3)', stroke: 'rgba(255,0,0,.5)', width: 2 });
		f2.Q = -0.8;
		
		var f3 = new zurv.canvas.Circle(new zurv.canvas.Point(c.width/2 + 201, c.height/2 - 1), 8);
		f3.styles({ fill: 'rgba(255, 0, 0, .3)', stroke: 'rgba(255,0,0,.5)', width: 2 });
		f3.Q = -0.8;

		var f4 = new zurv.canvas.Circle(new zurv.canvas.Point(c.width/2 + 451, c.height/2 - 1), 5);
		f4.styles({ fill: 'rgba(255, 0, 0, .3)', stroke: 'rgba(255,0,0,.5)', width: 2 });
		f4.Q = -0.4;
		
		var f5 = new zurv.canvas.Circle(new zurv.canvas.Point(c.width/2 + - 451, c.height/2 - 1), 5);
		f5.styles({ fill: 'rgba(255, 0, 0, .3)', stroke: 'rgba(255,0,0,.5)', width: 2 });
		f5.Q = -0.4;
		
		var forces = [f1, f2, f3, f4, f5];
		
		canvas.add(f1, f2, f3, f4, f5);
		
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
					
					for(var j = 0; j < forces.length; j++) {
						var force = forces[j];
						
						// calculate force
						var direction = new zurv.canvas.Vector2D(force.center().x - pixels[i].center().x, force.center().y - pixels[i].center().y),
							distance = direction.length(),
							actForce = (force.Q * 1000) / (distance * distance);
						
						//normalize
						if(distance > 10) {
							direction.x = direction.x / distance * actForce;
							direction.y = direction.y / distance * actForce;
						}
						else {
							direction.x = direction.x / distance * -actForce;
							direction.y = direction.y / distance * -actForce;
						}
						
						if(isNaN(direction.x)) direction.x = 0;
						if(isNaN(direction.y)) direction.y = 0;
						
						acceleration.x += direction.x;
						acceleration.y += direction.y;
						
						acceleration.x = (acceleration.x < 0 ? -1 : 1) * Math.min(Math.abs(acceleration.x), 10);
						acceleration.y = (acceleration.y < 0 ? -1 : 1) * Math.min(Math.abs(acceleration.y), 10);
					}
					
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