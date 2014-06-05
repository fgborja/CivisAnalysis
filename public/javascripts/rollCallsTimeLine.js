
// if(!d3.chart) d3.chart = {};

// d3.chart.rollCallsTimeLine = function() {
// 	var timeline, g;s
// 	var data;
// 	var width = 1000;
// 	var height = 50;
// 	var dispatch = d3.dispatch(chart, "filter");

// 	function chart(container) {
// 		timeline = container.append('svg:svg');
// 	g = timeline.append('g')
// 	g.attr("transform", "translate(" + [70, 0] + ")")
		
// 	}
// 	chart.update = update;
// 	function update() {
// 		var extent = d3.extent(data, function(d) {
// 			return d.datetime
// 		})wew

// 		var scale = d3.time.scale()
// 			.domain(extent)
// 			.range([0, width])

// 		var brush = d3.svg.brush()
// 		brush.x(scale)
// 		brush(g)
// 		g.selectAll("rect").attr("height", height)
// 		g.selectAll(".background")
// 			.style({fill: "#4B9E9E", visibility: "visible"})
// 		g.selectAll(".extent")
// 			.style({fill: "#78C5C5", visibility: "visible"})
// 		g.selectAll(".resize rect")
// 			.style({fill: "#276C86", visibility: "visible"})

// 		var rects = g.selectAll("rect.events")
// 		.data(data)
// 		rects.enter()
// 		.append("rect").classed("events", true)
// 		rects.attr({
// 			x: function(d) { return scale(d.datetime);},
// 			y: 0,
// 			width: 1,
// 			height: height
// 		}).style("pointer-events", "none")

// 		rects.exit().remove()

// 		brush.on("brushend", function() {
// 			var ext = brush.extent()
// 			var filtered = data.filter(function(d) {
// 				return (d.datetime > ext[0] && d.datetime < ext[1])
// 			})
// 			g.selectAll("rect.events")
// 			.style("stroke", "")
			
// 			// g.selectAll("rect.events")
// 			// .data(filtered, function(d) { return d.data.id })
// 			// .style({
// 			//   stroke: "#fff"
// 			// })

// 			//emit filtered data
// 			dispatch.filter(filtered)
// 		})

// 		var axis = d3.svg.axis()
// 		.scale(scale)
// 		.orient("bottom")
// 		.tickValues([new Date(extent[0]), new Date(extent[0] + (extent[1] - extent[0])/2) , new Date(extent[1])])
// 		.tickFormat(d3.time.format("%x %H:%M"))

// 		var agroup = g.append("g")
// 		agroup.attr("transform", "translate(" + [0, height] + ")")
// 		axis(agroup)
// 		agroup.selectAll("path")
// 			.style({ fill: "none", stroke: "#000"})
// 		agroup.selectAll("line")
// 			.style({ stroke: "#000"})
// 	}

// 	// chart.highlight = function(data) {
// 	//   var rects = g.selectAll("rect.events")
// 	//   .style("stroke", "")
// 	//   .style("stroke-width", "")

// 	//   rects.data(data, function(d) { return d.data.id })
// 	//   .style("stroke", "orange")
// 	//   .style("stroke-width", 3)
// 	// }

// 	chart.data = function(value) {
// 		if(!arguments.length) return data;
// 		data = value;
// 		return chart;
// 	}
// 	chart.width = function(value) {
// 		if(!arguments.length) return width;
// 		width = value;
// 		return chart;
// 	}
// 	chart.height = function(value) {
// 		if(!arguments.length) return height;
// 		height = value;
// 		return chart;
// 	}

// 	return d3.rebind(chart, dispatch, "on");
// }


//===============================================================================================================
//===============================================================================================================
//===============================================================================================================
// TODO create an g element for the ranges+timeline 

if(!d3.chart) d3.chart = {};

d3.chart.timelineBarChart = function() {

	var data,
		svg,
		g,
		colWidth = $('.col-xs-12').width(),
		margin = {top: 30, right: 30, bottom: 30, left: 30},
		width = colWidth - margin.left - margin.right,
		height = 50,
		svgHeight = 80,
		x,
		y = d3.scale.linear().range([height, 0]),
		id = 0, //barChart.id++,
		gX,axis = d3.svg.axis().orient("bottom"),
		brush = d3.svg.brush(),
		brushDirty,
		dimension,
		group,
		round;
	var dispatch = d3.dispatch(chart, "timelineFilter");

	function chart(div) {

		g = div.select("g");

		// Create the skeletal chart.
		if (g.empty()) {
			// div.select(".title").append("a")
			// 	.attr("href", "javascript:reset(" + id + ")")
			// 	.attr("class", "reset")
			// 	.text("reset")
			// 	.style("display", "none");

			svg = div.append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", svgHeight + margin.top + margin.bottom)
				
			g =	svg.append("g")
					.attr("transform", "translate(" + margin.left + ",0)");

			g.append("clipPath")
				.attr("id", "clip-timeline")
				.append("rect")
					.attr("width", width)
					.attr("height", height);

			gX = g.append("g")
				.attr("class", "axis")
				.attr("transform", "translate(0," + height + ")")
				.call(axis);

		}

		
	}

	chart.update = update;
	function update() {
			if(!group){
			var datetimeList =[];
			data.forEach( function(d){ datetimeList.push( d.datetime )});
			var dateCF = crossfilter(datetimeList);
			dimension = dateCF.dimension( function(d){ return d });
			group = dimension.group(d3.time.day);
			round = d3.time.day.round;
			
			chart.x(d3.time.scale()
				.domain([new Date(1991, 0, 1), new Date(2015, 0, 1)])
				.rangeRound([margin.left, width -margin.right]))
				.timelineFilter([new Date(2012, 0, 1), new Date()]);

			y.domain([0, group.top(1)[0].value]);

			g.selectAll(".bar")
				.data(["background", "foreground"])
					.enter().append("path")
					.attr("class", function(d) { return d + " bar"; })
					.datum(group.all());

			g.selectAll(".bar").attr("d", barPath);

			gX.transition()
				.call(axis);

			g.selectAll(".foreground.bar")
					.attr("clip-path", "url(#clip-timeline)");	

			// Initialize the brush component with pretty resize handles.
			gBrush = g.append("g").attr("class", "brush").call(brush);
			gBrush.selectAll("rect").attr("height", height);
			gBrush.selectAll(".resize").append("path").attr("d", resizePath);

			// Only redraw the brush if set externally.
			if (brushDirty) {
			  brushDirty = false;
			  g.selectAll(".brush").call(brush);
			  //div.select(".title a").style("display", brush.empty() ? "none" : null);
			  if (brush.empty()) {
				g.selectAll("#clip-timeline rect")
					.attr("x", 0)
					.attr("width", width);
			  } else {
				var extent = brush.extent();
				g.selectAll("#clip-timeline rect")
					.attr("x", x(extent[0]))
					.attr("width", x(extent[1]) - x(extent[0]));
			  }
			}

			// TODO contantes chusmes! wtf ive done here?  height,width(?!!)
			appendGreyRangeButtons(years,height+2, 10)
			appendGreyRangeButtons(legislatures,height+17, 70 );
			appendGreyRangeButtons(presidents,height+32 , 60);

			appendClipedRangeButtons(years,height+2, 10)
			appendClipedRangeButtons(legislatures, height+17, 70 );
			appendClipedRangeButtons(presidents, height+32 , 60);

			appendElections(height+47);
		}
	}

	function barPath(groups) {
		var path = [],
			i = -1,
			n = groups.length,
			d;
		while (++i < n) {
			d = groups[i];
			path.push("M", x(d.key), ",", height, "V", y(d.value), "h9V", height);
		}
		return path.join("");
	}

	function resizePath(d) {
		var e = +(d == "e"),
			x = e ? 1 : -1,
			y = height / 3;
		return "M" + (.5 * x) + "," + y
			+ "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6)
			+ "V" + (2 * y - 6)
			+ "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y)
			+ "Z"
			+ "M" + (2.5 * x) + "," + (y + 8)
			+ "V" + (2 * y - 8)
			+ "M" + (4.5 * x) + "," + (y + 8)
			+ "V" + (2 * y - 8);
	}

	brush.on("brushstart.chart", function() {
	  var div = d3.select(this.parentNode.parentNode.parentNode);
	  div.select(".title a").style("display", null);
	});

	brush.on("brush.chart", function() {
	  var g = d3.select(this.parentNode),
		  extent = brush.extent();
	  if (round) g.select(".brush")
		  .call(brush.extent(extent = extent.map(round)))
		.selectAll(".resize")
		  .style("display", null);
	  g.select("#clip-timeline rect")
		  .attr("x", x(extent[0]))
		  .attr("width", x(extent[1]) - x(extent[0]));
	  //dimension.filterRange(extent);
	  //console.log(extent)
	});

	brush.on("brushend.chart", function() {
	  if (brush.empty()) {
		var div = d3.select(this.parentNode.parentNode.parentNode);
		div.select(".title a").style("display", "none");
		div.select("#clip-timeline rect").attr("x", null).attr("width", "100%");
		//dimension.filterAll();
	  }
	  //!!!!!!!!!!
	  dispatch.timelineFilter(brush.extent())
	  //console.log()
	});

	chart.margin = function(_) {
	  if (!arguments.length) return margin;
	  margin = _;
	  return chart;
	};

	chart.x = function(_) {
	  if (!arguments.length) return x;
	  x = _;
	  axis.scale(x);
	  brush.x(x);
	  return chart;
	};

	chart.y = function(_) {
	  if (!arguments.length) return y;
	  y = _;
	  return chart;
	};

	chart.dimension = function(_) {
	  if (!arguments.length) return dimension;
	  dimension = _;
	  return chart;
	};

	chart.timelineFilter = function(_) {
	  if (_) {
		brush.extent(_);
		dimension.filterRange(_);
	  } else {
		brush.clear();
		dimension.filterAll();
	  }
	  brushDirty = true;
	  return chart;
	};

	chart.group = function(_) {
	  if (!arguments.length) return group;
	  group = _;
	  return chart;
	};

	chart.round = function(_) {
	  if (!arguments.length) return round;
	  round = _;
	  return chart;
	};

	chart.data = function(value) {
		if(!arguments.length) return data;
		data = value;
		return chart;
	}

	//return d3.rebind(chart, brush, "on");
	return d3.rebind(chart, dispatch, "on");

	function appendRangeButtons(ranges, y, offset, fill){

		var gb = svg.append('g').attr('transform','translate(30,'+y+')') 

		var gRects = gb.selectAll('g')
			.data(ranges)
			.enter().append("g");


		gRects.append('rect')
			.attr({ 
				height:15,
				y:3,
				x:function (d) { return x(d.start)},
				width:function (d) { return x(d.end) - x(d.start)}, 
				fill: fill,
				stroke: 'white',
				'stroke-width': 1,
				cursor : 'pointer' 	
			})

		gRects.append('text')
			.text( function(d){return d.name} )
			.attr({
				y:17,
				x:  function(d){return (d.offset===undefined)? x(d.start) + offset : x(d.start) + offset - d.offset  },//(xAxis(legislatures[legisNum].end) - xAxis(legislatures[legisNum].start))/2,
				fill:"#fff",
				'font-size':13,
				cursor : 'pointer' 
			})

		return gRects;
	}


	function appendGreyRangeButtons(ranges, y, offset ){

		var gRects = appendRangeButtons(ranges, y, offset,'#ccc');

		gRects
			.on('mouseover', function(){
				d3.select(this).select('rect').attr('fill','steelblue')
			})
			.on('mouseout', function(){
				if(d3.select(this)  )
				d3.select(this).select('rect').attr('fill','#ccc')
			})	
			.on('mousedown', function(d){
					//console.log(d.start +' '+ d.end)
					
					var extent = [d.start, d.end];
					
					svg.select(".brush")
						.call(brush.extent(extent))
						.selectAll(".resize")
						  .style("display", null);
						  
					g.select("#clip-timeline rect")
					  .attr("x", x(extent[0]))
					  .attr("width", x(extent[1]) - x(extent[0]));

					dispatch.timelineFilter([d.start, d.end])

			})
	
	}

	function appendClipedRangeButtons(ranges, y, offset ){

		var gRects = appendRangeButtons(ranges, y, offset,'steelblue');

		gRects.selectAll('rect').attr("clip-path", "url(#clip-timeline)");	
		gRects.selectAll('text').attr("clip-path", "url(#clip-timeline)");	

		gRects
			// TODO highlight the grey button => when the mouse is over on a partialy cliped button 
			// .on('mouseover', function(){
			// 	d3.select(this).select('rect').attr('fill','steelblue')
			// })
			// .on('mouseout', function(){
			// 	if(d3.select(this)  )
			// 	d3.select(this).select('rect').attr('fill','#ccc')
			// })	
			.on('mousedown', function(d){
						//console.log(d.start +' '+ d.end)
						
						var extent = [d.start, d.end];
						
						svg.select(".brush")
							.call(brush.extent(extent))
							.selectAll(".resize")
							  .style("display", null);
							  
						g.select("#clip-timeline rect")
						  .attr("x", x(extent[0]))
						  .attr("width", x(extent[1]) - x(extent[0]));

						dispatch.timelineFilter([d.start, d.end])

				})
	}

	function appendElections( height ){
		var gb = svg.append('g').attr('transform','translate(30,'+height+')') 


		var texts = gb.selectAll('text')
			.data( $.map(elections,function(d){return d}) )
			.enter()
				.append('text')
				.attr({ 
					class:"glyphicon",
					x:function (d) { return x(d.dates[0]) },
					y:20,
					width:20,
					height:20,
					cursor : 'pointer' 	
				}).text('')
				//

		texts.append("title").text( function (d) { return d.name })


		texts
		.on('mouseover', function(d){
				$("#infoRow").append('<div id="propList"><table><thead><tr> <th>#</th> <th>1º</th> <th>2º</th><th>Candidato</th><th>Coligação</th> <th>Partidos Coligados</th></tr></thead><tbody></tbody></table></div>')
			
				var tableContent = '';
				var partiesColigationColor = {};

				// For each item in our JSON, add a table row and cells to the content string
				$.each(d.parties, function(i){
					tableContent += '<tr>';
					tableContent += '<td> <span class="color-preview" style="background-color: '+ partyColor(d.parties[i].parties[0])+';"></span> </td>';
					tableContent += '<td>'+(d.parties[i].result[0]*100).toFixed(2)+' %</td>';
					tableContent += '<td>'+ ((d.parties[i].result[1] === undefined)? '-' : (d.parties[i].result[1]*100).toFixed(2) +'%')+ '</td>';
					tableContent += '<td>'+d.parties[i].president+ '</td>';
					tableContent += '<td>'+d.parties[i].name+'</td>';
					tableContent += '<td>'+ $.map(d.parties[i].parties, function(party){ return party}) +'</td>';
					// tableContent += '<td>' + this.email + '</td>';
					// tableContent += '<td><a href="#" class="linkdeleteuser" rel="' + this._id + '">delete</a></td>';
					tableContent += '</tr>';

					$.each(d.parties[i].parties, function(party){ return partiesColigationColor[d.parties[i].parties[party]]= partyColor( d.parties[i].parties[0] )  })

				});

				// Inject the whole content string into our existing HTML table
				$('#propList table tbody').html(tableContent);

				//console.log(partiesColigationColor)
				var coligationColor = function(party){ 
					if(partiesColigationColor[party] !== undefined ) 
						{return partiesColigationColor[party];}
					else{ /*console.log(party);*/ return "#AAA" }
				} 

				d3.selectAll(".node.deputy").style("fill", function(d) { 
					if(d.record !== undefined) d = d.record;
					return coligationColor(d.party) 
				});

		})
		.on('mouseout', function(){
			$("#infoRow").children().remove();

			d3.selectAll(".node.deputy").style("fill", function(d) { 
				if(d.record !== undefined) d = d.record;
				return partyColor(d.party) 
			});

		})
	}


	//
}

