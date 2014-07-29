if(!d3.chart) d3.chart = {};

d3.chart.timelineBarChart = function() {

	var data,
		svg,
		g,
		colWidth = $('#timeline').width(),
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
	var dispatch = d3.dispatch(chart, "timelineFilter", 'setAlliances');

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

	chart.update = function () {
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

			// MAX VALUE LINE --------------------------------------------
				g.append('path')
					.attr('pointer','none')
					.attr('stroke-dasharray','5,5,5')
					.attr('stroke','grey')
					.attr('stroke-width','1px')
					.attr('d','M0 '+y(group.top(1)[0].value)+' l'+(width-margin.right)+' '+y(group.top(1)[0].value))

				g.append('text').attr({
					x: 0,
					y: y(group.top(1)[0].value) + 11,
					'fill':'grey',
					'font-size': 11
				}).text('max RollCalls/week:'+group.top(1)[0].value)
			// MAX VALUE LINE ===========================================


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
			appendGreyRangeButtons(years,height+2)
			appendGreyRangeButtons(legislatures,height+17 );
			appendGreyRangeButtons(presidents,height+32 );

			appendClipedRangeButtons(years,height+2)
			appendClipedRangeButtons(legislatures, height+17 );
			appendClipedRangeButtons(presidents, height+32 );

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
		// clear selected alliance
		dispatch.setAlliances(null);
		svg.select('.glyphicon.selected').classed('selected',false);
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

	function appendRangeButtons(ranges, y, fill){

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
				x:  function(d){return  x(d.start)+ (x(d.end) - x(d.start))/2   },//(xAxis(legislatures[legisNum].end) - xAxis(legislatures[legisNum].start))/2,
				fill:"#fff",
				'font-size': function(d) { return Math.log((x(d.end) - x(d.start)) / this.getComputedTextLength()*9 )*5 + "px"; },
				//'font-size': 13,
				cursor : 'pointer' 
			}).attr("text-anchor", "middle")

		return gRects;
	}


	function appendGreyRangeButtons(ranges, y ){

		var gRects = appendRangeButtons(ranges, y,'#ccc');

		gRects
			.on('mouseover', function(){
				d3.select(this).select('rect').attr('fill','steelblue')
			})
			.on('mouseout', function(){
				if(d3.select(this)  )
				d3.select(this).select('rect').attr('fill','#ccc')
			})	
			.on('mousedown', function(d){ presetDateRangeButtonSelected(d); })
	
	}

	function appendClipedRangeButtons(ranges, y ){

		var gRects = appendRangeButtons(ranges, y,'steelblue');

		gRects.selectAll('rect').attr("clip-path", "url(#clip-timeline)");	
		gRects.selectAll('text').attr("clip-path", "url(#clip-timeline)");	

		gRects
			.on('mousedown', function(d){ presetDateRangeButtonSelected(d); })
			// TODO highlight the grey button => when the mouse is over on a partialy cliped button 
			// .on('mouseover', function(){
			// 	d3.select(this).select('rect').attr('fill','steelblue')
			// })
			// .on('mouseout', function(){
			// 	if(d3.select(this)  )
			// 	d3.select(this).select('rect').attr('fill','#ccc')
			// })	
			
	}

	function presetDateRangeButtonSelected(d){
		// clear selected alliance
		dispatch.setAlliances(null);
		svg.select('.glyphicon.selected').classed('selected',false);
		
		
		svg.select(".brush")
			.call(brush.extent([d.start, d.end]))
			.selectAll(".resize")
			  .style("display", null);
			  
		g.select("#clip-timeline rect")
		  .attr("x", x(d.start))
		  .attr("width", x(d.end) - x(d.start));

		dispatch.timelineFilter([d.start, d.end])		
	}

	function appendElections( height ){
		var gb = svg.append('g').attr('transform','translate(30,'+height+')') 


		var allianceIcons = gb.selectAll('text')
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
				}).text('')
				//

		//allianceIcons.append("title").text( function (d) { return d.name })

		allianceIcons.on('mouseout', function(d){ 
			var tr = tooltip.transition().duration(200).style("opacity", 0);
			tr.style('visibility','hidden')
		})
		allianceIcons.on('mouseover', function(d){

			var partiesColigationColor = {};

			var tableContent = '';
			// For each item in our JSON, add a table row and cells to the content string
			$.each(d.alliances, function(i){
				tableContent += '<tr>';
				tableContent += '<td> <span class="color-preview" style="background-color: '+ getPartyColor(d.alliances[i].parties[0])+';"></span> </td>';
				tableContent += '<td>'+(d.alliances[i].result[0]*100).toFixed(2)+' %</td>';
				tableContent += '<td>'+ ((d.alliances[i].result[1] === undefined)? '-' : (d.alliances[i].result[1]*100).toFixed(2) +'%')+ '</td>';
				tableContent += '<td>'+d.alliances[i].president+ '</td>';
				tableContent += '<td>'+d.alliances[i].name+'</td>';
				tableContent += '<td>'+ $.map(d.alliances[i].parties, function(party){ return party}) +'</td>';
				// tableContent += '<td>' + this.email + '</td>';
				// tableContent += '<td><a href="#" class="linkdeleteuser" rel="' + this._id + '">delete</a></td>';
				tableContent += '</tr>';			
			});
			
			tooltip.html('<h3> Brazilian Presidential Election of '+d.name+'</h3>' +' <br>'+
				'<div id="propList">'+
					'<table>'+
						'<thead>'+
							'<tr>'+ 
								'<th>#</th>'+
								'<th>1st Round</th>'+
								'<th>2nd</th>'+
								'<th>Nominee</th>'+
								'<th>Electoral Alliance</th>'+
								'<th>Allied Parties</th>'+
							'</tr>'+
						'</thead>'+
						'<tbody>'+
							tableContent +
						'</tbody>'+
					'</table>'+
				'</div>'
				+ '<em>Click to set alliances</em>'
			);

			tooltip.transition().duration(200).style("opacity", 1);

			return tooltip.style("visibility", "visible")
							.style("top", (250 )+"px")
							.style("left",($(window).width()/4 )+"px");
		})	

		// set on/off alliance
		allianceIcons.on('click', function(d){
			var element = d3.select(this)

			if( element.classed('selected') ){
				
				element.classed('selected',false)
				dispatch.setAlliances(null);
			}else{
				tooltip.style('visibility','hidden')
				gb.selectAll('text').classed('selected',false)

				dispatch.setAlliances(null);

				element.classed('selected',true)

				dispatch.setAlliances(d.alliances);
			
			}
		})
	}


	//
}

