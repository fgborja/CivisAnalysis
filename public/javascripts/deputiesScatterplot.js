
// var partiesICO = {
// 	'DEM':'http://www.dem.org.br/favicon.ico',
// 	'PCdoB':'http://www.pcdob.org.br/img/logo.bottom.png',
// 	'PDT':'http://www.pdt.org.br/favicon.ico',

// }

var radius = 3.7;
var radiusHover = radius*1.5;
var pxMargin = radius+5;

if(!d3.chart) d3.chart = {};

d3.chart.deputiesScatterplot = function() {
	var scatterplot, g;
	var data;
	var dispatch = d3.dispatch("hover","selected");

	var colWidth = $('.canvas').width();

	var margin = {top: pxMargin, right: pxMargin, bottom: pxMargin, left: pxMargin}
	  , width = colWidth - margin.left - margin.right
	  , height = colWidth*2 - margin.top - margin.bottom;

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



		selectors('deputy', chart.dispatchSelected );
		
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
			.style('fill', 'white') 
	
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
			.data(data, function(d){ return d.deputyID});

		circles.enter().append("circle");

		circles
		.transition()
		.attr({
			cx: function (d) { return scaleX(d.scatterplot[0]); },
			cy: function (d) { return scaleY(d.scatterplot[1]); },
			r: radius,
			class: function() { if(selected==null) return "node selected" } ,
			id: function(d) { return "deputy-" + d.deputyID; },
			deputy: function(d) { return d.deputyID}
		})
		.style('fill', function(d) { return CONGRESS_DEFINE.getPartyColor(d.party) })
		
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

			tooltip.html(d.name +' ('+d.party+'-'+d.district+")<br /><em>Click to select</em>");
			
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
				chart.dispatchSelected()

			} else 
			if (d3.event.ctrlKey){
				// using the ctrlKey add rollCalls to selection
				d3.select(this).classed('selected',true);
				
				//dispatch event of selected rollCalls
				chart.dispatchSelected()

			} 
			else {
				// a left click without any key pressed -> select only the state (deselect others)
				g.selectAll('circle').classed('selected',false)
				d3.select(this).classed('selected',true);

				//dispatch event of selected states
				chart.dispatchSelected()
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
	chart.highlightDistrict = function (district){

		g.selectAll('.node').attr('r', function (d){   
			if(d.district == district) 
				 return radiusHover;
			else return radius;
		})

		if(district != null)
			sortNodesByAtribute('district',district)
	}

	chart.highlightDeputy = function( deputyID, mouseover) {
		if(mouseover){
			g.selectAll('#deputy-'+deputyID).attr("r",radiusHover);
		}else{
			g.selectAll('#deputy-'+deputyID).attr("r",radius);
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
	chart.selectStates = function (district, operation ){

		selectNodesByAttr('district', district, operation )

		// DISPATCH SELECTED!
		dispatch.selected(chart.getSelected())
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
		dispatch.selected(chart.getSelected())
	}

	chart.highlightRollCall = function(rollCall){
		g.selectAll('.node').style('fill', 'darkgrey');
		
		rollCall.rollCall.votes.forEach( function(vote){ 
			g.selectAll("#deputy-"+vote.deputyID).style("fill",CONGRESS_DEFINE.votoStringToColor[vote.vote]); 
		});
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
			return CONGRESS_DEFINE.getPartyColor(d.party)
		} else{ 
			if (d.rate == "noVotes")
				 return 'darkgrey' 
			else return CONGRESS_DEFINE.votingColor(d.rate)
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

	chart.getSelected = function(){
		var selected = [];
		g.selectAll('.node.selected').each( function(d){ selected.push(d) })
		return selected;
	}

	chart.dispatchSelected = function(){
		dispatch.selected( chart.getSelected());
	}

	chart.reset = function(){
		g.selectAll('.node').classed("selected", true);
		chart.dispatchSelected();
	}

	chart.unselectAll = function(){
		g.selectAll('.node').classed("selected", false);
		chart.dispatchSelected();
	}

	chart.selectDeputies = function (operation, deputyIDs) {
		if (deputyIDs == null) g.selectAll('.node').classed("selected", true);
		else {
			if(operation == 'SET'){
				g.selectAll('.node').classed("selected", false);
				deputyIDs.forEach( function(deputyID){ g.select(".node#deputy-"+deputyID).classed("selected", true); } )
			} else 
			if(operation == 'EXCLUDE') {
				deputyIDs.forEach( function(deputyID){ g.select(".node#deputy-"+deputyID).classed("selected", false); } )
			} else 
			if(operation == 'ADD'){
				deputyIDs.forEach( function(deputyID){ g.select(".node#deputy-"+deputyID).classed("selected", true); } )
			}
		}

		dispatch.selected(chart.getSelected())
	}

	chart.isSelected = function( deputyID ){
		return g.select('.node#deputy-'+deputyID).classed('selected');
	}
	chart.selectDeputy = function( deputyID ){
		g.select('.node#deputy-'+deputyID).classed('selected',true);
		dispatch.selected( chart.getSelected());
	}
	chart.unselectDeputy = function( deputyID ){
		g.select('.node#deputy-'+deputyID).classed('selected',false);
		dispatch.selected( chart.getSelected());
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



