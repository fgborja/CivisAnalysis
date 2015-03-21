if(!d3.chart) d3.chart = {};

d3.chart.rollCallsScatterplot = function() {
	var g;
	var data;
	var dispatch = d3.dispatch('update');

	var _dimensions = {};
	var margin;
	var width,height;
	function chart(container, dimension) {

		height = dimension.height; 
		width =  dimension.width;
		margin = {top: (radius+5), right: (radius+5), bottom: (radius+5), left: (radius+5)};
		_dimensions.width = width - margin.left - margin.right;
	  	_dimensions.height = height - margin.top - margin.bottom;

		scatterplot = container.append('svg').attr({
			viewBox:'0 0 260 230',
			width:_dimensions.width+1,
			height:_dimensions.height+1
		});

		g = scatterplot.append('g')
			.attr({
				'class' 	: 'chart rollCall',
			});

		g.append('rect').attr({
			'class':'gchart',
		});

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
		
		var scaleX = d3.scale.linear()
			.domain(d3.extent(data, function(d) { return d.scatterplot[1]; }))
			.range([ _dimensions.width-margin.right, margin.left ]);

		var scaleY = d3.scale.linear()
			.domain(d3.extent(data, function(d) { return d.scatterplot[0]; }))
			.range([ margin.top, _dimensions.height-margin.bottom]);

		g.select('.gchart').attr({
			width 		: _dimensions.width,
			height 		: _dimensions.height
		});

		g.select(".selectorRect")
			.attr('width', _dimensions.width)
			.attr('height', _dimensions.height)
			.attr('fill', 'white');
	
		// draw the x axis ------------------------------------------------------------------------------------------
		var xAxis = d3.svg.axis()
		.scale(scaleX)
		.orient('bottom');
		// ---------------------------------------------------------------------------------------------------------

		// draw the y axis ------------------------------------------------------------------------------------------
		var yAxis = d3.svg.axis()
		.scale(scaleY)
		.orient('left');
		// ---------------------------------------------------------------------------------------------------------
		var circles = g.selectAll("circle")
			.data(data, function(rollCall,i){ return (rollCall===undefined)? 1 : rollCall.rollCallID; });

		circles.enter().append("circle")
							.on("mouseover", mouseOverVoting)
							.on("mouseout", mouseOutVoting)
							.on("click", mouseClickVoting)
							.attr('r',0)
							.attr(popoverAttr(rollCallPopover))

		circles
			.transition().delay(100).duration(1000)
			.attr({
				cx: function (d) { return scaleX(d.scatterplot[1]); },
				cy: function (d) { return scaleY(d.scatterplot[0]); },
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

	return d3.rebind(chart, dispatch, "on");
}