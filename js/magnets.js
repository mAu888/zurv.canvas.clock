(function(window) {
	var d = document;
	
	window.onload = function() {
		
		var canvas = d.getElementById('magnets'),
			g = canvas.getContext('2d');
		
		var resetViewport = function(g) {
			g.fillStyle = '#f5f5f5';
			g.fillRect(0, 0, canvas.width, canvas.height);
			g.fillStyle = '#000';
		};

		// Initial reset
		resetViewport(g);
		
		var clock = function() {
			resetViewport(g);
			
			var date = new Date(),
				hour = date.getHours() % 12 + date.getMinutes() / 60,
				minute = date.getMinutes(),
				second = date.getSeconds(),
				center = new zurv.canvas.Point(canvas.width/2, canvas.height/2);
			
			var hourLine = new zurv.canvas.Line(center, 12, hour, 85, true);
			hourLine.styles({ stroke: 'rgba(0,0,0,.5);', width: 7, cap: 'round' });
			hourLine.draw(g);
			
			var minuteLine = new zurv.canvas.Line(center, 60, minute, 140, true);
			minuteLine.styles({ stroke: 'rgba(0,0,0,.5);', width: 3 });
			minuteLine.draw(g);
			
			var secondLine = new zurv.canvas.Line(center, 60, second,  150, true);
			secondLine.styles({ stroke: 'rgba(0,0,0,.3);', width: 2 });
			secondLine.draw(g);
			
			
			// Text
			g.font = '20px Impact';
			g.fillStyle = 'rgba(0,0,0,.1);';
			var string = 'Uhrzeit',
				metrics = g.measureText(string);
			
			g.fillText(string, canvas.width/2 - metrics.width / 2, 65);
			
			window.setTimeout(clock, 1000);
		};
		
		clock();
	};
})(window);