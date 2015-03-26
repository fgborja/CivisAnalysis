

if(!d3.chart) d3.chart = {};

d3.chart.chamberInfographic = function() {

	var partyBandWidth = 30;

	var chamberInfographic;

	var dispatch = d3.dispatch('update');
	chart.on = dispatch.on;
	var _dimensions;

	var sortByAlliance = true;

	var deputies, alliances = null;
	var partiesMap, parties;

	var baseWidth,radiusWidth;

	// @param dimensions : {x: , y: , width: , height: }
	function chart(svgContainer, dimensions) {
		_dimensions = dimensions;
		baseWidth = (_dimensions.direction=='horizontal')? _dimensions.width : _dimensions.height;
		radiusWidth = (_dimensions.direction=='horizontal')? _dimensions.height : _dimensions.width;

		chamberInfographic = svgContainer.append('g').attr({id:'chamber','transform':'translate(' + (dimensions.x) + ',' + dimensions.y + ')'})
	
		chamberInfographic.append('g').attr('class','deputies')
		chamberInfographic.append('g').attr('class','parties')
		chamberInfographic.append('g').attr('class','alliances')
	}

	chart.data = function(deputyNodes){
		if(!arguments.length) return deputies;
		deputies = deputyNodes;
		return chart;
	}

	chart.sortByAlliance = function(value){
		if(!arguments.length) return sortByAlliance;
		sortByAlliance = value;
		return chart;
	}

	chart.parties = function(a_parties){
		if(!arguments.length) return parties;
		partiesMap = a_parties;
		return chart;
	}

	chart.setAlliances = function(electoralAlliances){
		if(!arguments.length) return alliances;
		alliances = (electoralAlliances !== null)? electoralAlliances.alliances : null;
		return chart;
	}

	chart.update = function(){

		parties = d3.entries(partiesMap).sort( function(a,b){
			return (b.value.center[1]+1) - (a.value.center[1]+1);  
		})
		parties.forEach(function(d,i){ partiesMap[d.key].rank = i });

		if(sortByAlliance && (alliances !== null)){
			calcAlliance(alliances);
			parties.sort(function(a,b){
				return (a.value.allianceRank != b.value.allianceRank)? 
					a.value.allianceRank - b.value.allianceRank
					:
					(b.value.center[1]+1) - (a.value.center[1]+1);  
			})
		}


		deputyNodes.sort( function(a,b){ 
			if( sortByAlliance && (alliances !== null)){
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

		if(alliances !== null)
			updateAlliance();
		else chamberInfographic.selectAll('.alliances g').remove();
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
						.attr('transform', 'translate(' + (partyBandWidth+4) + ',' + (baseWidth/2 -radiusWidth) + ')')
						.selectAll('circle')
						.data(deputyNodes, function(d){ return d.deputyID})
			
		circles.enter().append('circle')
			.on("mouseover", mouseoverDeputy)
			.on("mouseout", mouseoutDeputy)
			.on("click", mouseClickDeputy)
			.attr({
				r:0,
				id: function(d) { return "deputy-" + d.deputyID; }
			})
				
		circles.exit().transition().attr('r',0).remove();

		var calcAngleX = (_dimensions.direction=='horizontal')? Math.sin : Math.cos;
		var calcAngleY = (_dimensions.direction=='horizontal')? Math.cos : Math.sin;

		circles.transition().delay(100).duration(1000)
				.attr({
					cy: function(d,i){ return radiusWidth- (radiusWidth-7 - i % circlePerAngle * radius*2.3) * calcAngleX(calcAngle(i)); },
					cx: function(d,i){ return radiusWidth - (radiusWidth-7 - i % circlePerAngle * radius*2.3) * calcAngleY(calcAngle(i)); },
					class: function(d) { return (d.selected)? "node selected": ( (d.hovered)? "node hovered" : "node"); }	
				})
				.attr( popoverAttr(deputiesPopover) );

		
		circles
			.attr({r:  function(d){ return (d.hovered)? radiusHover : radius }})
			.style('fill',function(d){ 
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
			})

		$('#chamber .deputies circle.node').popover({ trigger: "hover" });
		function deputiesPopover(d){ return d.name +' ('+d.party+'-'+d.district+")<br /><em>Click to select</em>"; };

		circles.order(); // sort elements in the svg
	}

	function updateParties(){

		var arc = d3.svg.arc()
			.outerRadius(radiusWidth+partyBandWidth)
			.innerRadius(radiusWidth);

		var innerArc = d3.svg.arc()
			.outerRadius(radiusWidth+partyBandWidth-2)
			.innerRadius(radiusWidth+2);

		var pie = d3.layout.pie()
			.sort(null)
			.value(function(d) { return d.value.size; })
			.startAngle((_dimensions.direction=='horizontal')? (-Math.PI/2 -0.01): (Math.PI *2 +0.02)  )
			.endAngle( (_dimensions.direction=='horizontal')? (Math.PI/2 +0.01): (Math.PI -0.02) );

		var arcs = chamberInfographic
					.select('.parties')
					.attr("transform", "translate(" + (radiusWidth+partyBandWidth+4) +"," + (baseWidth/2)  + ")")
					.selectAll(".arc")
					.data(pie(parties), function(d){return d.data.key})
			
		arcs.enter().append("g")
			.attr("class", "arc")
			.attr( { 
				id: function(d){return d.data.key},
				cursor : 'pointer'
			})
			.on("mouseover", mouseoverParty)
			.on("mouseout", mouseoutParty)
			.on("click", clickParty)
			.attr( popoverAttr(renderPartyTooltip));

		arcs.exit().remove()

		$('#chamber .parties .arc').popover({ trigger: "hover" });

		var paths = arcs.selectAll('path.main')
						.data( function(d){ return [d] });

		paths.enter().append('path').attr('class','main')
		
		paths.transition().delay(100).duration(1000)
			.attr("d", arc)
			
		paths.style("fill", function(d) { 
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
		
		innerPaths.transition().delay(100).duration(1000)
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
			.attr("dy", ".35em")
			.style("text-anchor", "middle")
			.style("font-size", "11px")
			.text(function(d) { return (d.data.value.size > 10 )? d.data.key : ''; });

		texts.transition().delay(100).duration(1000)
			.attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; });
	};

	function updateAlliance (){

		var arc = d3.svg.arc()
			.outerRadius(radiusWidth+partyBandWidth+15)
			.innerRadius(radiusWidth+partyBandWidth+5);

		var pie = d3.layout.pie()
			.sort(null)
			.value(function(d) { return d.size; })
			.startAngle((_dimensions.direction=='horizontal')? (-Math.PI/2 -0.01): (Math.PI *2 +0.02)  )
			.endAngle( (_dimensions.direction=='horizontal')? (Math.PI/2 +0.02): (Math.PI -0.02) );

		var arcs = chamberInfographic
					.select('.alliances')
					.attr("transform", "translate(" + (radiusWidth+partyBandWidth+4) +"," + (baseWidth/2)  + ")")
					.selectAll(".arc")
					.data(pie(alliances), function(d,i){return i});

		var enterArcs =
			arcs.enter().append("g")
				.attr("class", "arc")
				.attr( { 
					cursor : 'pointer'
				})
				.on(allianceInteractions())
				.attr(popoverAttr(renderAllianceTooltip))
		$('#chamber .alliances .arc').popover({ trigger: "hover" });
				
		var paths = arcs.selectAll('path.main')
						.data( function(d){ return [d] });

		paths.enter().append('path').attr('class','main')
		
		paths.transition().delay(100).duration(1000)
			.attr("d", arc)
			.style("fill", function(d) { if(d.data.partiesObjs[0]) return CONGRESS_DEFINE.getPartyColor(d.data.partiesObjs[0].key) })
			.attr('visibility', function(d){ return (d.data.partiesObjs.length>1)? 'visible': 'hidden'; })

	};

	// mouse OVER circle deputy
	function mouseoverDeputy(d) {
		d.hovered = true;
		dispatch.update();
	};	

	// mouse OUT circle deputy
	function mouseoutDeputy(d){ 
		d.hovered = false;
		dispatch.update();
	}

	function mouseClickDeputy(d){
		d3.event.preventDefault();

		if (d3.event.shiftKey){	
			// using the shiftKey deselect the deputy				
			d.selected = false;
		} else 
		if (d3.event.ctrlKey || d3.event.metaKey){
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
		// update popover
		d3.select(this).attr( popoverAttr(renderPartyTooltip));
		// update vis
		dispatch.update()
	}	
	
	function mouseoutParty(d){ 
		d = d.data;

		deputies.forEach( function (deputy){
			deputy.hovered = false;
		})

		// update vis
		dispatch.update()
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
		if (d3.event.ctrlKey || d3.event.metaKey){
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
		// update popover
		d3.select(this).attr( popoverAttr(renderPartyTooltip));
		$(this).popover("show");
	}

	function renderPartyTooltip (party){
		party = party.data;
		var selectedRate =
			(party.value.selected == party.value.size)?
				party.value.size+' Deputies'
				:
				(((party.value.selected/party.value.size)*100).toFixed(1) +"% selected ("+ party.value.selected +'/'+party.value.size)+')';

		return party.key+"<br/><em>"+ selectedRate +"</em><br/><em>Click to select</em>"
	}

	function allianceInteractions(){
		var interactions = {
			mouseover: function(d){ 
				var hoverParties = {};
				d.data.partiesObjs.forEach( function(party) { 
					hoverParties[party.key] = true;
				})

				deputies.map(function(d){ 
					d.hovered = (hoverParties[d.party] !== undefined)? true : false;
				})	

				dispatch.update();

				// update popover
				d3.select(this).attr( popoverAttr(renderAllianceTooltip));
			},
			mouseout: function(d){
				deputies.map(function(d){ 
					d.hovered = false;
				})	 
				dispatch.update();
			},
			click: function(d){
					var selectedParties = {};
					d.data.partiesObjs.forEach( function(party) { 
						selectedParties[party.key] = true;
					})

					if (d3.event.shiftKey){ // EXCLUDE
						deputies.map(function(d){ 
							d.selected = (selectedParties[d.party] !== undefined)? false : d.selected;
						})	
					} else 
					if (d3.event.ctrlKey || d3.event.metaKey){
						deputies.map(function(d){ 
							d.selected = (selectedParties[d.party] !== undefined)? true : d.selected;
						})	
					} 
					else {
						deputies.map(function(d){ 
							d.selected = (selectedParties[d.party] !== undefined)? true : false;
						})	
					}

				dispatch.update();
				// update popover
				d3.select(this).attr( popoverAttr(renderAllianceTooltip));
				$(this).popover("show");
			}
		}

		return interactions;
	}

	function renderAllianceTooltip (d){
		var html = '';
		var selected = 0;
		var alliance = d.data;

		alliance.partiesObjs.forEach( function (party){
			var selectedRate = 
				(party.value.selected == party.value.size)?
					party.value.size
					:
					party.value.selected +'/'+party.value.size;

			html += "<em>"+party.key+"("+ selectedRate +") : </em> "
			//: "+((party.value.selected/party.value.total)*100).toFixed(1) +"% selected ("+ party.value.selected +'/'+party.value.total +")
			selected += party.value.selected;
		})

		var selectedRate = (selected==alliance.size)? (alliance.size+' Deputies') :selected+'/'+alliance.size;
		return  alliance.name+' ('+selectedRate+")<br/>"+html+'<br/><em>'+ 'Click to select</em>';
	}

	return d3.rebind(chart, dispatch, "on");
}