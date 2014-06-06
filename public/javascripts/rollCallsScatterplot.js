if(!d3.chart) d3.chart = {};

d3.chart.rollCallsScatterplot = function() {
	var pxMargin = 20;
	var scatterplot, g;
	var data;
	var dispatch = d3.dispatch("hover","selected");

	var colWidth = $('.col-xs-4').width();

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

	    selectors('rollCall',dispatch.selected);
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
			id: function(d,i) { return "rollCall-" + i; },
			fill: function (d) { return votingColor(d.rate) },
			rollCall: function (d,i) { return i }
		})
		circles.exit().transition().remove();

		circles
			.on("mouseover", mouseOverVoting)
			.on("mousemove", mousemoveVoting)
			.on("mouseout", mouseOutVoting)

		// mouse OVER circle voting
		function mouseOverVoting(d,i) {
			$("#rollCall-"+i).attr("r",8)
	
			dispatch.hover(d,true);

			tooltip.html(d.tipo+' '+d.numero+'/'+d.ano+"<br/><em>"+d.rollCall.Resumo+"</em>"+ "<br/><em>Click to highlight</em>");
			return tooltip.style("visibility", "visible");
		}	

		// mouse OUT circle voting
		function mouseOutVoting(d,i){ 
				//if(selected != i || i==0){
				$("#rollCall-"+i).attr("r",4)
				//}	

				dispatch.hover(d,false);
				/*
				d3.selectAll(".node.deputy").style("fill", function(d) { 
					if(d.record !== undefined) d = d.record;

					return partyColor(d.party) 
				});*/
				
			return tooltip.style("visibility", "hidden");
		}

		// mouse MOVE circle voting
		function mousemoveVoting() { return tooltip.style("top", (event.pageY - 10)+"px").style("left",(event.pageX + 10)+"px");}
		
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

	chart.getSelectedRollCallsIDs = function(){
		var selectedNodes = g.selectAll('.node.selected');
		return selectedNodes[0].map(function(d){ return d3.select(d).attr('rollCall') })
	}


	return d3.rebind(chart, dispatch, "on");
}