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

		var cvs = new zurv.canvas.Canvas(g, canvas.width, canvas.height);
		
		var	center = new zurv.canvas.Point(canvas.width/2, canvas.height/2),
			hourLine = new zurv.canvas.Line(center, 12, 0, 85, true),
			minuteLine = new zurv.canvas.Line(center, 60, 0, 140, true),
			secondLine = new zurv.canvas.Line(center, 60, 0,  150, true);
		
		hourLine.styles({ stroke: 'rgba(0,0,0,.5);', width: 7, cap: 'round' });
		minuteLine.styles({ stroke: 'rgba(0,0,0,.5);', width: 3 });
		secondLine.styles({ stroke: 'rgba(255,0,0,.4);', width: 2 });
		
		var circle = new zurv.canvas.Circle(center, 150);
		circle.styles({ stroke: 'rgba(0,0,0,.2);', fill: 'none', width: 3 });
		
		cvs.add(circle, hourLine, minuteLine, secondLine);
		
		var clockThread = new zurv.Thread(function () {
			var date = new Date(),
				hour = date.getHours() % 12 + date.getMinutes() / 60,
				minute = date.getMinutes(),
				second = date.getSeconds();
		
			hourLine.to(hour, true);
			minuteLine.to(minute, true);
			secondLine.to(second, true);
			
			cvs.draw();
		}, null, 1000);
		
		clockThread.run();
	};
})(window);