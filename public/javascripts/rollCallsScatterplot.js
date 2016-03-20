if(!d3.chart) d3.chart = {};

d3.chart.rollCallsScatterplot = function() {
	var g;
	var data;
	var dispatch = d3.dispatch('update','cuttingPlane');

	var _dimensions = {},
		_scale = {},
	    margin, width, height;

	function chart(container, dimension) {

		height = dimension.height; 
		width =  dimension.width;
		margin = {top: (radius+5), right: (radius+5), bottom: (radius+5), left: (radius+5)};
		_dimensions.width = 260 - margin.left - margin.right;
	  	_dimensions.height = 230 - margin.top - margin.bottom;

		scatterplot = container.append('svg').attr({
			viewBox:'0 0 260 230',
			width:  width+1,
			height: height+1
		});

		g = scatterplot.append('g')
			.attr({
				'class' 	: 'chart rollCall',
			});

		g.append('g').attr({
			'class':'gchart',
		}).append('rect');

		g.append('rect')
			.attr('class', 'selectorRect')
			.attr('opacity', '0');

	    selectors('rollCall',dispatch.update);
	}

	chart.on = dispatch.on;

	chart.update = function(){
		g.transition().attr({
			width 		: _dimensions.width,
			height 		: _dimensions.height
		})
		
		_scale.x = d3.scale.linear()
			.domain(d3.extent(data, function(d) { return d.scatterplot[1]; }))
			.range([ _dimensions.width-margin.right, margin.left ]);

		_scale.y = d3.scale.linear()
			.domain(d3.extent(data, function(d) { return d.scatterplot[0]; }))
			.range([ margin.top, _dimensions.height-margin.bottom]);

		g.select('.gchart rect').attr({
			width 		: _dimensions.width,
			height 		: _dimensions.height
		});

		g.select(".selectorRect")
			.attr('width', _dimensions.width)
			.attr('height', _dimensions.height)
			.attr('fill', 'white');
	
		// draw the x axis ------------------------------------------------------------------------------------------
		var xAxis = d3.svg.axis()
		.scale(_scale.x)
		.orient('bottom');
		// ---------------------------------------------------------------------------------------------------------

		// draw the y axis ------------------------------------------------------------------------------------------
		var yAxis = d3.svg.axis()
		.scale(_scale.y)
		.orient('left');
		// ---------------------------------------------------------------------------------------------------------
		var circles = g.selectAll("circle")
			.data(data, function(rollCall,i){ return (rollCall===undefined)? 1 : rollCall.rollCallID; });

		circles.enter().append("circle")
							.on("mouseover", mouseOverVoting)
							.on("mouseout", mouseOutVoting)
							.on("click", mouseClickVoting)
							.attr('r',0)
							.attr(popoverAttr(rollCallPopover,'left'))

		circles
			.transition().delay(100).duration(1000)
			.attr({
				cx: function (d) { return _scale.x(d.scatterplot[1]); },
				cy: function (d) { return _scale.y(d.scatterplot[0]); },
				class: function(d) { return (d.selected)? "node selected": ( (d.hovered)? "node hovered" : "node"); } ,
				id: function (d) { return 'rollCall-'+d.rollCallID }
			})
			
		circles
		.attr({r: function(d){ return (d.hovered)? radiusHover : radius }})
		

		$('.chart.rollCall circle.node').popover({ trigger: "hover" });
		function rollCallPopover(d){
			return d.type+' '+d.number+'/'+d.year+"<br/><em>Click to select</em>";
		}

		circles.style('fill', setRollCallFill )

		circles.exit().transition().duration(1000).attr('r',0).remove();				
	}

	chart.showDeputyCuttingPlane = function(deputy){
		if(!deputy){
			g.selectAll('.arrow').remove();
			g.selectAll('.cutting').remove();
			g.selectAll('text').remove();
			return;
		}

		var depCoord = deputy.coord; 

		var arrow1 = [depCoord[0]*_dimensions.width,depCoord[1]*_dimensions.height]
		var arrow2 = [ (1-depCoord[0])*_dimensions.width, (1-depCoord[1])*_dimensions.height ]

		var relat = [ depCoord[0]-0.5, depCoord[1]-0.5];
		var a = Math.atan2(relat[1],relat[0]);

		var cutting = [
				[[
				 _dimensions.width/2 - (_dimensions.width/2)*Math.sin(a),
				 _dimensions.height/2 + (_dimensions.height/2)*Math.cos(a)],
				[
				 _dimensions.width/2 + (_dimensions.width/2)*Math.sin(a),
				 _dimensions.height/2 - (_dimensions.height/2)*Math.cos(a)
				]
				]
			];

		var cuttingPlane = g.selectAll('.cutting')
						.data(cutting)

		cuttingPlane.enter()
			.append('path')
			.attr('class','cutting')
			.attr({
				d: function (d){ return 'M '+d[0][0]+' '+d[0][1]+' L'+d[1][0]+' '+d[1][1]; },
				stroke: 'darkgrey',
				'stroke-width':"1px",
				'stroke-dasharray':'5,5,5'
			});

		var arrow= [
				[[_dimensions.width/2,_dimensions.height/2],  [arrow1[0],arrow1[1]] ],
				[ [arrow1[0]-7*Math.sin(a+Math.PI/4),arrow1[1]-7*Math.cos(a-3*Math.PI/4)],  [arrow1[0],arrow1[1]] ],
				[ [arrow1[0]-7*Math.cos(a+Math.PI/4),arrow1[1]+7*Math.sin(a-3*Math.PI/4)],  [arrow1[0],arrow1[1]] ],
				[[_dimensions.width/2,_dimensions.height/2],[arrow2[0],arrow2[1]]],
				[ [arrow2[0]+7*Math.sin(a+Math.PI/4),arrow2[1]+7*Math.cos(a-3*Math.PI/4)],  [arrow2[0],arrow2[1]] ],
				[ [arrow2[0]+7*Math.cos(a+Math.PI/4),arrow2[1]-7*Math.sin(a-3*Math.PI/4)],  [arrow2[0],arrow2[1]] ],
			]
		var coord = g.selectAll('.arrow')
						.data(arrow)

		coord.enter().append('path').attr('class','arrow');

		coord.attr({
			d: function (d){ return 'M '+d[0][0]+' '+d[0][1]+' L'+d[1][0]+' '+d[1][1]; },
			stroke: function(d,i) { return (i<3)?'darkgreen':'darkred';},
			'stroke-width':"2px",
		})
	}

	function setRollCallFill (d){
		if(d.vote != null){
			return CONGRESS_DEFINE.votoStringToColor[d.vote];
		}
		if(d.rate != null){
			if (d.rate == "noVotes")
				return 'grey' 
			else return CONGRESS_DEFINE.votingColor(d.rate)
		} else{ 
			return 'grey';
		} 
	}

	// mouse OVER circle voting
	function mouseOverVoting(d) {
		d.hovered = true;
		dispatch.update();
	}	

	// mouse OUT circle voting
	function mouseOutVoting(d){ 
		d.hovered = false;
		dispatch.update();
	}

	function mouseClickVoting(d) { 
		d3.event.preventDefault();
		
		if (d3.event.shiftKey){	
			// using the shiftKey deselect the rollCall				
			d.selected = false;
		} else 
		if (d3.event.ctrlKey || d3.event.metaKey){
			// using the ctrlKey add rollCalls to selection
			d.selected = true;
		} 
		else {
			// a left click without any key pressed -> select only the state (deselect others)
			data.forEach( function (rollCall) {
				rollCall.selected = false;
			})
			d.selected = true;
		}
		
		//dispatch event of selected rollCalls
		dispatch.update()
	}

	chart.data = function(value) {
		if(!arguments.length) return data;
		data = value;
		return chart;
	}
	chart.width = function(value) {
		if(!arguments.length) return width;
		width = value;
		return chart;
	}
	chart.height = function(value) {
		if(!arguments.length) return height;
		height = value;
		return chart;
	}

	chart.scale = function() {
		return _scale;
	}
	chart.dim = function() {
		return _dimensions;
	}

	return d3.rebind(chart, dispatch, "on");
}