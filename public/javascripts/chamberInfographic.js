

if(!d3.chart) d3.chart = {};

d3.chart.chamberInfographic = function() {

	var partyBandWidth = 30;

	var chamberInfographic;

	var dispatch = d3.dispatch('update');
	chart.on = dispatch.on;
	var _dimensions;

	var deputies, alliances = null;
	var partiesMap, parties;

	// @param dimensions : {x: , y: , width: , height: }
	function chart(svgContainer, dimensions) {
		_dimensions = dimensions;
		chamberInfographic = svgContainer.append('g').attr('transform', 'translate(' + (dimensions.x) + ',' + dimensions.y + ')')
	
		chamberInfographic.append('g').attr('class','deputies')
		chamberInfographic.append('g').attr('class','parties')
	}

	chart.data = function(deputyNodes){
		if(!arguments.length) return deputies;
		deputies = deputyNodes;
		return chart;
	}

	chart.parties = function(a_parties){
		if(!arguments.length) return parties;
		partiesMap = a_parties;
		return chart;
	}

	chart.setAlliances = function(electoralAlliances){
		if(!arguments.length) return alliances;
		alliances = electoralAlliances;
		return chart;
	}

	chart.update = function(){

		parties = d3.entries(partiesMap).sort( function(a,b){
			return (b.value.center[1]+1) - (a.value.center[1]+1);  
		})
		parties.forEach(function(d,i){ partiesMap[d.key].rank = i });

		if(alliances !== null){
			calcAlliance(alliances);
			parties.sort(function(a,b){
				return (a.value.allianceRank != b.value.allianceRank)? 
					a.value.allianceRank - b.value.allianceRank
					:
					(b.value.center[1]+1) - (a.value.center[1]+1);  
			})
		}


		deputyNodes.sort( function(a,b){ 
			if(alliances !== null){
				if(partiesMap[a.party].allianceRank != partiesMap[b.party].allianceRank) 
					 return partiesMap[a.party].allianceRank - partiesMap[b.party].allianceRank;
				else return (a.party != b.party)? 
							(partiesMap[a.party].rank - partiesMap[b.party].rank) 
							: 
							( (b.scatterplot[1]+1) - (a.scatterplot[1]+1) ); 
			}
			else {
				if(partiesMap[a.party] == undefined) console.log(a.party)
				return (a.party != b.party)? 
						(partiesMap[a.party].rank - partiesMap[b.party].rank) 
						: 
						( (b.scatterplot[1]+1) - (a.scatterplot[1]+1) ); 
			}
		})

		updateDeputies();
		updateParties();
	}

	function calcAlliance(a_alliances){
		alliances = [];
		// set argument to new alliances array
		a_alliances.forEach( function (alliance){ alliances.push(alliance)})

		alliances.forEach( function (alliance){
			alliance.size = 0;
			alliance.center =0;
			alliance.partiesObjs = [];
		})
		//alliances.push( {name:'Non-Allied', parties:[], partiesObjs:[], size:0} );

		// push the parties and calc number of deputies to/of each respective alliance
		parties.forEach( function (partyObj){
			var nonAllied = true;
			alliances.forEach( function (alliance){
				
				alliance.parties.forEach( function (party){
					if (partyObj.key == party) {
						nonAllied = false;
						alliance.size += partyObj.value.size;
						alliance.center += partyObj.value.center[1] *partyObj.value.size;
						alliance.partiesObjs.push(partyObj);
					};
				})
			})

			if(nonAllied){ 
				alliances.push({
					name: partyObj.key, 
					parties:[partyObj.key], 
					partiesObjs:[partyObj], 
					center:partyObj.value.center[1] * partyObj.value.size, 
					size:partyObj.value.size
				})

				// alliances[alliances.length-1].size += partyObj.value.size; 
				// alliances[alliances.length-1].center += partyObj.value.center[1] * partyObj.value.size;
				// alliances[alliances.length-1].partiesObjs.push(partyObj);    
			}
		})
		// calc the average center 
		alliances.forEach( function (alliance){
			alliance.center /= alliance.size;
		})
		// sort by the center
		alliances.sort( function (a,b) {
			return (b.center+1) - (a.center+1);
		})
		// set the rank
		alliances.forEach( function (alliance,i){
			// alliance.rank = i;
			alliance.partiesObjs.forEach( function (party){
				//party.allianceRank = i;
				partiesMap[party.key].allianceRank = i;
			})
		})
	}

	function updateDeputies(){

		var circlePerAngle = 9;
		function calcAngle(i){return Math.floor(i / circlePerAngle) / Math.floor( (deputyNodes.length - 1) / circlePerAngle) * Math.PI; }

		var circles = chamberInfographic
						.select('.deputies')
						.attr('transform', 'translate(' + (partyBandWidth+4) + ',' + (_dimensions.height/2 -_dimensions.width) + ')')
						.selectAll('circle')
						.data(deputyNodes, function(d){ return d.deputyID})
			
		circles.enter().append('circle')
			.on("mouseover", mouseoverDeputy)
			.on("mousemove", mousemoveDeputy)
			.on("mouseout", mouseoutDeputy)
			.on("click", mouseClickDeputy)
				
		circles.exit().transition().remove();

		circles.transition(2000)
				.attr({
					cy: function(d,i){ return _dimensions.width- (_dimensions.width-7 - i % circlePerAngle * radius*2.3) * Math.cos(calcAngle(i)); },
					cx: function(d,i){ return _dimensions.width - (_dimensions.width-7 - i % circlePerAngle * radius*2.3) * Math.sin(calcAngle(i)); },
					r:  function(d){ return (d.hovered)? radiusHover : radius },
					fill: function(d){ 
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
					},
					class: function(d) { return (d.selected)? "node selected": ( (d.hovered)? "node hovered" : "node"); } ,
					id: function(d) { return "deputy-" + d.deputyID; }
				})	
	}

	function updateParties(){
		var arc = d3.svg.arc()
			.outerRadius(_dimensions.width+partyBandWidth)
			.innerRadius(_dimensions.width);

		var innerArc = d3.svg.arc()
			.outerRadius(_dimensions.width+partyBandWidth-2)
			.innerRadius(_dimensions.width+2);

		var pie = d3.layout.pie()
			.sort(null)
			.value(function(d) { return d.value.size; })
			.startAngle(Math.PI *2 +0.02)
			.endAngle( Math.PI -0.02);

		var arcs = chamberInfographic
					.select('.parties')
					.attr("transform", "translate(" + (_dimensions.width+partyBandWidth+4) +"," + (_dimensions.height/2)  + ")")
					.selectAll(".arc")
					.data(pie(parties), function(d){return d.data.key})
			
		var enterArcs =
			arcs.enter().append("g")
				.attr("class", "arc")
				.attr( { 
					id: function(d){return d.data.key},
					cursor : 'pointer'
				})
				.on("mouseover", mouseoverParty)
				.on("mousemove", mousemoveParty)
				.on("mouseout", mouseoutParty)
				.on("click", clickParty);	
				
		var paths = arcs.selectAll('path.main')
						.data( function(d){ return [d] });

		paths.enter().append('path').attr('class','main')
		
		paths.transition()
			.attr("d", arc)
			.style("fill", function(d) { 
				if(d.data.value.rate != null){
					if (d.data.value.rate == "noVotes")
						return 'grey' 
					else return CONGRESS_DEFINE.votingColor(d.data.value.rate)
				} else{ 
					return CONGRESS_DEFINE.getPartyColor(d.data.key)
				}
			});


		var innerPaths = arcs.selectAll('path.inner')
						.data( function(d){ return [d] });
		innerPaths.enter().append('path').attr('class','inner')
		
		innerPaths.transition()
			.attr("d", function(d){ 
				var newD = {
					startAngle: d.startAngle - ( (d.startAngle - d.endAngle) * (d.data.value.selected/d.data.value.size) +0.01 ),
					endAngle: (d.endAngle +0.01)
				};
				return innerArc(newD);
			})
			.attr("opacity", 0.8 )
			.attr('visibility', function (d) {	return ( (d.data.value.selected/d.data.value.size)!=1 )? 'visible' : 'hidden';  })
			.style("fill", 'white')
			

		var texts = arcs.selectAll('text')
						.data( function(d){ return [d] });

		texts.enter().append('text')

		texts.transition()
			.attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
			.attr("dy", ".35em")
			.style("text-anchor", "middle")
			.text(function(d) { return (d.data.value.size > 10 )? d.data.key : ''; });

		arcs.exit().remove()
	}



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
		dispatch.update();
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
			deputies.forEach(function (deputy) { deputy.selected = false; })
			d.selected = true;
		}	

		// update vis
		dispatch.update();	
	}

	function mouseoverParty(d){ 
		d = d.data;
		
		deputies.forEach( function (deputy){
			if(deputy.party == d.key) deputy.hovered = true;
		})

		// update vis
		dispatch.update()
		// update tooltip
		tooltip.html(renderPartyTooltip(d));
		return tooltip
			.style("visibility", "visible")
			.style("opacity", 1);
	}
				
	function mousemoveParty(){
		return tooltip.style("top", (event.pageY - 10)+"px").style("left",(event.pageX + 25)+"px");
	}
	
	function mouseoutParty(d){ 
		d = d.data;

		deputies.forEach( function (deputy){
			deputy.hovered = false;
		})

		// update vis
		dispatch.update()
		// update tooltip
		return tooltip.style("visibility", "hidden");
	}

	function clickParty (d) {
		d = d.data;
		if (d3.event.shiftKey){	
			// using the shiftKey deselect all deputies of party				
			deputies.forEach( function (deputy){
				if(deputy.party == d.key) deputy.selected = false;
			}) 
			d.value.selected = d.value.size;

		} else 
		if (d3.event.ctrlKey){
			// using the ctrlKey select all deputies of the party
			deputies.forEach( function (deputy){
				if(deputy.party == d.key) deputy.selected = true;
			}) 
			d.value.selected = 0;
		} 
		else {
			// a left click without any key pressed -> select only the party (deselect others)
			deputies.forEach(function (deputy) { deputy.selected = (deputy.party == d.key)? true : false; })
			d.value.selected = d.value.size;
		}		
		// update vis
		dispatch.update()
		// update tooltip
		tooltip.html(renderPartyTooltip(d));		
	}

	function renderPartyTooltip (party){
		var selectedRate =
			(party.value.selected == party.value.size)?
				party.value.size+' Deputies'
				:
				(((party.value.selected/party.value.size)*100).toFixed(1) +"% selected ("+ party.value.selected +'/'+party.value.size)+')';

		return party.key+"<br/><em>"+ selectedRate +"</em><br/><em>Click to select</em>"
	}

	return d3.rebind(chart, dispatch, "on");
}