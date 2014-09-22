if(!d3.chart) d3.chart = {};

d3.chart.partiesInfographic = function() {

	var svg, wrects, scaleX;

	var dispatch = d3.dispatch("hover","selected");
	chart.on = dispatch.on;

	var partiesMap, parties, alliances;

	var width = $('#infoParties').width();
	var height =   $('.canvas').width() * 2;

	var margin = 4;

	function chart(container) {

		svg = container.append('svg').attr({ width : width, height : height })

		svg.append('g').attr('class','parties');
	}

	chart.update = function(){

		//console.log(deputyNodes);
		var totalDeputies =0;

		//parties = d3.entries(partiesMap).sort( function(a,b){ return b.value.center[1] - a.value.center[1];  })
		parties = d3.entries(partiesMap).sort( function(a,b){ return b.value.size - a.value.size;  })

		parties.forEach( function (party) {
			party.value.selected = party.value.size;
			totalDeputies += party.value.size;
		})
		
		scaleX = d3.scale.linear()
				.domain([0,totalDeputies])
				.range([ 0, height ]);

		setDefaultParties();
	}

	function setDefaultParties(){
			svg.selectAll('.alliances').remove()

			var y=0;
			parties.forEach( function(d){ d.y0 = y; y+=d.value.size; d.y=y;  })

			// create an element <g class='party'> for each party  
			var g = svg.select('.parties')
					.selectAll('.party')
					.data( parties, function(d){ return d.key})

			g.enter().append('g').attr({'class':'party', id: function(d){return d.key} })
			
			g.transition(1000)
				.attr("transform", function(d, i) { return "translate(15,"+scaleX(d.y0)+")"; })

			// the <g class='party'> have three children
				// rect - wrect - text

				// -------------------------------------
				// rect -> express the size of the party
				var rects = g.selectAll('rect.main')
					.data( function(d){ return [d] })
				// rect enter (new party)
				rects.enter().append('rect').attr({ opacity:0,'class':'main',});
				// rect transition 
				rects.transition(1000)
					.attr({
						x:/*15*/0,
						width:40,
						y: function(d){ return /*scaleX(d.y0)*/ margin} ,
						height: function(d){return scaleX(d.y) - scaleX(d.y0) -margin},
						cursor : 'pointer',
						//stroke: function(d){ return partyColor(d.key)},
						//'stroke-width': 2,
						opacity:1,
						stroke: 'none'
					})
					.style('fill',function(d){ return /*'lightgrey'*/ CONGRESS_DEFINE.getPartyColor(d.key)})

				// -------------------------------------
				// wrects to express the of proportion of un/selected deputies
				wrects = g.selectAll('rect.white')
					.data( function(d){ return [d] })
				// wrects enter (new party)
				wrects.enter().append('rect').attr({ opacity:0, 'class':'white'});
				// wrects transition 
				wrects
					.transition(1000)
					.attr({
						x:/*15*/0+2,
						width:40 -4,
						y: function(d){ return /*scaleX(d.y0)*/ margin +2} ,
						height : function(d){return scaleX(d.value.size - d.value.selected ) - 4 -margin},
						cursor : 'pointer',
						opacity:0.6
					})
					.style('fill','white');

				// ----------------------------------
				// text - party name 
				var fontSize=12;
				var texts = g.selectAll('text')
					.data( function(d){ return [d] })
				// new part 
				texts.enter().append('text')
					.attr({ opacity:0})
				// already existing party
				texts.transition()
					.text(function(d) { return ( (scaleX(d.y) - scaleX(d.y0)) > (fontSize+2) )? d.key : null; })
					.attr({
						x:40/2 /*+15*/,
						y: function(d){ return (scaleX(d.y) - scaleX(d.y0)) /2  +margin*2},
						'font-size': fontSize+'px',
						'text-anchor':'middle',
						cursor : 'pointer',
						opacity:1
					})
				//

			// delete parties without deputies in the viz
			g.exit().transition().remove();

			g
				.on('mouseover', function(d){ 
					var hoverParties = {};
					hoverParties[d.key]=true;
					dispatch.hover(hoverParties);

					tooltip.html(chart.renderPartyTooltip(d));
					return tooltip
						.style("visibility", "visible")
						.style("opacity", 1);
				})
				.on('mousemove',function(){
					return tooltip.style("top", (event.pageY - 10)+"px").style("left",(event.pageX + 25)+"px");
				})
				.on('mouseout', function(d){ 
					dispatch.hover(null);
					return tooltip.style("visibility", "hidden");
				})

				.on('click', function (d) {

						if (d3.event.shiftKey){
							// using the shiftKey deselect the state					
							//d3.select(this).classed('selected',false);
							
							//dispatch event of selected states
							dispatch.selected( [d.key], 'EXCLUDE')

						} else 
						if (d3.event.ctrlKey){
							// using the ctrlKey add state to selection
							//d3.select(this).classed('selected',true);
							
							//dispatch event of selected states
							dispatch.selected( [d.key], 'ADD')

						}
						else {
							// a left click without any key pressed -> select only the state (deselect others)
							g.selectAll('.party').each( function(i){ 
								//if(i.key == d.key) d3.select(this).classed('selected',true);
								//else d3.select(this).classed('selected',false);

							}) 

							//dispatch event of selected states
							dispatch.selected( [d.key],'SET')
						}
					
					tooltip.html(chart.renderPartyTooltip(d));
				})
	}

	chart.setSelectedDeputies = function(selectedDeputiesPerParty){
		if(selectedDeputiesPerParty == null){
			wrects.transition(1000)
				.attr({ height : 0 })
		} else {
			parties.forEach( function(d){ 
				if(selectedDeputiesPerParty[d.key] === undefined)
				{	 d.value.selected=0;}
				else d.value.selected = selectedDeputiesPerParty[d.key]
			})

			wrects.transition(1000)
				.attr({ 
					height : function(d){return scaleX(d.value.size - d.value.selected ) - 4 -margin}, 
					opacity: 0.6, 
				})
				.style('fill','white')
		}
	}

	chart.setAlliance = function(a_alliances){

		//console.log(JSON.stringify(alliances))
		if(a_alliances == null) { 
			svg.selectAll('g.alliances').remove(); 
			setDefaultParties();
		}
		else{
			alliances = [];
			// set argument to new alliances array
			a_alliances.forEach( function (alliance){ alliances.push(alliance)})

			alliances.forEach( function (alliance){
				alliance.size = 0;
				alliance.partiesObjs = [];
			})
			alliances.push( {name:'Non-Allied', parties:[], partiesObjs:[], size:0} );

			// push the parties and calc number of deputies to/of each respective alliance
			parties.forEach( function (partyObj){
				var nonAllied = true;
				alliances.forEach( function (alliance){
					
					alliance.parties.forEach( function (party){
						if (partyObj.key == party) {
							nonAllied = false;
							alliance.size += partyObj.value.size;
							alliance.partiesObjs.push(partyObj);
						};
					})
				})

				if(nonAllied){ 
					alliances[alliances.length-1].size += partyObj.value.size; 
					alliances[alliances.length-1].partiesObjs.push(partyObj);    
				}
			})

			// calc the Y position of each alliance
			var y=0;
			alliances.forEach( function(alliance,i){
				alliance.i = i;

				alliance.y0 = y; 
				y+=alliance.size; 
				alliance.y=y;  

				var party_y = alliance.y0;
				alliance.partiesObjs.forEach( function(party){ 
					party.y0 = party_y; 
					party_y+=party.value.size; 
					party.y=party_y;  
				})

			})

			var gAll = svg.insert('g','.parties').attr('class','alliances')
				.selectAll('g.alliance')
					.data(alliances)

			gAll.enter().insert('g').attr({'class':function(d){ return 'alliance id-'+d.i }})
			
			gAll.attr("transform", function(d, i) { return "translate(15,"+scaleX(d.y0)+")"; })


			rects = gAll.selectAll('rect')
				.data( function(d){ return [d] })
			
			rects.enter().append('rect')
				.attr({ opacity:0})
				.on('mouseover', function(d){ 

					var hoverParties = {};
					d.partiesObjs.forEach( function(party) { 
						hoverParties[party.key] = true;
					})

					dispatch.hover(hoverParties); 

					tooltip.html(chart.renderAllianceTooltip(d));
					return tooltip
						.style("visibility", "visible")
						.style("opacity", 1);
				})
				.on('mousemove', function(){
					return tooltip.style("top", (event.pageY - 10)+"px").style("left",(event.pageX + 25)+"px");
				})
				.on('mouseout', function(d){
					dispatch.hover(null); 
					return tooltip.style("visibility", "hidden");
				})
				.on('click', function(d){

					var selectedParties = [];
					d.partiesObjs.forEach( function(party) { 
						selectedParties.push(party.key);
					})

					if (d3.event.shiftKey){
							
							// using the shiftKey deselect the state					
							//d3.select(this).classed('selected',false);
							
							//dispatch event of selected states
							dispatch.selected( selectedParties, 'EXCLUDE')

						} else 
						if (d3.event.ctrlKey){
							// using the ctrlKey add state to selection
							//d3.select(this).classed('selected',true);
							
							//dispatch event of selected states
							dispatch.selected( selectedParties, 'ADD')

						} 
						else {
							// a left click without any key pressed -> select only the state (deselect others)
							//g.selectAll('.party').each( function(i){ 
								//if(i.key == d.key) d3.select(this).classed('selected',true);
								//else d3.select(this).classed('selected',false);

							//}) 

							//dispatch event of selected states
							dispatch.selected( selectedParties,'SET')
						}

					tooltip.html(chart.renderAllianceTooltip(d));
				})

			
			// Parties
			svg.select('.parties')
				.selectAll('.party')
				.data( parties, function(d){ return d.key})

			// MOVMENTS - queue of movments -
			var transition = svg.transition()
			
			// for each alliance make a separate movment
			alliances.forEach( function(alliance){
				if(alliance.size > 0){

					var rect = transition.select('.alliance.id-'+alliance.i+' rect')
						.attr({
								x:/*15*/50,
								width:80,
								y: function(d){ return /*scaleX(d.y0)*/ 1} ,
								height: function(d){return ( (scaleX(d.y) - scaleX(d.y0) -1) > 1 )? (scaleX(d.y) - scaleX(d.y0) -1): 2 },
								cursor : 'pointer',
								//stroke: function(d){ return partyColor(d.key)},
								//'stroke-width': 2,
								opacity:1
						})
						.style('fill', function(d){ return /*'lightgrey'*/ CONGRESS_DEFINE.getPartyColor(d.parties[0])})
					transition = transition.transition()

					// for each party make a separate movment
					alliance.partiesObjs.forEach( function(party){

						transition.select('.party#'+party.key)
							.attr("transform", function(d, i) { return "translate(70,"+scaleX(d.y0)+")"; })
							.selectAll('rect.main')
								.style('fill', function(d){ return CONGRESS_DEFINE.getPartyColor(party.key)} )
								.attr('stroke', function(d){ return 'black'} )
								.attr('stroke-width', function(d){ return 0.5} )

						transition = transition.transition()
					})


					transition = transition.transition()
				}

			})

		}
	}

	chart.setRollCallRates = function(rollCalls){

		parties.forEach( function(d){
			d.value.votes = {"Sim":0,"Não":0,"Abstenção":0,"Obstrução":0,"Art. 17":0,"null":0}
		})

		rollCalls.forEach(function(rollCall){
			rollCall.rollCall.votes.forEach( function (vote){
				if(partiesMap[vote.party] != undefined)
					partiesMap[vote.party].votes[vote.vote]++
			})
		})

		parties.forEach( function(d){
			if( (d.value.votes['Sim']==0) && (d.value.votes['Não']==0) ) {d.rate = 'noVotes'}
			else{
				var total = d.value.votes['Não'] + d.value.votes['Sim'];
				d.rate = (d.value.votes['Sim']-d.value.votes['Não'])/total;
			}
		})

		svg.selectAll('.party rect.main')
			.style('fill', function(party){ 	
				return (party.rate == 'noVotes')? 'lightgrey' : CONGRESS_DEFINE.votingColor(party.rate);
			})


		// alliances
		if( ! svg.selectAll('.alliances').empty() ){
			alliances.forEach(function(alliance){

				alliance.votes = {"Sim":0,"Não":0,"Abstenção":0,"Obstrução":0,"Art. 17":0,"null":0};

				alliance.partiesObjs.forEach(function(party){

					$.each(party.value.votes, function(vote,count){
						alliance.votes[vote] += count;
					})

				})

				if( (alliance.votes['Sim']==0) && (alliance.votes['Não']==0) ) 
					{d.rate = 'noVotes'}
				else{
					var total = alliance.votes['Não'] + alliance.votes['Sim'];
					alliance.rate = (alliance.votes['Sim']-alliance.votes['Não'])/total;
				}

				svg.selectAll('.alliance rect')
					.style('fill', function(alliance){ 	
						return (alliance.rate == 'noVotes')? 'lightgrey' : CONGRESS_DEFINE.votingColor(alliance.rate);
					})
			})


		}
		
		
	}

	chart.resetRollCallRates = function(){
		parties.forEach( function(d){
			parties.rate = null;
		})

		if( ! svg.selectAll('.alliances').empty() ){
			svg.selectAll('.alliance rect')
				.style('fill', function(alliance){ 	
					return CONGRESS_DEFINE.getPartyColor(alliance.parties[0])
				})
		} 

		svg.selectAll('.party rect.main')
			.style('fill', function(party){ 	
				return CONGRESS_DEFINE.getPartyColor(party.key)
		})
	}

	chart.data = function(value){
		if(!arguments.length) return data;
		partiesMap = value;
		return chart;
	}

	chart.renderPartyTooltip = function(party){
		var selectedRate =
			(party.value.selected == party.value.size)?
				party.value.size+' Deputies'
				:
				(((party.value.selected/party.value.size)*100).toFixed(1) +"% selected ("+ party.value.selected +'/'+party.value.size)+')';

		return party.key+"<br/><em>"+ selectedRate +"</em><br/><em>Click to select</em>"
	}

	chart.renderAllianceTooltip = function(alliance){
		var html = '';
		var selected = 0;

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