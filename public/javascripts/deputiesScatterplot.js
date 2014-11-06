
// var partiesICO = {
// 	'DEM':'http://www.dem.org.br/favicon.ico',
// 	'PCdoB':'http://www.pcdob.org.br/img/logo.bottom.png',
// 	'PDT':'http://www.pdt.org.br/favicon.ico',

// }

var radius = 3.7;
var radiusHover = radius*2;
var pxMargin = radius+5;

if(!d3.chart) d3.chart = {};

d3.chart.deputiesScatterplot = function() {
	var g;
	var data;
	var dispatch = d3.dispatch("update");

	var _dimensions ={};
	var colWidth = $('.canvas').width();

	var margin = {top: pxMargin, right: pxMargin, bottom: pxMargin, left: pxMargin};

	function chart(containerSVG, dimensions) {
		
		dimensions.width = dimensions.width - margin.left - margin.right;
	  	dimensions.height = dimensions.height - margin.top - margin.bottom;

		_dimensions = dimensions;

		g = containerSVG.append('g')
			.attr({
				'class' 	: 'chart deputy',
				transform 	:'translate('+ (dimensions.x+margin.left) +','+ (dimensions.y+margin.top) +')',
				width 		: dimensions.width,
				height 		: dimensions.height
			});

		g.append('rect').attr({
			'class':'gchart',
			width 		: dimensions.width,
			height 		: dimensions.height
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

		var scaleX = d3.scale.linear()
			.domain(d3.extent(data, function(d) { return d.scatterplot[0]; }))
			.range([ margin.left, _dimensions.width-margin.right ]);

		var scaleY = d3.scale.linear()
			.domain(d3.extent(data, function(d) { return d.scatterplot[1]; }))
			.range([ _dimensions.height-margin.bottom, margin.top ]);

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

		circles
		.transition()
		.attr({
			cx: function (d) { return scaleX(d.scatterplot[0]); },
			cy: function (d) { return scaleY(d.scatterplot[1]); },
			r: function(d){ return (d.hovered)? radiusHover : radius },
			class: function(d) { return (d.selected)? "node selected": ( (d.hovered)? "node hovered" : "node"); } ,
			id: function(d) { return "deputy-" + d.deputyID; },
			deputy: function(d) { return d.deputyID}
		})
		.style('fill',setDeputyFill )

		
		circles.exit().transition().remove();
			
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

	// @param selectParties : Array	

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

	return d3.rebind(chart, dispatch, "on");
}

/// TO CREATE AN ICON in the deputy circle!
// d3.select('.main').append('image')
//                 .attr("xlink:href", "http://www.dem.org.br/favicon.ico")
//                 .attr("x", "100")
//                 .attr("y", "100")
//                 .attr("width", "15")
//                 .attr("height", "15");



