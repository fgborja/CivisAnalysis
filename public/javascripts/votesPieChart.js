if(!d3.chart) d3.chart = {};

d3.chart.votesPieChart = function(configOptions) {
	var options = configOptions;

	var svg;
	var _dimensions ={};
	var dispatch = d3.dispatch("update");

	var radius;

	var rollCall;
	var deputies;
	var numSelectedDeputies = 0;

	var pie = d3.layout.pie()
		.sort(null)
		.value(function (d) { return d.value; });

	function chart(svgContainer, dimensions) {

		_dimensions = dimensions;
		radius = Math.min(dimensions.width, dimensions.height) / 2;

		svg = svgContainer.append("g")
			.attr("transform", "translate(" + dimensions.x + "," + dimensions.y + ")");
	}

	chart.on = dispatch.on;

	chart.rollCall = function(value) {
		if(!arguments.length) return rollCall;
		rollCall = value;
		return chart;
	};

	chart.deputies = function(value) {
			if(!arguments.length) return deputies;
			deputies = value;
			return chart;
	};

	chart.visible = function (visible){
		svg.attr('visibility', (visible)? 'visible':'hidden');
	};

	chart.update = function() {

		var piedata = pie(getRollCallData(rollCall));

		var arc = d3.svg.arc()
			.innerRadius(0)
			.outerRadius(radius);

		var path = svg.selectAll("path")
			.data(piedata, function(d){return d.data.key})
		  
		path.enter().append("path")
			.attr({
				fill: function(d) { return CONGRESS_DEFINE.votoStringToColor[d.data.key]; },
				cursor : 'pointer'
			})
			.on( interactions );

		svg.selectAll("path")
			.attr('d',arc);

		path.exit().remove();

		if(options.labels){

			// svg.selectAll("text").data(piedata, function(d){return d.data.key})
			// 	.enter()
			// 	.append("text")
			// 	.attr("text-anchor", "middle")
			// 	.attr("x", function(d) {
			// 		var a = d.startAngle + (d.endAngle - d.startAngle)/2 - Math.PI/2;
			// 		d.cx = Math.cos(a) * (radius - 75);
			// 		return d.x = Math.cos(a) * (radius - 20);
			// 	})
			// 	.attr("y", function(d) {
			// 		var a = d.startAngle + (d.endAngle - d.startAngle)/2 - Math.PI/2;
			// 		d.cy = Math.sin(a) * (radius - 75);
			// 		return d.y = Math.sin(a) * (radius - 20);
			// 	})
			// 	.text(function(d) { return d.value; })
			// 	.each(function(d) {
			// 		var bbox = this.getBBox();
			// 		d.sx = d.x - bbox.width/2 - 2;
			// 		d.ox = d.x + bbox.width/2 + 2;
			// 		d.sy = d.oy = d.y + 5;
			// 	});
		
			// svg.append("defs").append("marker")
			// 	.attr("id", "circ")
			// 	.attr("markerWidth", 6)
			// 	.attr("markerHeight", 6)
			// 	.attr("refX", 3)
			// 	.attr("refY", 3)
			// 	.append("circle")
			// 	.attr("cx", 3)
			// 	.attr("cy", 3)
			// 	.attr("r", 3);

			// svg.selectAll("path.pointer").data(piedata, function(d){return d.data.key}).enter()
			// 	.append("path")
			// 	.attr("class", "pointer")
			// 	.style("fill", "none")
			// 	.style("stroke", "black")
			// 	.attr("marker-end", "url(#circ)")
			// 	.attr("d", function(d) {
			// 		if(d.cx > d.ox) {
			// 			return "M" + d.sx + "," + d.sy + "L" + d.ox + "," + d.oy + " " + d.cx + "," + d.cy;
			// 		} else {
			// 			return "M" + d.ox + "," + d.oy + "L" + d.sx + "," + d.sy + " " + d.cx + "," + d.cy;
			// 		}
			// 	});
		} else {
			var texts = svg.selectAll("text").data(piedata, function(d){return d.data.key});
				
			texts.enter()
				.append("text")
				.attr({
					"text-anchor":"middle",
					cursor : 'pointer',
				})
				.on( interactions );

			texts.transition()
				.attr('transform',function(d) { return "translate(" + arc.centroid(d) + ")"; })
				.text(function(d) { return ( (d.data.value/numSelectedDeputies) > 0.20  )? d.data.key : ''; })

			texts.exit().remove();
		}
	}

	function getRollCallData(rollCall){
		// get IDs of selected deputies
		var selectedDeputies = {};
		deputies.forEach(function (deputy) {
			if(deputy.selected)
				selectedDeputies[deputy.deputyID]=true;
		})

		var votes = {},
			voteCount = 0;

		// count each Yes/No/... vote recieved - count only the votes of selected deputies
		rollCall.votes.forEach( function(deputyVote){
			if(selectedDeputies[deputyVote.deputyID]){
				if(votes[deputyVote.vote] === undefined) votes[deputyVote.vote] = 0;
				voteCount++;
				votes[deputyVote.vote]++;
			}
		})

		numSelectedDeputies = Object.size(selectedDeputies);
		// without registered vote
		votes['null'] = numSelectedDeputies - voteCount ;
		
		delete votes['Art. 17'];

		return d3.entries(votes);
	}

	var interactions = {
			mouseover: function (d) {
				deputies.map(function(deputy){
					deputy.hovered = ( (deputy.selected) && (deputy.vote == d.data.key))?true:false;
				})
				dispatch.update();
			}
			,
			mouseout: function (d) {
				deputies.map(function(deputy){
					deputy.hovered = false;
				})

				dispatch.update();
			},
			mousemove: function (d) {

			},
			click: function (d) {
				deputies.map(function(deputy){
					deputy.selected = ( (deputy.selected) && (deputy.vote == d.data.key))?true:false;
				})

				dispatch.update();
			}			
		}
	return d3.rebind(chart, dispatch, "on");
}