
// var partiesICO = {
// 	'DEM':'http://www.dem.org.br/favicon.ico',
// 	'PCdoB':'http://www.pcdob.org.br/img/logo.bottom.png',
// 	'PDT':'http://www.pdt.org.br/favicon.ico',

// }

var radius = 4;
var radiusHover = 8;
var pxMargin = radius+5;

if(!d3.chart) d3.chart = {};

d3.chart.deputiesScatterplot = function() {
	var scatterplot, g;
	var data;
	var dispatch = d3.dispatch("hover","selected");

	var colWidth = $('.canvas').width() * canvasWidthAdjust;

	var margin = {top: pxMargin, right: pxMargin, bottom: pxMargin, left: pxMargin}
	  , width = colWidth - margin.left - margin.right
	  , height = colWidth - margin.top - margin.bottom;

	function chart(container) {
		
		scatterplot = container.append('svg:svg')
			.attr('class', 'chart deputy');

		// scatterplot.append('path')
		// 	.attr('pointer','none')
		// 	//.attr('stroke-dasharray','5,5,5')
		// 	.attr('stroke','grey')
		// 	.attr('stroke-width','2px')
		// 	.attr('d','M0 '+colWidth+' l'+colWidth+' -'+colWidth)

		g = scatterplot.append('g')
			.attr('class', 'main')

		g.append('rect')
			.attr('class', 'selectorRect')
			.attr('opacity', '0');

		g.append("g")
		.classed("axis x", true)

		g.append("g")
		.classed("axis y", true)



		selectors('deputy',dispatch.selected);
		
		//update();
	}

	chart.on = dispatch.on;

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

		g.select(".selectorRect")
			.attr('width', width)
			.attr('height', height)
			.attr('fill', 'white') 
	
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
			.data(data, function(d){ return d.phonebookID});

		circles.enter().append("circle");

		circles
		.transition()
		.attr({
			cx: function (d) { return scaleX(d.scatterplot[0]); },
			cy: function (d) { return scaleY(d.scatterplot[1]); },
			r: radius,
			class: function() { if(selected==null) return "node selected" } ,
			id: function(d) { return "deputy-" + d.phonebookID; },
			fill: function(d) { return getPartyColor(d.party) },
			deputy: function(d) { return d.phonebookID}
		})
		circles.exit().transition().remove();

		circles
			.on("mouseover", mouseoverDeputy)
			.on("mousemove", mousemoveDeputy)
			.on("mouseout", mouseoutDeputy)
			.on("click", mouseClickDeputy)

			
		// mouse OVER circle deputy
		function mouseoverDeputy(d) {
			d3.select(this).attr("r",radiusHover)
	
			dispatch.hover(d,true);

			tooltip.html(d.name +' ('+d.party+'-'+d.state+")<br /><em>Click to select</em>");
			
			return tooltip
					.style("visibility", "visible")
					.style("opacity", 1)
		}	

		// mouse MOVE circle deputy
		function mousemoveDeputy() { return tooltip.style("top", (event.pageY - 10)+"px").style("left",(event.pageX + 10)+"px");}

		// mouse OUT circle deputy
		function mouseoutDeputy(d){ 
			d3.select(this).attr("r",radius);

			dispatch.hover(d,false);

			return tooltip.style('visibility','hidden')
		}

		function mouseClickDeputy(d){
			if (d3.event.shiftKey){	
				// using the shiftKey deselect the rollCall				
				d3.select(this).classed('selected',false);
				
				//dispatch event of selected rollCalls
				dispatch.selected( chart.getSelectedDeputiesIDs() )

			} else 
			if (d3.event.ctrlKey){
				// using the ctrlKey add rollCalls to selection
				d3.select(this).classed('selected',true);
				
				//dispatch event of selected rollCalls
				dispatch.selected( chart.getSelectedDeputiesIDs() )

			} 
			else {
				// a left click without any key pressed -> select only the state (deselect others)
				g.selectAll('circle').classed('selected',false)
				d3.select(this).classed('selected',true);

				//dispatch event of selected states
				dispatch.selected([ d3.select(this).attr('deputy') ])
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

	// 'hover' deputies of a single state (or null)
	chart.highlightState = function (state){

		g.selectAll('.node').attr('r', function (d){   
			if(d.state == state) 
				 return radiusHover;
			else return radius;
		})

		if(state != null)
			sortNodesByAtribute('state',state)
	}

	chart.highlightDeputy = function( phonebookID, mouseover) {
		if(mouseover){
			g.selectAll('#deputy-'+phonebookID).attr("r",radiusHover);
		}else{
			g.selectAll('#deputy-'+phonebookID).attr("r",radius);
		}
		
	}

	// @param hoverParties : Object
	chart.highlightParties = function(hoverParties){

		if(hoverParties != null){
			g.selectAll('.node').attr('r', function (d){   
				if(hoverParties[ d.party] !== undefined) 
					 return radiusHover;
				else return radius;
			})

			// sort elements 
			$.each( hoverParties, function(party){
				sortNodesByAtribute('party',party);	
			})		
		}
		else g.selectAll('.node').attr('r', radius)
	}

	// @param selectParties : Array
	chart.selectParties = function(selectParties, operation){

		if(selectParties != null){
			
			chart.selectNodesByAttr('party', selectParties[0], operation )

			if(operation == 'SET'){
				selectParties.forEach( function(party){ chart.selectNodesByAttr('party', party, 'ADD' ) })
			} else {
				selectParties.forEach( function(party){ chart.selectNodesByAttr('party', party, operation ) })
			}

			//$.each(selectParties, function(party){ chart.selectNodesByAttr('party', party, operation ) })
		}
		else g.selectAll('.node').attr('r', radius)
	}

	// select deputies of an array of states // and dispatch the selected
	// @param operation : 'set','add','exclude';
	chart.selectStates = function (state, operation ){

		selectNodesByAttr('state', state, operation )

		// DISPATCH SELECTED!
		var phonebookIDs = [];
		g.selectAll('.node.selected').each( function(d){ phonebookIDs.push(d.phonebookID) })
		dispatch.selected(phonebookIDs)
	}

	chart.selectNodesByAttr = function (attr, value, operation ){

		// SELECT OPERATION
		if(value == null) g.selectAll('.node').classed('selected',true);
		else{
			if(operation == 'SET'){
				g.selectAll('.node').classed('selected', function (d){   
					if(value == d[attr]){ return true; }
					else return false;
				})
			}
			else{ 
				g.selectAll('.node').each(function(d){  
					if(value == d[attr]){
						//var selectedState = d3.select(this).attr('selected');
						if(operation == 'ADD'){ 
							d3.select(this).classed('selected',true);
						}
						else if(operation == 'EXCLUDE') { d3.select(this).classed('selected',false); }
					}
				});
			}
		}

		// DISPATCH SELECTED!
		var phonebookIDs = [];
		g.selectAll('.node.selected').each( function(d){ phonebookIDs.push(d.phonebookID) })
		dispatch.selected(phonebookIDs)
	}

	chart.resetRollCallRates = function(){
		chart.resetRollCallRates();
		dispatch.selected(null)
	}

	chart.highlightRollCall = function(rollCall, mouseover){
		if(mouseover){
			g.selectAll('.node').style('fill', 'darkgrey');
			$.map(rollCall.rollCall.votos.Deputado, function(vote){ 
				g.selectAll("#deputy-"+phonebook.getPhonebookID(vote.Nome)).style("fill",votoStringToColor[vote.Voto]); 
			});
		}else g.selectAll(".node").style("fill", function(d) { return setDeputyFill(d) });
	}

	chart.setRollCallVotingRate = function(){
		//console.log('deputiesScatterplot : setRollCallVotingRate')
		//g.selectAll('.node').style('fill', 'darkgrey');
		g.selectAll(".node").style("fill", function(d) { return setDeputyFill(d) });	
	}

	chart.resetRollCallRates = function (){
		var nodes = g.selectAll('.node').each( function(d){ d.rate = null;	})
		nodes.style('fill', function(d){ return setDeputyFill(d) })
	}

	function setDeputyFill( d ){
		if(d.rate == null){
			return getPartyColor(d.party)
		} else{ 
			if (d.rate == "noVotes")
				 return 'darkgrey' 
			else return votingColor(d.rate)
		}
	}

	function sortNodesByAtribute( attr , value){
			g.selectAll('.node').sort(function (a, b) { // select the parent and sort the path's
				if (a[attr] != value) return -1;               // a is not the hovered element, send "a" to the back
				else return 1;                             // a is the hovered element, bring "a" to the front
			});
	}

	chart.getSelectedDeputiesIDs = function(){
		var selectedNodes = g.selectAll('.node.selected');
		return selectedNodes[0].map(function(d){ return d3.select(d).attr('deputy') })
	}

	chart.selectDeputies = function (operation, phonebookIDs) {
		if (phonebookIDs == null) g.selectAll('.node').classed("selected", true);
		else {
			if(operation == 'SET'){
				g.selectAll('.node').classed("selected", false);
				phonebookIDs.forEach( function(phonebookID){ g.select(".node#deputy-"+phonebookID).classed("selected", true); } )
			} else 
			if(operation == 'EXCLUDE') {
				phonebookIDs.forEach( function(phonebookID){ g.select(".node#deputy-"+phonebookID).classed("selected", false); } )
			} else 
			if(operation == 'ADD'){
				phonebookIDs.forEach( function(phonebookID){ g.select(".node#deputy-"+phonebookID).classed("selected", true); } )
			}
		}

		dispatch.selected(chart.getSelectedDeputiesIDs())
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



