(function(window) {
	var d = document;
	
	window.onload = function() {
		var c = d.getElementById('canvas'),
			context = c.getContext('2d');
	
		c.width = document.width;
		c.height = document.height;
		
		var canvas = new zurv.canvas.Canvas(context, c.width, c.height);
		
		canvas.styles({ fill: 'rgba(0, 0, 0, 1);' });
		canvas._context.globalCompositeOperation = 'lighter';
		
		var sine = new zurv.canvas.Path(),
			cosine = new zurv.canvas.Path(),
			baseline = new zurv.canvas.Line(
			    new zurv.canvas.Point(0, 200.5),
			    new zurv.canvas.Point(1000, 200.5)
			);
		
		baseline.styles({ stroke: 'rgba(255, 255, 255, .2)', width: 1 });
		
		sine.styles({ stroke: 'rgba(200,255,0,.5)', fill: 'transparent', width: 5, cap: 'round' });
		cosine.styles({ stroke: 'rgba(250,2,60, .5)', fill: 'transparent', width: 5, cap: 'round' });
		
		canvas.add(baseline, sine, cosine);

		(function() {
			var globalIteration = 0;
			
			var t = new zurv.Thread(function() {
				sine.empty();
				cosine.empty();
				
				globalIteration -= .0275;
				for(var i = 0; i < 10; i += .5) {
					sine.point(new zurv.canvas.BezierPoint(i * 75 + 50, Math.sin(i + globalIteration) * 75 + 200));
					cosine.point(new zurv.canvas.BezierPoint(i * 75 + 50, Math.cos(i + globalIteration) * 75 + 200));
				}
				
				sine.smooth();
				cosine.smooth();
				
				canvas.draw();
			}, null, 1000/24);
			
			t.run();
			
			window.addEventListener('keyup', function(e) {
				if(e.keyCode == 80 || e.keyCode == 'p') t.running() ? t.stop() : t.notify();
			}, false);
		})();
	};
})(window);