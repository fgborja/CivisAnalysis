
// var partiesICO = {
// 	'DEM':'http://www.dem.org.br/favicon.ico',
// 	'PCdoB':'http://www.pcdob.org.br/img/logo.bottom.png',
// 	'PDT':'http://www.pdt.org.br/favicon.ico',

// }

var radius = 4;
var pxMargin = 30;

if(!d3.chart) d3.chart = {};

d3.chart.deputiesScatterplot = function() {
	var scatterplot, g;
	var data;
	var dispatch = d3.dispatch("hover","selected");

	var colWidth = $('.col-xs-4').width();

	var margin = {top: pxMargin, right: pxMargin, bottom: pxMargin, left: pxMargin}
	  , width = colWidth - margin.left - margin.right
	  , height = colWidth - margin.top - margin.bottom;

	function chart(container) {
		
		scatterplot = container.append('svg:svg')
			.attr('class', 'chart deputy');

		g = scatterplot.append('g')
			.attr('class', 'main')

		g.append('rect')
			.attr('class', 'selectorRect deputy');

		g.append("g")
		.classed("axis x deputies", true)

		g.append("g")
		.classed("axis y deputies", true)


		selectors('deputy',dispatch.selected);
		
		return dispatch;
		//update();
	}

	chart.update = update;
	function update( selected ) {

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
			.attr('height', height) 

		g.select(".selectorRect.deputy")
			.attr('width', width)
			.attr('height', height)
			.attr('fill', 'white') 
	
		// draw the x axis ------------------------------------------------------------------------------------------
		var xAxis = d3.svg.axis()
		.scale(scaleX)
		.orient('bottom');

		var xg = g.select(".axis.x.deputies")
		.attr('transform', 'translate(0,' + height + ')')
		.transition()
		.call(xAxis);
		// ---------------------------------------------------------------------------------------------------------

		// draw the y axis ------------------------------------------------------------------------------------------
		var yAxis = d3.svg.axis()
		.scale(scaleY)
		.orient('left');

		var yg = g.select(".axis.y.deputies")
		.attr('transform', 'translate(0,0)')
		.transition()
		.call(yAxis);
		// ---------------------------------------------------------------------------------------------------------

		var circles = g.selectAll("circle")
			.data(data, function(d){ return d.phonebookID});

		circles.enter().append("circle");

		circles
		.transition()
		.attr({
			cx: function (d) { return scaleX(d.scatterplot[0]); },
			cy: function (d) { return scaleY(d.scatterplot[1]); },
			r: radius,
			class: function() { if(selected==null) return "node deputy selected" } ,
			id: function(d) { return "deputy-s-" + d.phonebookID; },
			fill: function(d) { return partyColor(d.party) },
			deputy: function(d) { return d.phonebookID}
		})
		circles.exit().transition().remove();

		circles
			.on("mouseover", mouseoverDeputy)
			.on("mousemove", mousemoveDeputy)
			.on("mouseout", mouseoutDeputy);

			
		// mouse OVER circle deputy
		function mouseoverDeputy(d) {
			$("#deputy-s-"+d.phonebookID).attr("r",8)
			$("#deputy-g-"+d.phonebookID).attr("r",8);
	
			d3.selectAll(".node.rollCall")
				//.transition()
				.style("fill", "darkgrey");

			rollCallNodes.forEach( function(rollCallNode,index){ 
					if(rollCallNode.rollCall.votos != undefined){
						rollCallNode.rollCall.votos.Deputado.forEach( function(vote){


							if (vote.phonebookID == d.phonebookID) {
								d3.selectAll("#rollCall-"+index)
									//.transition()
									.style("fill",votoStringToColor[vote.Voto]);
							};
						})
					}
			});

			tooltip.html(d.name +' ('+d.party+')'+"<br /><em>Click to highlight</em>");
			return tooltip.style("visibility", "visible");
		}	

		// mouse MOVE circle deputy
		function mousemoveDeputy() { return tooltip.style("top", (event.pageY - 10)+"px").style("left",(event.pageX + 10)+"px");}

		// mouse OUT circle deputy
		function mouseoutDeputy(d){ 
				$("#deputy-s-"+d.phonebookID).attr("r",4);
				$("#deputy-g-"+d.phonebookID).attr("r",4);
				
				d3.selectAll(".node.rollCall")
					//.transition()
					.style("fill", function(d){votingColor(d.rate)});
				return tooltip.style("visibility", "hidden");
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

	return d3.rebind(chart, dispatch, "on");
}

/// TO CREATE AN ICON in the deputy circle!
// d3.select('.main').append('image')
//                 .attr("xlink:href", "http://www.dem.org.br/favicon.ico")
//                 .attr("x", "100")
//                 .attr("y", "100")
//                 .attr("width", "15")
//                 .attr("height", "15");



