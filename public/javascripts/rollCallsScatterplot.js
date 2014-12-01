if(!d3.chart) d3.chart = {};

d3.chart.rollCallsScatterplot = function() {
	var pxMargin = 10;
	var scatterplot, g;
	var data;
	var dispatch = d3.dispatch('update');

	var margin, width,height;

	function chart(container) {
		margin = {top: pxMargin, right: pxMargin, bottom: pxMargin, left: pxMargin}
	  	, width = width - margin.left - margin.right
	  	, height = width - margin.top - margin.bottom;

		scatterplot = container.append('svg:svg')
			.attr('class', 'chart  rollCall')


		g = scatterplot.append('g')
			.attr('class', 'main');

		g.append('rect')
			.attr('class', 'selectorRect')

		g.append("g")
	    .classed("axis x", true)

	    g.append("g")
	    .classed("axis y", true)

	    selectors('rollCall',dispatch.update);
	}

	chart.on = dispatch.on;

	chart.update = function(){
		
		var scaleX = d3.scale.linear()
			.domain(d3.extent(data, function(d) { return d.scatterplot[0]; }))
			.range([ 0, width ]);

		var scaleY = d3.scale.linear()
			.domain(d3.extent(data, function(d) { return d.scatterplot[1]; }))
			.range([ height, 0 ]);

		scatterplot
			.attr('width', width + margin.right + margin.left)
			.attr('height', height + margin.top + margin.bottom)
			
		g
			.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
			.attr('width', width)
			.attr('height', height);

		g.select(".selectorRect")
			.attr('width', width)
			.attr('height', height)
			.attr('fill', 'white');
	
		// draw the x axis ------------------------------------------------------------------------------------------
		var xAxis = d3.svg.axis()
		.scale(scaleX)
		.orient('bottom');

		var xg = g.select(".axis.x")
		.attr('transform', 'translate(0,' + height + ')')
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
			.data(data, function(rollCall){ return rollCall.rollCallID; });

		circles.enter().append("circle")
							.on("mouseover", mouseOverVoting)
							.on("mousemove", mousemoveVoting)
							.on("mouseout", mouseOutVoting)
							.on("click", mouseClickVoting)

		circles
			.transition()
			.attr({
				cx: function (d) { return scaleX(d.scatterplot[0]); },
				cy: function (d) { return scaleY(d.scatterplot[1]); },
				r: function(d){ return (d.hovered)? radiusHover : radius },
				class: function(d) { return (d.selected)? "node selected": ( (d.hovered)? "node hovered" : "node"); } ,
				id: function (d) { return 'rollCall-'+d.rollCallID }
			})
			.style('fill', setRollCallFill )

		circles.exit().transition().remove();				
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

		tooltip.html(d.type+' '+d.number+'/'+d.year+"<br/>Amendment: "+motions[d.type+d.number+d.year].amendment +'<br/></em>'+ d.summary+"</em>"+ "<br/><em>Click to select</em>");
		return tooltip
				.style("visibility", "visible")
				.style("opacity", 1);
	}	

	// mouse OUT circle voting
	function mouseOutVoting(d){ 
		d.hovered = false;
			
		dispatch.update();
			
		return tooltip.style("visibility", "hidden");
	}

	// mouse MOVE circle voting
	function mousemoveVoting() { return tooltip.style("top", (event.pageY - 10)+"px").style("left",(event.pageX + 10)+"px");}
	
	function mouseClickVoting(d) { 
		if (d3.event.shiftKey){	
			// using the shiftKey deselect the rollCall				
			d.selected = false;
		} else 
		if (d3.event.ctrlKey){
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

	return d3.rebind(chart, dispatch, "on");
}