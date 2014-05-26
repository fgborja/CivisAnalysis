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
	var dispatch = d3.dispatch(chart, "hover");

	var colWidth = $('.col-xs-4').width() -30;

	function chart(container) {
		svg = container.append("svg")
	}

	chart.update = update;
	function update() {
		

		svg.selectAll(".link").remove()
		svg.selectAll(".node.deputy.graph").remove()

		createNodeAndLinks();

		svg
			.attr('width', colWidth  )
			.attr('height', colWidth )

		force = d3.layout.force()
		.size([colWidth, colWidth])
		.nodes(nodes)
		.charge(-20)
		.gravity(0.35)
		.links(links)
		.on("tick", tick)

		force.start();

		link = svg.selectAll(".link")
			.data(force.links())
			.enter().append("line")
			.attr("class", "link")
			//.attr('total',function(d){ d.total })

		node = svg.selectAll(".node.deputy.graph")
			.data(force.nodes())
			.enter().append("circle")
				.attr("class", "node deputy graph selected")
				.attr("r", radius)
				.style("fill", function(d) { return partyColor(d.record.party); })
				.attr("id", function (d) { return "deputy-g-"+ d.record.phonebookID; })
				//.on('click', function(d){ console.log(d.record) })
				//.call(force.drag);


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
			.on("mouseout", mouseoutDeputy);

			
		// mouse OVER circle deputy
		function mouseoverDeputy(d) {
			$("#deputy-g-"+d.record.phonebookID).attr("r",8)
			$("#deputy-s-"+d.record.phonebookID).attr("r",8)
	
			d3.selectAll(".node.rollCall")
				//.transition()
				.style("fill", "darkgrey");

			rollCallNodes.forEach( function(rollCallNode,index){ 
					if(rollCallNode.rollCall.votos != undefined){
						rollCallNode.rollCall.votos.Deputado.forEach( function(vote){

							if (vote.phonebookID == d.record.phonebookID) {
								d3.selectAll("#rollCall-"+index)
									//.transition()
									.style("fill",votoStringToColor[vote.Voto]);
							};
						})
					}
			});

			tooltip.html(d.record.name +' ('+d.record.party+')'+"<br /><em>Click to highlight</em>");
			return tooltip.style("visibility", "visible");
		}	

		// mouse MOVE circle deputy
		function mousemoveDeputy() { return tooltip.style("top", (event.pageY - 10)+"px").style("left",(event.pageX + 10)+"px");}

		// mouse OUT circle deputy
		function mouseoutDeputy(d){ 
				$("#deputy-g-"+d.record.phonebookID).attr("r",4);
				$("#deputy-s-"+d.record.phonebookID).attr("r",4);
				
				d3.selectAll(".node.rollCall")
					//.transition()
					.style("fill", votingColor(d.rate));
				return tooltip.style("visibility", "hidden");
		}


		$('#slider').slider().on("slide", function(ev) {	
				threshold = ev.value;
				$('#thresh').html(ev.value +'% ');
				links = filtered(ev.value);
				force.links(links);		
				
				link = svg.selectAll(".link")
					.data(force.links());

				node = svg.selectAll(".node")
					.data(force.nodes());

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

	return d3.rebind(chart, dispatch, "on");
}