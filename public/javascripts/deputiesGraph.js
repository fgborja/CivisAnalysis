if(!d3.chart) d3.chart = {};

d3.chart.deputiesGraph = function() {

	var svg,
		data,
		force,
		link,
		node
		threshold =70;

	/*global d3 tooltip*/
	$('#slider').slider({
        value: threshold,
        min: 50,
        max: 100
	});

	var nodes,links,every_link; // DATA
	var dispatch = d3.dispatch(chart, "hover",'select');

	var colWidth = $('.canvas').width() * canvasWidthAdjust;

	function chart(container) {
		svg = container.append("svg").attr("class",'graph deputy');

		return dispatch;
	}

	chart.on = dispatch.on;

	chart.update = update;
	function update() {
		
		svg.selectAll(".link").remove()
		//svg.selectAll(".node").remove()

		createNodeAndLinks();

		svg
			.attr('width', colWidth  )
			.attr('height', colWidth )

		force = d3.layout.force()
		.size([colWidth, colWidth])
		.nodes(nodes)
		.charge(-20)
		.gravity(0.4)
		.links(links)
		.on("tick", tick)

		force.start();

		link = svg.selectAll(".link")
			.data(force.links())
			.enter().insert("line",'.node')
			.attr("class", "link")

		node = svg.selectAll(".node")
			.data(force.nodes(), function(d){ return d.record.phonebookID })

		node.enter().append("circle");

		node.transition()
				.attr("class", "node selected")
				.attr("r", radius)
				.style("fill", function(d) { return getPartyColor(d.record.party); })
				.attr("id", function (d) { return "deputy-"+ d.record.phonebookID; })
				//.on('click', function(d){ console.log(d.record) })
				//.call(force.drag);

		node.exit().transition().remove();

		function tick () {
			node.attr("cx", function(d) { return d.x; }).attr("cy", function(d) { return d.y; });

			link.attr("x1", function(d) { return d.source.x; })
				.attr("y1", function(d) { return d.source.y; })
				.attr("x2", function(d) { return d.target.x; })
				.attr("y2", function(d) { return d.target.y; });
		}

		node
			.on("mouseover", mouseoverDeputy)
			.on("mousemove", mousemoveDeputy)
			.on("mouseout", mouseoutDeputy)
			.on("click", mouseClickDeputy)

			
		// mouse OVER circle deputy
		function mouseoverDeputy(d) {
			svg.select('#deputy-'+d.record.phonebookID).attr("r",radiusHover)
	
			dispatch.hover(d.record,true);

			tooltip.html(d.record.name +' ('+d.record.party+'-'+d.record.state+')'+"<br /><em>Click to select</em>");
			return tooltip
					.style("visibility", "visible")
					.style("opacity", 1);
		}	

		// mouse MOVE circle deputy
		function mousemoveDeputy() { return tooltip.style("top", (event.pageY - 10)+"px").style("left",(event.pageX + 10)+"px");}

		// mouse OUT circle deputy
		function mouseoutDeputy(d){ 
				svg.select('#deputy-'+d.record.phonebookID).attr("r",radius);
				
				dispatch.hover(d.record,false);
				
				return tooltip.style("visibility", "hidden");
		}
		function mouseClickDeputy(d){
			if (d3.event.shiftKey){	
				dispatch.select('EXCLUDE', [d.record.phonebookID] )
			} else 
			if (d3.event.ctrlKey){		
				dispatch.select('ADD', [d.record.phonebookID] )
			} 
			else {
				dispatch.select('SET', [d.record.phonebookID] )
			}		
		}


		$('#slider').slider().on("slide", function(ev) {	
				threshold = ev.value;
				$('#thresh').html(ev.value +'% ');
				links = filtered(ev.value);
				force.links(links);		
				
				link = svg.selectAll(".link")
					.data(force.links());

				node = svg.selectAll(".node")
					.data(force.nodes(), function(d){ return d.record.phonebookID});

				//console.log(link.enter())

				link.enter()
					.insert("line", ".node")		
					.attr("class", function(d) { return "link" });
					
				link.exit()
					.attr("class", function(d) { return "out"; })
					.remove();
					
				force.start();		
				
			});
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
	chart.stop = function() {
		if(force !== undefined) force.stop() 
	}

	function createNodeAndLinks(){

		// count how many times deputies voted equal (abstencao e obstencao not counted)
		// 	var chusme1 = numeric.dot(tableDepXRollCallYES, numeric.transpose(tableDepXRollCallYES)) // equal yay
		// 	var chusme2 = numeric.dot(tableDepXRollCallNO, numeric.transpose(tableDepXRollCallNO))   // equal nay
		// 	var chusme3 = numeric.dot(tableDepXRollCallAbst, numeric.transpose(tableDepXRollCallAbst))
		// var tableDepXDepSameVote = numeric.add(chusme1,chusme2)	// sum 
		// tableDepXDepSameVote = numeric.add(tableDepXDepSameVote,tableDepXRollCallAbst);
		//	var chusme3 = numeric.abs(tableDepXRollCall);

		// yay or nay votes in the same voting (abstencao e obstencao not counted)
		//var tableDepXDepOcor = numeric.dot(chusme3, numeric.transpose(chusme3)) 
			
			//console.log(tableDepXDepSameVote)			
			//console.log(tableDepXDepOcor)
		
		// lets create the crossvote with these two tables -> tableDepXDepSameVote : tableDepXDepOcor
		// for(var i=0; i<filteredDeputies.length; i++){
		// 	for(var j=i+1; j<filteredDeputies.length; j++){
		// 		crossVotes[i][j]= tableDepXDepSameVote[i][j] //,tableDepXDepOcor[i][j]				
		// 	}		
		// }

		//node,links;
		//data == tableDepXRollCall

		// firstly create the table deputy X deputy
		var crossVotes = numeric.rep([filteredDeputies.length,filteredDeputies.length],0)


		//count the times that a couple of deputy had the same vote
		for (var rollCallJ = 0; rollCallJ < tableDepXRollCall[0].length; rollCallJ++) {

			for (var deputyFirst = 0; deputyFirst < filteredDeputies.length; deputyFirst++) {
				for (var deputySecond = deputyFirst+1; deputySecond < filteredDeputies.length; deputySecond++) {
					
					if( tableDepXRollCall[deputyFirst][rollCallJ] == tableDepXRollCall[deputySecond][rollCallJ] /*&& (tableDepXRollCall[deputySecond][rollCallJ] != 0)*/)
					{
						crossVotes[deputyFirst][deputySecond]++;
						crossVotes[deputySecond][deputyFirst]++;
					}

				}
			}
		};

		// encapsulate each employeeRecord in a new object with 'record' attribute 
		nodes = $.map(filteredDeputies, function(d){ return {record:d} })
		every_link = []; //{ source: obj1, target: obj2, strenght: number of emails}

		for (var i = 0; i < crossVotes.length; i++) {
		for (var j = i+1; j < crossVotes.length; j++) {

					every_link.push({ total:(crossVotes[i][j]/tableDepXRollCall[0].length) *100, source:nodes[i],target:nodes[j] });
			};
		};

		links = filtered(threshold);

	}

	function filtered(thresh){
		//thresh = thresh/100;
		var g = [];
		$.each(every_link, function(i){ 
			if( (every_link[i].total > thresh)/* && (every_link[i].numVotes >30)*/ ) g.push(every_link[i]);
		})
		return g
	}

	// 'hover' deputies of a single state (or null)
	chart.highlightState = function (state){
		svg.selectAll('.graph .node').attr('r', function (d){ 
			if(d.record.state == state) 
				 return radiusHover;
			else return radius;
		})

		if(state != null)
			sortNodesByAtribute('state',state);
	}

	chart.highlightParties = function(hoverParties){
		
		if(hoverParties != null){
			svg.selectAll('.node').attr('r', function (d){  
				if(hoverParties[d.record.party] !== undefined) {
					return radiusHover;
				}
				else return radius;
			})

			$.each( hoverParties, function(party){
				sortNodesByAtribute('party',party);	
			})
		}
		else svg.selectAll('.node').attr('r', radius)
	}

	chart.highlightDeputy = function( phonebookID, mouseover) {
		if(mouseover){
			svg.select(".node#deputy-"+phonebookID).attr("r",radiusHover);
		}else{
			svg.select(".node#deputy-"+phonebookID).attr("r",radius);
		}
	}

	// select deputies of an array of states 
	chart.selectStates = function (states){
		var phonebookIDs = [];

		svg.selectAll('.node').classed('selected', function (d){   
			if(states[ d.record.state ] !== undefined){ 
				phonebookIDs.push(d.record.phonebookID);
				return true;
			}
			else return false;
		})
	}

	

	chart.highlightRollCall = function(rollCall, mouseover){
		
		if(mouseover){
			svg.selectAll('.node').style('fill', 'darkgrey');

			$.map(rollCall.rollCall.votos.Deputado, function(vote){ 
				svg.selectAll(".node#deputy-"+phonebook.getPhonebookID(vote.Nome)).style("fill",votoStringToColor[vote.Voto]); 
			});
		}else svg.selectAll('.node').style('fill', function(d){ return setDeputyFill(d) })
	}


	chart.setRollCallVotingRate = function(){
		svg.selectAll('.node').style('fill', function(d){ return setDeputyFill(d) })
	}

	chart.selectDeputies = function (phonebookIDs) {
		if (phonebookIDs == null) svg.selectAll('.node').classed("selected", true);
		else {
			svg.selectAll('.node').classed("selected", false);
			phonebookIDs.forEach( function(phonebookID){ svg.select(".node#deputy-"+phonebookID).classed("selected", true); } )
		}
	}

	chart.resetRollCallRates = function (){
		var nodes = svg.selectAll('.node').each( function(d){ d.record.rate = null;	})
		nodes.style('fill', function(d){ return setDeputyFill(d) })
	}

	function setDeputyFill( d ){

		if(d.record.rate == null){
			return getPartyColor(d.record.party)
		} else{ 
			if (d.record.rate == "noVotes")
				 return 'darkgrey' 
			else return votingColor(d.record.rate)
		}
	}

	function sortNodesByAtribute( attr , value){
			svg.selectAll('.node').sort(function (a, b) { // select the parent and sort the path's
				if (a.record[attr] != value) return -1;               // a is not the hovered element, send "a" to the back
				else return 1;                             // a is the hovered element, bring "a" to the front
			});
	}

	return d3.rebind(chart, dispatch, "on");
}