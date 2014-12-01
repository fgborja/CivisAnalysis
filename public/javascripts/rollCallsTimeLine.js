//===============================================================================================================
//===============================================================================================================
// TIMELINE CHART
if(!d3.chart) d3.chart = {};

d3.chart.timeline = function() {

	var data,
		svg,
		g,
		width,height,
		margin = {top: 0, right: 15, bottom: 30, left: 30},
		histogramHeight = 40,
		x,
		y = d3.scale.linear().range([histogramHeight, 0]),
		id = 0,
		brush = d3.svg.brush(),
		brushDirty,
		dimension,
		group,
		round;
	var dispatch = d3.dispatch(chart, "timelineFilter", 'setAlliances');

	function chart(div,svgwidth,svgheight) {
		width = svgwidth - margin.left - margin.right,
		height = svgheight - margin.top - margin.bottom;

		g = div.select("g");

		// Create the skeletal chart.
		if (g.empty()) {

			svg = div.append("svg")
				.attr("width", svgwidth)
				.attr("height", svgheight)
				
			g =	svg.append("g")
					.attr("transform", "translate(" + margin.left + ",0)");

			svg.append("clipPath")
				.attr("id", "clip-timeline")
				.append("rect")
					.attr("width", width)
					.attr("height", height);
		}

		
	}

	chart.update = function () {

		if(!group){
			updateRollCallHistogram();

			// TODO contantes chusmes! wtf ive done here?  height,width(?!!)
			appendGreyRangeButtons(CONGRESS_DEFINE.years,histogramHeight)
			appendGreyRangeButtons(CONGRESS_DEFINE.legislatures,histogramHeight+15 );
			appendGreyRangeButtons(CONGRESS_DEFINE.presidents,histogramHeight+30 );

			appendClipedRangeButtons(CONGRESS_DEFINE.years,histogramHeight)
			appendClipedRangeButtons(CONGRESS_DEFINE.legislatures, histogramHeight+15 );
			appendClipedRangeButtons(CONGRESS_DEFINE.presidents, histogramHeight+30 );

			appendElections(histogramHeight+45);

			setPartiesTraces(histogramHeight+43)
		}
	}

	function barPath(groups) {
		var path = [],
			i = -1,
			n = groups.length,
			d;
		while (++i < n) {
			d = groups[i];
			path.push("M", x(d.key), ",", histogramHeight, "V", y(d.value), "h9V", histogramHeight);
		}
		return path.join("");
	}

	function resizePath(d) {
		var e = +(d == "e"),
			x = e ? 1 : -1,
			y = histogramHeight/3;
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

	// brush.on("brushstart.chart", function() {
	//   var div = d3.select(this.parentNode.parentNode.parentNode);
	//   div.select(".title a").style("display", null);
	// });

	brush.on("brush.chart", function() {
	  var g = d3.select(this.parentNode),
		  extent = brush.extent();
	  if (round) g.select(".brush")
		  .call(brush.extent(extent = extent.map(round)))
		.selectAll(".resize")
		  .style("display", null);
	  svg.select("#clip-timeline rect")
		  .attr("x", x(extent[0]))
		  .attr("width", x(extent[1]) - x(extent[0]));
	  //dimension.filterRange(extent);
	  //console.log(extent)
	  
	var labels = svg.selectAll('.dateLabel')
		.data(extent)
	  	
	labels.enter()
  		.append('text')
  			.attr({
  				'class':'dateLabel',
  				opacity: 0.8
  			});

	labels.transition()
		.attr({
			y: function(d,i){ return (i)? histogramHeight : histogramHeight/3; },
		  	x: function(d,i){ return ((i)? +35 : -40) + x(d);} 
		})
		.text( function(d){return d.toLocaleDateString();})
	});

	brush.on("brushend.chart", function() {
		if (brush.empty()) {
			var div = d3.select(this.parentNode.parentNode.parentNode);
			//div.select(".title a").style("display", "none");
			//div.select("#clip-timeline rect").attr("x", null).attr("width", "100%");
			//dimension.filterAll();
		}
		// clear selected alliance
		dispatch.setAlliances(null);
		svg.select('.glyphicon.selected').classed('selected',false);
		//!!!!!!!!!!
		dispatch.timelineFilter(brush.extent())
		//console.log()
	});

	function updateRollCallHistogram (){

			var datetimeList =[];
			data.forEach( function(d){ datetimeList.push( d.datetime )});
			var dateCF = crossfilter(datetimeList);
			dimension = dateCF.dimension( function(d){ return d });
			group = dimension.group(d3.time.week);
			round = d3.time.week.round;
			
			chart.x(d3.time.scale()
				.domain([new Date(1991, 0, 1), new Date(2015, 0, 1)])
				.rangeRound([margin.left, width -margin.right]))
				//.timelineFilter([new Date(2012, 0, 1), new Date()]);

			y.domain([0, group.top(1)[0].value]);

			// MAX RollCalls/week LINE --------------------------------------------
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
			// MAX RollCalls/week LINE ===========================================


			g.selectAll(".bar")
				.data(["background", "foreground"])
					.enter().append("path")
					.attr("class", function(d) { return d + " bar"; })
					.datum(group.all());

			g.selectAll(".bar").attr("d", barPath);

			g.selectAll(".foreground.bar")
					.attr("clip-path", "url(#clip-timeline)");	

			// Initialize the brush component with pretty resize handles.
			gBrush = g.append("g").attr("class", "brush").call(brush);
			gBrush.selectAll("rect").attr("height", height+histogramHeight);
			gBrush.selectAll(".resize").append("path").attr("d", resizePath);

			// Only redraw the brush if set externally.
			if (brushDirty) {
			  brushDirty = false;
			  g.selectAll(".brush").call(brush);
			  //div.select(".title a").style("display", brush.empty() ? "none" : null);
			  if (brush.empty()) {
				svg.select("#clip-timeline rect")
					.attr("x", 0)
					.attr("width", 0);
			  } else {
				var extent = brush.extent();
				svg.select("#clip-timeline rect")
					.attr("x", x(extent[0]))
					.attr("width", x(extent[1]) - x(extent[0]));
			  }
			}
	}

	function setPartiesTraces(y){

		var yearColumms = svg.append('g').attr({transform:'translate('+margin.left+','+y+')'});

		function scaleX_middleOfYear(year) { return (x(new Date(year+1,0)) -  x(new Date(year,0)))/2 + x(new Date(year,0)) }

		d3.range(1991,2015).forEach(function(year){ 
			if((year+1)%2)
				yearColumms.append('path').attr({
					d: 'M '+scaleX_middleOfYear(year)+' 10 V '+(height),
					stroke:'grey',
					'stroke-dasharray':"10,10"
				})    
		})

		var scaleYearExtents = {};
		$.each(CONGRESS_DEFINE.partiesTraces.extents, function(year){
			scaleYearExtents[year] = d3.scale.linear()
										.domain(this)
										.range([(height-y)-margin.bottom,80]);
										//.range([60, 440]);
		})

		// PARTIES--------------
		var parties = d3.entries(CONGRESS_DEFINE.partiesTraces.traces)
		 				.sort( function(a,b){ return b.value[1991].center[1] - a.value[1991].center[1];  });
		var y1=0; 
		// parties.forEach( function(d){ d.y0 = y1; y1+=d.value[1991].size; d.y1=y1;  })
		parties.forEach( function(d){ d.y0 = y1; y1+= 30; d.y1=y1;  }) // constant size
			
		var scaleLabels = d3.scale.linear()
						.domain( [0, parties[parties.length-1].y1 ] )
						.range([65,(height-y)+15]);
		//----------------------

		var traces =  svg.append('g').attr({'class':'traces',transform:'translate('+margin.left+','+y+')'})
							.selectAll('.trace')
								.data( parties )
								.enter()
								.append('g').attr('class','trace')

		// PARTIES LABELS					
		traces.selectAll('path.lbl')
			.data( function(d){ return [d]})
			.enter()
			.append("path")
				.attr('class','lbl')
				.attr("d", drawPartyLabel )
				.attr("stroke", function(d){ return 'grey'/*CONGRESS_DEFINE.getPartyColor(d.key);*/ } )
				.attr("stroke-width", 2)
				.style("fill", function(d){ return CONGRESS_DEFINE.getPartyColor(d.key); })
				//.style("fill", 'transparent')
				.attr('stroke-dasharray',"5,2")
				.attr("opacity", 0.3)
				.on('mouseover', function(d){ var c ={}; c[d.key]=true; chart.partiesHovered(c); });

		traces.selectAll('text')
			.data( function(d){ return [d]})
			.enter()
			.append('text')
				.attr({
					'class':'lbl',
					x:scaleX_middleOfYear(1990) + 3, 
					y: function(d){ return scaleLabels( d.y1 ) - 17} ,
					'font-size': "12px"
				})
				.text(function(d){return d.key})

		// PARTIES TRACES/FLOW
		traces.selectAll('path.flow')
			.data( function(d){ return [d]})
			.enter()
			.append("path")
				.attr('class','flow')
				.attr("d", drawPartyFlow )
				.attr("stroke", 'white' )
				.attr("stroke-width", 2)
				.style("fill", function(d){ return CONGRESS_DEFINE.getPartyColor(d.key); })
				.attr("opacity", 0.6)

			function drawPartyFlow (party) {
				var lineFunction = d3.svg.line()
					.x(function (d) { return d.x })
					.y(function (d) { return d.y })
					.interpolate("cardinal");

				var dataPath = [];

				d3.entries( party.value ).forEach( function (d) {
					dataPath.push( {
						x: scaleX_middleOfYear (Number.parseInt(d.key)+1), 
						y: scaleYearExtents[d.key](d.value.center[1]) + d.value.size/2
					});
				});

				d3.entries( party.value ).reverse().forEach( function (d) {
					dataPath.push( {
						x: scaleX_middleOfYear(Number.parseInt(d.key)+1), 
						y: scaleYearExtents[d.key](d.value.center[1]) - d.value.size/2
					});
				});
				return lineFunction( dataPath ) + "Z";
			}

			function drawPartyLabel (party) {
				var lineFunction = d3.svg.line()
					.x(function (d) { return d.x })
					.y(function (d) { return d.y })
					.interpolate("linear");
				var dataPath = [];

				dataPath.push( {x: scaleX_middleOfYear(1990), y: scaleLabels( party.y0 ) });
				dataPath.push( {x: scaleX_middleOfYear(1991), y: scaleLabels( party.y0 ) });

				dataPath.push( {x: scaleX_middleOfYear(1992), y: scaleYearExtents[1991](party.value[1991].center[1]) - party.value[1991].size/2 +2.2});
				dataPath.push( {x: scaleX_middleOfYear(1992), y: scaleYearExtents[1991](party.value[1991].center[1]) + party.value[1991].size/2 -2});
				
				dataPath.push( {x: scaleX_middleOfYear(1991), y: scaleLabels( party.y1 )-8 });
				dataPath.push( {x: scaleX_middleOfYear(1990), y: scaleLabels( party.y1 )-8 });

				return lineFunction( dataPath ) + "Z";
			}
		// traces.selectAll('path')
		// 	.data( function(d){ return [d]})
		// 	.enter()
		// 	.append("path")
		// 		.attr("d", drawPartyLabels )
		// 		.attr("stroke", function(d){ return CONGRESS_DEFINE.getPartyColor(d.key); })
		// 		.attr("stroke-width", 2)
		// 		.attr('stroke-dasharray',"10,10")
		// 		.style("fill", 'white'})
		// 		.attr("opacity", 0.6);

	}

	// sort the traces - the hovered parties to front
	chart.partiesHovered = function (parties){
		if(parties !== null){
			svg.selectAll('.trace').sort(function (party, b) { // select the parent and sort the path's
				if(parties[party.key]!== undefined){
					if (parties[party.key]) return 1;  // --> party hovered to front          
					else return -1;                             
				} else return -1;
			});
		}
	}

	chart.margin = function(_) {
		if (!arguments.length) return margin;
		margin = _;
		return chart;
	};

	chart.scaleByX = function(_) {
		return x(_);
	};

	chart.x = function(_) {
		if (!arguments.length) return x;
		x = _;
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

		var gb = svg.append('g').attr('transform','translate('+margin.left+','+y+')') 

		var gRects = gb.selectAll('g')
			.data(ranges)
			.enter().append("g");


		gRects.append('rect')
			.attr({ 
				height:15,
				y:3,
				x:function (d) { return x(d.period[0])},
				width:function (d) { return x(d.period[1]) - x(d.period[0])}, 
				fill: fill,
				stroke: 'white',
				'stroke-width': 1,
				cursor : 'pointer' 	
			})

		gRects.append('text')
			.text( function(d){return d.name} )
			.attr({
				y:17,
				x:  function(d){return  x(d.period[0])+ (x(d.period[1]) - x(d.period[0]))/2   },
				fill:"#fff",
				'font-size': function(d) { return Math.log((x(d.period[1]) - x(d.period[0])) / this.getComputedTextLength()*9 )*5 + "px"; },
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
		svg.selectAll('.dateLabel').remove();
		// clear selected alliance
		dispatch.setAlliances(null);
		svg.select('.glyphicon.selected').classed('selected',false);
		
		
		svg.select(".brush")
			.call(brush.extent(d.period))
			.selectAll(".resize")
			  .style("display", null);
			  
		svg.select("#clip-timeline rect")
		  .attr("x", x(d.period[0]) )
		  .attr("width", x(d.period[1])- x(d.period[0]) );

		dispatch.timelineFilter(d.period)		
	}

	function appendElections( height ){
		var gb = svg.append('g').attr('transform','translate('+margin.left+','+height+')') 


		var allianceIcons = gb.selectAll('text')
			.data( $.map(CONGRESS_DEFINE.elections,function(d){return d}) )
			.enter()
				.append('text')
				.attr({    
					class:"glyphicon",
					x:function (d) { return x(d.dates[0]) },
					y:20,
					width:20,
					height:20,
					cursor : 'pointer',
					href:"#",
					'data-container':'#mainBody',
					'data-content':alliancePopover, 
					'data-html': true,
					rel:"popover", 
					'data-placement': function (d,i) { if(i>5) return 'left'; else return 'top';}, 
					'data-original-title': function(d){ return 'Brazilian Presidential Election of '+d.name}, 
					'data-trigger':"hover",
					'data-viewport': '#timeline'
				}).text('')
				//

		function alliancePopover( d ){
			var partiesColigationColor = {};
			var tableContent = '';
			// For each item in our JSON, add a table row and cells to the content string
			$.each(d.alliances, function(i){
				tableContent += '<tr>';
				tableContent += '<td> <span class="color-preview" style="background-color: '+ CONGRESS_DEFINE.getConstantPartyColor(d.alliances[i].parties[0])+';"></span> </td>';
				tableContent += '<td>'+(d.alliances[i].result[0]*100).toFixed(2)+' %</td>';
				tableContent += '<td>'+ ((d.alliances[i].result[1] === undefined)? '-' : (d.alliances[i].result[1]*100).toFixed(2) +'%')+ '</td>';
				tableContent += '<td>'+d.alliances[i].president+ '</td>';
				tableContent += '<td>'+d.alliances[i].name+'</td>';
				tableContent += '<td>'+ $.map(d.alliances[i].parties, function(party){ return party}) +'</td>';
				// tableContent += '<td>' + this.email + '</td>';
				// tableContent += '<td><a href="#" class="linkdeleteuser" rel="' + this._id + '">delete</a></td>';
				tableContent += '</tr>';			
			});
			
			var html = '<div id="propList">'+
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
			;
			return html;
		}
		// POPOVER!
		$('text.glyphicon').popover({ trigger: "hover" });

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

