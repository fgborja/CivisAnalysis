if(!d3.chart) d3.chart = {};

d3.chart.rollCallsScatterplot = function() {
	var pxMargin = 10;
	var scatterplot, g;
	var data;
	var dispatch = d3.dispatch("hover","selected");

	var colWidth = $('.canvas').width() * canvasWidthAdjust;

	var margin = {top: pxMargin, right: pxMargin, bottom: pxMargin-10 /*(-10??!)*/, left: pxMargin}
	  , width = colWidth - margin.left - margin.right
	  , height = colWidth - margin.top - margin.bottom;

	function chart(container) {

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

	    selectors('rollCall',chart.dispatchSelected);
	}

	chart.on = dispatch.on;

	chart.update = update;
	function update() {
		
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
			.data(data);

		circles.enter().append("circle");

		circles
		.transition()
		.attr({
			cx: function (d) { return scaleX(d.scatterplot[0]); },
			cy: function (d) { return scaleY(d.scatterplot[1]); },
			r: 4,
			class: "node selected",
			fill: function (d) { return votingColor(d.rate) },
			id: function (d) { return 'rollCall-'+d.i }
		})
		circles.exit().transition().remove();

		circles
			.on("mouseover", mouseOverVoting)
			.on("mousemove", mousemoveVoting)
			.on("mouseout", mouseOutVoting)
			.on("click", mouseClickVoting)

		// mouse OVER circle voting
		function mouseOverVoting(d) {
			d3.select(this).attr("r",8)
	
			dispatch.hover(d);

			tooltip.html(d.tipo+' '+d.numero+'/'+d.ano+"<br/><em>"+d.rollCall.Resumo+"</em>"+ "<br/><em>Click to select</em>");
			return tooltip
					.style("visibility", "visible")
					.style("opacity", 1);
		}	

		// mouse OUT circle voting
		function mouseOutVoting(d){ 
			d3.select(this).attr("r",4)
				
			dispatch.hover(null);
				
			return tooltip.style("visibility", "hidden");
		}

		// mouse MOVE circle voting
		function mousemoveVoting() { return tooltip.style("top", (event.pageY - 10)+"px").style("left",(event.pageX + 10)+"px");}
		
		function mouseClickVoting(d) { 
			if (d3.event.shiftKey){	
				// using the shiftKey deselect the rollCall				
				d3.select(this).classed('selected',false);
				
				//dispatch event of selected rollCalls
				chart.dispatchSelected();

			} else 
			if (d3.event.ctrlKey){
				// using the ctrlKey add rollCalls to selection
				d3.select(this).classed('selected',true);
				
				//dispatch event of selected rollCalls
				chart.dispatchSelected();

			} 
			else {
				// a left click without any key pressed -> select only the state (deselect others)
				g.selectAll('circle').classed('selected',false)
				d3.select(this).classed('selected',true);

				//dispatch event of selected states
				chart.dispatchSelected();
			}
		}		
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

	// change the colors of RollCalls acording to the deputy vote
	chart.highlightDeputyVotes = function( phonebookID, mouseover) {

		if(!mouseover) {
			chart.setDeputyVotingRate();
		} else {
			g.selectAll('.node').attr('fill', function (rollCall){
				var color = 'grey';

				if(rollCall.rollCall.votos != undefined){
					for (var i = 0; i < rollCall.rollCall.votos.Deputado.length; i++) {
						if(rollCall.rollCall.votos.Deputado[i].phonebookID == phonebookID){
							color = votoStringToColor[rollCall.rollCall.votos.Deputado[i].Voto ]
						}
					};
				}
				return  color;
			})
		}
	}

	chart.setDeputyVotingRate = function () {
		var c = g.selectAll('.node').attr('fill', function (rollCall) { 
			return (rollCall.rate == 'noVotes')? 'darkgrey' : votingColor(rollCall.rate);  
		});
	}

	chart.getSelected = function(){
		var selected = [];
		g.selectAll('.node.selected').each( function(d){ selected.push(d) })
		return selected;
	}

	chart.dispatchSelected = function(){
		dispatch.selected( chart.getSelected());
	}

	chart.isSelected = function(rollCallID){
		return g.select('.node#rollCall-'+rollCallID).classed('selected')
	}

	chart.reset = function(){
		g.selectAll('circle').classed('selected',true);
		chart.dispatchSelected()
	}


	return d3.rebind(chart, dispatch, "on");
}