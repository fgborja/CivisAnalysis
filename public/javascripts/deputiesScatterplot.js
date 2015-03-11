
// var partiesICO = {
// 	'DEM':'http://www.dem.org.br/favicon.ico',
// 	'PCdoB':'http://www.pcdob.org.br/img/logo.bottom.png',
// 	'PDT':'http://www.pdt.org.br/favicon.ico',

// }

if(!d3.chart) d3.chart = {};

d3.chart.deputiesScatterplot = function() {
	var g;
	var data;
	var dispatch = d3.dispatch("update");

	var _dimensions ={};
	var margin;

	function chart(containerSVG, dimensions) {
		
		_dimensions = dimensions;
		margin = {top: _dimensions.radius+5, right: _dimensions.radius+5, bottom: _dimensions.radius+5, left: _dimensions.radius+5};
		_dimensions.width = _dimensions.width - margin.left - margin.right;
	  	_dimensions.height = _dimensions.height - margin.top - margin.bottom;


		g = containerSVG.append('g')
			.attr({
				'class' 	: 'chart deputy',
			});

		g.append('rect').attr({
			'class':'gchart',
		});

		g.append('rect')
			.attr('class', 'selectorRect')
			.attr('opacity', '0');

		g.append("g")
		.classed("axis x", true)

		g.append("g")
		.classed("axis y", true)



		selectors('deputy', dispatch.update );
		
		//update();
	}

	chart.on = dispatch.on;

	chart.update = update;
	function update() {
		g.transition().attr({
			transform 	:'translate('+ (_dimensions.x+margin.left) +','+ (_dimensions.y+margin.top) +')',
			width 		: _dimensions.width,
			height 		: _dimensions.height
		})

		var scaleX = d3.scale.linear()
			.domain(d3.extent(data, function(d) { return d.scatterplot[0]; }))
			.range([ margin.left, _dimensions.width-margin.right ]);

		var scaleY = d3.scale.linear()
			.domain(d3.extent(data, function(d) { return d.scatterplot[1]; }))
			.range([ _dimensions.height-margin.bottom, margin.top ]);

		g.select('.gchart').attr({
			width 		: _dimensions.width,
			height 		: _dimensions.height
		});

		g.select(".selectorRect")
			.attr('width', _dimensions.width)
			.attr('height', _dimensions.height)
			.style('fill', 'white') 
	
		// draw the x axis ------------------------------------------------------------------------------------------
		var xAxis = d3.svg.axis()
		.scale(scaleX)
		.orient('bottom');

		var xg = g.select(".axis.x")
		.attr('transform', 'translate(0,' + _dimensions.height + ')')
		.transition()
		.call(xAxis);
		// ---------------------------------------------------------------------------------------------------------

		// draw the y axis ------------------------------------------------------------------------------------------
		var yAxis = d3.svg.axis()
		.scale(scaleY)
		.orient('left');

		var yg = g.select(".axis.y")
		.attr('transform', 'translate(0,0)')
		.transition()
		.call(yAxis);
		// ---------------------------------------------------------------------------------------------------------
		
		var circles = g.selectAll("circle")
			.data(data, function(d,i){ if(d===undefined) return 1; else return d.deputyID});

		circles.enter().append("circle")
			.on("mouseover", mouseoverDeputy)
			.on("mousemove", mousemoveDeputy)
			.on("mouseout", mouseoutDeputy)
			.on("click", mouseClickDeputy)
			.attr('r',0)

		circles
		.transition().delay(100).duration(1000)
		.attr({
			cx: function (d) { return scaleX(d.scatterplot[0]); },
			cy: function (d) { return scaleY(d.scatterplot[1]); },
			class: function(d) { return (d.selected)? "node selected": ( (d.hovered)? "node hovered" : "node"); } ,
			id: function(d) { return "deputy-" + d.deputyID; },
			deputy: function(d) { return d.deputyID}
		})
		
		circles.attr({
			r: function(d){ return (d.hovered)? _dimensions.radius*2 : _dimensions.radius },
		})
		
		circles.style('fill',setDeputyFill )

		
		circles.exit().transition().duration(1000).attr('r',0).remove();

		g.selectAll("circle").sort( function (x,y) {
			if(x !== undefined)
				return (x.hovered);
				else false;
		})

	}

	chart.data = function(value) {
		if(!arguments.length) return data;
		data = value;

		return chart;
	}

	chart.dimensions = function(value) {
		if(!arguments.length) return _dimensions;
		_dimensions = value;
		return chart;
	}

		chart.width = function(value) {
			if(!arguments.length) return _dimensions.width;
			_dimensions.width = value;
			return chart;
		}
		chart.height = function(value) {
			if(!arguments.length) return _dimensions.height;
			_dimensions.height = value;
			return chart;
		}
		chart.x = function(value) {
			if(!arguments.length) return _dimensions.x;
			_dimensions.x = value;
			return chart;
		}
		chart.y = function(value) {
			if(!arguments.length) return _dimensions.y;
			_dimensions.y = value;
			return chart;
		}
		chart.radius = function(value) {
			if(!arguments.length) return _dimensions.radius;
			_dimensions.radius = value;
			return chart;
		}

	function setDeputyFill( d ){ 
		if(d.vote != null){
			return CONGRESS_DEFINE.votoStringToColor[d.vote];
		}
		if(d.rate != null){
			if (d.rate == "noVotes")
				return 'grey' 
			else return CONGRESS_DEFINE.votingColor(d.rate)
		} else{ 
			return CONGRESS_DEFINE.getPartyColor(d.party)
		} 
	}

	// mouse OVER circle deputy
	function mouseoverDeputy(d) {
		d.hovered = true;
		dispatch.update();

		tooltip.html(d.name +' ('+d.party+'-'+d.district+")<br /><em>Click to select</em>");			
		return tooltip
				.style("visibility", "visible")
				.style("opacity", 1)
	}	

	// mouse MOVE circle deputy
	function mousemoveDeputy() { return tooltip.style("top", (event.pageY - 10)+"px").style("left",(event.pageX + 10)+"px");}

	// mouse OUT circle deputy
	function mouseoutDeputy(d){ 
		d.hovered = false;
		dispatch.update()
		return tooltip.style('visibility','hidden')
	}

	function mouseClickDeputy(d){
		if (d3.event.shiftKey){	
			// using the shiftKey deselect the deputy				
			d.selected = false;
		} else 
		if (d3.event.ctrlKey){
			// using the ctrlKey add deputy to selection
			d.selected = true;
		} 
		else {
			// a left click without any key pressed -> select only the deputy (deselect others)
			data.forEach(function (deputy) { deputy.selected = false; })
			d.selected = true;				
		}	
		dispatch.update()	
	}				

	return d3.rebind(chart, dispatch, "on");
}

/// TO CREATE AN ICON in the deputy circle!
// d3.select('.main').append('image')
//                 .attr("xlink:href", "http://www.dem.org.br/favicon.ico")
//                 .attr("x", "100")
//                 .attr("y", "100")
//                 .attr("width", "15")
//                 .attr("height", "15");



