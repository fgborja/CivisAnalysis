/*global d3 tooltip*/
var tooltip = d3.select("body")
	.append("div")
	.style("visibility", "hidden")
	.style("opacity", 0)
	.attr("class", "d3tooltip");

// div of selection
$('div.selected').css('visibility','hidden');

// collection of motions  => { "type+number+year":{ rollCalls:{}, details:{} },...}
var motions = {};  	

// array of all rollCalls sorted by date
var arrayRollCalls = [];			

//var ideCadastroCollection = {};   	// collection of ideCadastro => { ideCadastro: [ Object deputyDetails ], ... }

// MongoDB verson
//var phonebook = Phonebook();		// module to index deputy names 
//var chamberOfDeputies = $.chamberOfDeputiesDataWrapper(motions, arrayRollCalls, phonebook);

var phonebook = {
			getDeputyObj  : function(deputyID){ return this.arrayDeputies[deputyID]; },
			arrayDeputies : []
		};

var chamberOfDeputies = $.chamberOfDeputiesDataWrapperMin(motions, arrayRollCalls, phonebook.arrayDeputies, function(){
	timeline
		.data(arrayRollCalls)
		.update();

	$('#main').animate({height: 0},1000,function(){ $('#main').hide()})
});

// ======================================================================================================================
// LAUNCH APP ===========================================================================================================
	
	// deputies and rollCalls found in the date range 
	var rollCallInTheDateRange =[];
	var deputiesInTheDateRange ={};

	// deputies and rollCalls selected(filtered) to plot 
	var deputyNodes =[];
	var rollCallNodes =[];

	// =====================================================================================
	// Deputies Scatterplot ----------------------------------------------------------------
	//
	// init
		var deputiesScatterplot 	= d3.chart.deputiesScatterplot();
		// set html container
		deputiesScatterplot(d3.select('#canvasDeputies'));
	//
	// interactions
		deputiesScatterplot
			// when a set of deputies is selected
			.on('selected', function(deputies){
				//console.log('deputiesScatterplot.on(selected) ')
				if(deputies.length == deputyNodes.length)
					$('div.deputies.selected').css('visibility','hidden');
					else $('div.deputies.selected').css('visibility','visible');

				// select the set of deputies in the graph
				deputiesGraph.selectDeputies(deputies);

				// set the agreement rate for each RollCall
				calcRollCallRate(rollCallInTheDateRange,deputies);
				rollCallsScatterplot.setDeputyVotingRate();

				calcDeputyPerState(deputies, brazilianStates.getStates())
				// TODO? display the distribution of the selected ( state-> unselecting all states)
				brazilianStates.selectedDeputies();
				
				// parties plot!
				partiesInfographic.setSelectedDeputies( calcDeputyPerParty(deputies));
			})

			// when an deputy element is hovered 
			// @param deputy 		: deputy Object  
			// @param mouseover 	: boolean  => true if mouseover : false if mouseout
			.on('hover', function(deputy, mouseover){
				if(deputy!=null){
					// highlight the state of the deputy
					brazilianStates.highlightDeputyState( deputy.district , mouseover );
					// highlight the votes of the deputy in each roll call
					rollCallsScatterplot.highlightDeputyVotes( deputy.deputyID , mouseover );
					// highlight the deputy in the graph
					deputiesGraph.highlightDeputy( deputy.deputyID , mouseover );
				} 
			})
	// =====================================================================================



	// =====================================================================================
	// RollCalls Scatterplot ---------------------------------------------------------------
	//
	//
	// init
		var rollCallsScatterplot 	= d3.chart.rollCallsScatterplot();
		// set html container
		rollCallsScatterplot(d3.select('#canvasRollCalls'));
	//
	// interactions
		rollCallsScatterplot
			.on('selected', function (selectedRollCalls){
							
				if(selectedRollCalls.length == rollCallNodes.length) {
					// ALL RollCalls selected - reset roll call rates
					$('div.rollCalls.selected').css('visibility','hidden');
					deputyNodes.forEach(function (deputy) { deputy.rate = null;	})

					deputiesScatterplot.update();
					deputiesGraph.resetRollCallRates();
					brazilianStates.resetRollCallRates();
					partiesInfographic.resetRollCallRates();
				}
				else {			
					$('div.rollCalls.selected').css('visibility','visible');
					calcDeputyNodesRates(selectedRollCalls)

					deputiesScatterplot.update();
					deputiesGraph.setRollCallVotingRate();

					calcStatesRates(selectedRollCalls, brazilianStates.getStates() )
					//calcStatesRates(selectedRollCalls, deputiesScatterplot.getSelectedDeputies() )
					brazilianStates.setRollCallRates();
					partiesInfographic.setRollCallRates(selectedRollCalls);
				}
			})

			.on('hover', function(rollCall){
				if(rollCall!=null){
						 calcStatesRates([rollCall], brazilianStates.getStates() ); 

						// highlight the rates of the rollCall in the states
						brazilianStates.highlightRollCall( rollCall );
						// highlight the votes of deputies
						deputiesGraph.highlightRollCall( rollCall );
						// highlight the votes of deputies
						deputiesScatterplot.highlightRollCall( rollCall );
						// highlight the votes of parties
						partiesInfographic.setRollCallRates([rollCall]);
				} else {
					// reset rollCallsScatterplot
					rollCallsScatterplot.dispatchSelected();
				}
			})
	// ====================================================================================


	// ====================================================================================
	// Deputies Graph   -------------------------------------------------------------------
	//
	// init
		var deputiesGraph = d3.chart.deputiesGraph();
		deputiesGraph(d3.select('#canvasGraph'));
	//
	// interactions
		deputiesGraph
			// when an deputy element is hovered 
			// @param deputy 		: deputy Object  
			// @param mouseover 	: boolean  => true if mouseover : false if mouseout
			.on('hover', function(deputy, mouseover){
				if(deputy!=null){
					// highlight the state of the deputy
					brazilianStates.highlightDeputyState( deputy.district , mouseover );
					// highlight the votes of the deputy in each roll call
					rollCallsScatterplot.highlightDeputyVotes( deputy.deputyID , mouseover );
					// highlight the deputy in the graph
					deputiesScatterplot.highlightDeputy( deputy.deputyID , mouseover );
				} 
			})
			.on('select', function(operation,deputiesIDs){
				deputiesScatterplot.selectDeputies(operation,deputiesIDs);
			})
	// ====================================================================================



	// ====================================================================================
	// RollCalls timeline -----------------------------------------------------------------
	//
	// init
		var timeline = d3.chart.timeline();
		timeline(d3.select('#timeline'), $('#timeline').width(), 500);
	//
	// interactions
		timeline
			// Set new range of dates!
			.on("timelineFilter", function(filtered) { 

				$('#main').show().animate({height: 470},1000)
				console.log("filtered", filtered);

				//$('#loading').css('visibility','visible');
				$('div.selected').css('visibility','hidden');

				setNewDateRange(filtered, 
					function(){
						// reset rates
						deputyNodes.forEach( function(deputy) { deputy.rate = null; })

						// set the data to all visualizations
						// ...
						deputiesScatterplot
							.data(deputyNodes) // set deputy data
							.update(null)  // plot
						
						rollCallsScatterplot
							.data(rollCallNodes) 	// set rollcall data
							.update(null);			// plot

						// deputiesGraph
						// 	.data(tableDepXRollCall) // set tableDepXRollCall data
						// 	.update(null); // plot

						partiesInfographic
							.data( calcPartiesSizeAndCenter( deputyNodes ))
							.update(null);

						
						calcDeputyPerState(null, brazilianStates.getStates())
						brazilianStates.resetRollCallRates();
						brazilianStates.selectAllStates();
					}
				);
			})
			// Set the alliance!
			.on("setAlliances", function(alliances) { 

				// SET THE PARTIES COLORS ACORDING TO EACH ALLIANCE
					if(alliances==null) CONGRESS_DEFINE.getPartyColor = CONGRESS_DEFINE.getConstantPartyColor;
					else {
						var partiesColigationColor = {};
						$.each(alliances, function(i){
							$.each(alliances[i].parties, function(party){ return partiesColigationColor[alliances[i].parties[party]]= CONGRESS_DEFINE.getPartyColor( alliances[i].parties[0] )  })
						});
						CONGRESS_DEFINE.getPartyColor = function(party){ 
							if(partiesColigationColor[party] !== undefined ) 
								{return partiesColigationColor[party];}
							else{ /*console.log(party);*/ return "#AAA" }
						}
					}
					//deputiesScatterplot.setAlliances
					//deputiesGraph.setAlliances
						d3.selectAll(".deputy .node").style("fill", function(d) { 
							if(d.record !== undefined) d = d.record;
							return CONGRESS_DEFINE.getPartyColor(d.party) 
						});

						d3.selectAll('.traces .trace path').style('fill', function (d) { return CONGRESS_DEFINE.getPartyColor(d.key) })

				// Set the alliance to the partiesInfographic - movment
				partiesInfographic.setAlliance(alliances)
			})
	// ====================================================================================



	// ====================================================================================
	// States -----------------------------------------------------------------------------
	//
	// init
		var brazilianStates 		= d3.chart.brazilianStates();
		brazilianStates(d3.select('#infoStates'));
	//
	// interactions
		brazilianStates
			// when a state is selected
			.on('selected', function (district,operation) {
				deputiesScatterplot.selectNodesByAttr('district',district,operation);
				//deputiesGraph.selectStates(states);
			})
			// when a state is hovered
			.on('hover', function (district){
				deputiesScatterplot.highlightDistrict(district);
				deputiesGraph.highlightDistrict(district);
			})
	// ====================================================================================



	// ====================================================================================
	// parties infograph ------------------------------------------------------------------
	//
	// init
		var partiesInfographic = d3.chart.partiesInfographic();
		partiesInfographic(d3.select('#infoParties'));
	//
	// interactions
		partiesInfographic
			// when party or parties(alliance) are selected
			.on('selected', function (parties, operation) {
				deputiesScatterplot.selectParties( parties, operation );
			})
			// when a party or parties(alliance) are hovered
			.on('hover', function (parties){
				deputiesGraph.highlightParties( parties );
				deputiesScatterplot.highlightParties( parties );

				// sort the traces - the hovered parties to front
				timeline.partiesHovered( parties)
				
			})
	// ====================================================================================

	

	// ====================================================================================
	//  SET THE START DATE PERIOD - LAUNCH APP!!
	// ====================================================================================
		//var start = new Date(2012, 0, 1);
		//var end   = new Date(); // == "now"

		//setNewDateRange(null,null, null);
	// ====================================================================================
	// ====================================================================================



// ======================================================================================================================
// ======================================================================================================================
// set new date and set the new data for all visualizations 
function setNewDateRange(period,callback){
	deputiesGraph.stop();

	deputyNodes =[];
	rollCallNodes =[];

	// find if there is an pre calc of this period
	var precalc = {found:false, id:''};
	CONGRESS_DEFINE.years.forEach( function(yearObj){ 
			if(yearObj.period == period){ 
				precalc.found = true; 
				precalc.id = yearObj.name; 
				precalc.type = 'year';
				console.log('YEAR - preCALC!!'); }
	})
	if(!precalc.found)
	CONGRESS_DEFINE.legislatures.forEach( function(legislatureObj,i){ 
			if(legislatureObj.period == period){ 
				precalc.found = true; 
				precalc.id = i; 
				precalc.type = 'legislature';
				console.log('YEAR - preCALC!!'); }
	})
	if(!precalc.found)
	CONGRESS_DEFINE.presidents.forEach( function(presidentObj,i){ 
			if(presidentObj.period == period){ 
				precalc.found = true; 
				precalc.id = i; 
				precalc.type = 'president';
				console.log('YEAR - preCALC!!'); }
	})


	if(precalc.found) {
		// GET THE PRECALC DEPUTIES AND ROLLCALS
		chamberOfDeputies.getPreCalc(precalc.type,precalc.id, function (precalc) {

			// SET THE precalc DEPUTIES to their constant object in the app 
			deputyNodes = precalc.deputyNodes.map( function(precalcDeputy){ 
					var depObj = phonebook.getDeputyObj(precalcDeputy.deputyID);  // get the constant obj Deputy TODO
 					depObj.party = precalcDeputy.party;
					depObj.scatterplot 	= precalcDeputy.scatterplot;  
					return depObj;
			})

			// SET THE precalc ROLLCALLS to their constant object in the app
			rollCallNodes = precalc.rollCallNodes.map( function(precalcRollCall){ 
					var rollCall = arrayRollCalls[precalcRollCall.rollCallID]; // get the constant obj rollCall
					rollCall.rate 	  		= precalcRollCall.rate; 
					rollCall.scatterplot 	= precalcRollCall.scatterplot;  
					return rollCall;
			})
			
			callback()
		})
	}

	// update the data for the selected period
	updateDataforDateRange(period, function(){
		// if the precal was found we dont need to calc the SVD
		if(!precalc.found) {
			var filteredDeputies = filterDeputies( deputiesInTheDateRange, rollCallInTheDateRange)
			var SVDdata = calcSVD(filteredDeputies,rollCallInTheDateRange);
		
			// Create the arrays to D3 plot (TODO set to var var var); ---------------------------------------------------------------
			// Deputies array
			deputyNodes = createDeputyNodes(SVDdata.deputies,filteredDeputies);
			// RollCalls array
			rollCallNodes = createRollCallNodes(SVDdata.voting,rollCallInTheDateRange);
			// Adjust the SVD result to the political spectrum
			scaleAdjustment().setGovernmentTo3rdQuadrant(deputyNodes,rollCallNodes,period[1]);

			calcRollCallRate(rollCallNodes,null)
			callback();
		}
	})
}

function updateDataforDateRange(period,callback){
	
	// get the data (from db or already loaded in the dataWrapper)
	chamberOfDeputies.setDateRange(period[0],period[1], function(arollCallInTheDateRange,adeputiesInTheDateRange){

		rollCallInTheDateRange = [];
		arollCallInTheDateRange.forEach(function(rollCall){ if( (rollCall.votes!==null) && (rollCall.votes!==undefined) )  rollCallInTheDateRange.push(rollCall); })
		deputiesInTheDateRange = adeputiesInTheDateRange;

		 // console.log('deputies',deputiesInTheDateRange)
		// console.log('rollCalls',rollCallInTheDateRange)
		// console.log(motions)
		//AT THIS POINT rollCallInTheDateRange and deputiesInTheDateRange are updated with the new date range 
		
		callback();
	}) // chamberOfDeputies.setDateRange

}
//=========================================================================================================================
//=========================================================================================================================

function createDeputyNodes(data_deputies, selecteddeputies){
	
	for (var i = 0; i < selecteddeputies.length; i++) {
		selecteddeputies[i].scatterplot = data_deputies[i];
	};

	return selecteddeputies;
}

function createRollCallNodes(data_voting, rollCalls){
	 
	rollCalls.forEach(function(rollCall, i) {
		rollCall.scatterplot = data_voting[i];
	})

	return rollCalls;
}

// calc how many votes each congressman made in the period
function calcNumVotes(deputiesInTheDateRange){
	$.each(deputiesInTheDateRange, function(deputy){    deputiesInTheDateRange[deputy].numVotes = 0;  })

	rollCallInTheDateRange.forEach( function( rollCall ){
			rollCall.votes.forEach( function(vote){
				deputiesInTheDateRange[vote.deputyID].numVotes++;
			})
	})
	// average - stddev
	// var sum =0, sqrSum=0;
	// $.each(deputiesInTheDateRange, function(d){ 
	// 	sum += deputiesInTheDateRange[d].numVotes; 
	// 	sqrSum += Math.pow(deputiesInTheDateRange[d].numVotes,2);  
	// })
	// var mean = sum/Object.size(deputiesInTheDateRange);
	// var stdev = Math.sqrt((sqrSum/Object.size(deputiesInTheDateRange)) - ( Math.pow(sum/Object.size(deputiesInTheDateRange),2) ));
	// return {mean:mean,stdev:stdev};
}

// for each roll call rate how many yes and no it has, in the range [1(yes),-1(no)]
function calcRollCallRate(rollCalls,deputies){
	//console.log(rollCalls)
	var mapSelectedDeputies = {}; 

	if(deputies != null)
		 deputies.forEach(function(deputy){ mapSelectedDeputies[deputy.deputyID]=true; })
	else deputyNodes.forEach( function(d){ mapSelectedDeputies[d.deputyID]=true; })


	$.each(rollCalls, function(d){
		rollCalls[d].rate='noVotes'
		//rollCalls[d].agreement = 0;
		
		var totalVotes=0, // total of votes
			votes = {};   // sum of each type

		rollCalls[d].votes.forEach( function (vote){
			
			// if deputy is selected count the vote 
			if(mapSelectedDeputies[vote.deputyID]!== undefined){
				if( votes[vote.vote] == undefined ) votes[vote.vote]=0;
				
				votes[vote.vote] ++;
				totalVotes ++;
			}
		})

		// var maxAgree=0;
		// $.each(votes,function(v){ maxAgree = (votes[v] > maxAgree)? votes[v] : maxAgree })

		if( ( (votes['Sim'] ===undefined ) && (votes['Não'] ===undefined )) )
			{rollCalls[d].rate = 'noVotes'}
		else {
			if(votes['Sim'] === undefined) votes['Sim']=0;
			if(votes['Não'] === undefined) votes['Não']=0;
			// agreement(%) is the number of votes in the major vote decision('Sim','Não',...) by the total of votes 
			//rollCalls[d].agreement = maxAgree/totalVotes;
			rollCalls[d].rate = (votes['Sim']-votes['Não'])/( votes['Sim']+votes['Não']);
		}
	
		//if(deputies == null){ rollCalls[d].periodRate = rollCalls[d].rate; }
	})

	// average - stddev
	// var sum =0, sqrSum=0;
	// $.each(rollCalls, function(d){ 
	// 	sum += rollCalls[d].agreement; 
	// 	sqrSum += Math.pow(rollCalls[d].agreement,2);  
	// })
	// var mean = sum/rollCalls.length;
	// var stdev = Math.sqrt((sqrSum/rollCalls.length) - ( Math.pow(sum/rollCalls.length,2) ));
	// return {mean:mean,stdev:stdev};
}

// given a set of roll calls calc the rate of votes of each deputy  ([Sim]-[Não])/([Sim]+[Não])
// in the range [1(yes),-1(no)]
function calcDeputyNodesRates(selectedRollCalls){
	deputyNodes.forEach(function(deputy){
		deputy.votes ={};
		deputy.votes['Sim']=0;
		deputy.votes['Não']=0;
	})

	$.each(selectedRollCalls, function(d){
		selectedRollCalls[d].votes.forEach( function (vote){
			var deputy = phonebook.getDeputyObj(vote.deputyID);
			
			if(deputy.votes === undefined) deputy.votes ={};
			if( deputy.votes[vote.vote] === undefined ) deputy.votes[vote.vote]=0;
			deputy.votes[vote.vote]++;

		})
	})

	deputyNodes.forEach(function(deputy){
		if( (deputy.votes['Sim'] ==0 ) && (deputy.votes['Não'] == 0 ) )
			{deputy.rate = "noVotes";}
		else{
			var total = deputy.votes['Não'] + deputy.votes['Sim'];
			// agreement(%) is the number of votes in the major vote decision('Sim','Não',...) by the total of votes 
			deputy.rate = (deputy.votes['Sim']-deputy.votes['Não'])/total;
		}
	})

}

function calcStatesRates(selectedRollCalls, states ){
	//$.each(states, function(id){ states[id]={}; /*states[id].votes={};*/})
	$.each(states, function(){ this.votes={}; this.votes['Sim']=0; this.votes['Não']=0; })

	$.each(selectedRollCalls, function(){

		this.votes.forEach( function (vote){
			var deputy = phonebook.getDeputyObj(vote.deputyID);
			
			if( states[deputy.district].votes[vote.vote] === undefined ) states[deputy.district].votes[vote.vote]=0;
			states[deputy.district].votes[vote.vote]++;

		})
	})

	$.each(states, function(){

		if( (this.votes['Sim']==0) && (this.votes['Não']==0) ) {this.votes = null; this.rate = 'noVotes'}
		else{
			if(this.votes['Sim'] === undefined) this.votes['Sim']=0;
			if(this.votes['Não'] === undefined) this.votes['Não']=0;
			var total = this.votes['Não'] + this.votes['Sim'];
			// agreement(%) is the number of votes in the major vote decision('Sim','Não',...) by the total of votes 
			this.rate = (this.votes['Sim']-this.votes['Não'])/total;
		}
	})

}

function calcDeputyPerState(deputies, districts){
	$.each(districts, function(){ this.total=0; this.selected=0; })

	deputyNodes.forEach(function(d){
		districts[d.district].total++;
		if(deputies==null) districts[d.district].selected++;
	})

	if(deputies==null) return districts;

	deputies.forEach(function(deputy){
		districts[deputy.district].selected++;
	})
}

function calcDeputyPerParty( deputies ){
	if(deputies==null) return null;

	var parties = {};

	deputies.forEach(function(deputy){
		if(parties[deputy.party] === undefined) parties[deputy.party] = 0;
		parties[deputy.party]++;
	})

	return parties;
}

function calcPartiesSizeAndCenter( deputies ){
	if(deputies==null) return null;

	var parties = {};

	deputies.forEach(function(deputy){
		if(parties[deputy.party] === undefined) parties[deputy.party] = {size:0,center:[0,0], stdev:[0,0]};
		parties[deputy.party].size++;
		// sum of values
		parties[deputy.party].center[0] += deputy.scatterplot[0];
		parties[deputy.party].center[1] += deputy.scatterplot[1];
		// sum of values²
		parties[deputy.party].stdev[0] += Math.pow(deputy.scatterplot[0], 2);
		parties[deputy.party].stdev[1] += Math.pow(deputy.scatterplot[1], 2);
	})

	$.each(parties, function(party){
		// calc stdev
		parties[party].stdev[0] = Math.sqrt(  ( parties[party].stdev[0] - Math.pow(parties[party].center[0],2)/parties[party].size) / (parties[party].size -1) )
		parties[party].stdev[1] = Math.sqrt(  ( parties[party].stdev[1] - Math.pow(parties[party].center[1],2)/parties[party].size) / (parties[party].size -1) )
		// calc mean
		parties[party].center[0] = parties[party].center[0]/parties[party].size;
		parties[party].center[1] = parties[party].center[1]/parties[party].size;
	})
		
	return parties;
}

function calcSVD(deputies,rollCalls){
	// -------------------------------------------------------------------------------------------------------------------
	// Create the matrix [ Deputy ] X [ RollCall ] => table[Deputy(i)][RollCall(j)] = vote of deputy(i) in the rollCall(j)
		console.log("calc matrix deputy X rollCall!!")
		tableDepXRollCall = numeric.rep([ deputies.length, rollCalls.length],0)

		// How the votes will be represented in the matrix for the calc of SVD 
		var votoStringToInteger = {"Sim":1,"Não":-1,"Abstenção":0,"Obstrução":0,"Art. 17":0,"Branco":0}

		// for each rollCall
		rollCalls.forEach( function( rollCallEntry, rollCallKey ){
				

				if(rollCallEntry.votes.length == 0) console.log("NO VOTES('secret')! -"+rollCallEntry.obj)
				else{
					// for each vote in the roll call
					rollCallEntry.votes.forEach( function(vote){

						var svdKey = deputiesInTheDateRange[vote.deputyID].svdKey;
						if(svdKey !== null){
							//if(votoStringToInteger[vote.vote]===undefined) console.log("'"+vote.vote+"'");
							tableDepXRollCall[svdKey][rollCallKey]=votoStringToInteger[vote.vote];
						}
					})
				}
		})

	// -----------------------------------------------------------------------------------------------------------------
	// CALC the Singular Value Decomposition (SVD) ---------------------------------------------------------------------
		console.log("calc SVD")
		
		//!! Uncaught numeric.svd() Need more rows than columns

		//  if(rows < columns)-> 
		if(deputies.length < rollCalls.length){
			//TRANSPOSE the table to fit the rowsXcolumns numeric.svd() requirement !!
			tableDepXRollCall = numeric.transpose(tableDepXRollCall)  
		}

		var svdDep = numeric.svd(tableDepXRollCall);
		var eigenValues = numeric.sqrt(svdDep.S);

		if(deputies.length < rollCalls.length){tableDepXRollCall = numeric.transpose(tableDepXRollCall)};

		//Uncaught numeric.svd() Need more rows than columns  numeric.transpose()
		if(deputies.length < rollCalls.length){
			// 2D reduction on Deputies 
			var data_deputies = svdDep.V.map(function(row) { return numeric.mul(row, eigenValues).splice(0, 2);})
			// 2D reduction on Votings              
			var data_voting   = svdDep.U.map(function(row) { return numeric.mul(row, eigenValues).splice(0, 2);})
		} else {
			// 2D reduction on Deputies 
			var data_deputies = svdDep.U.map(function(row) { return numeric.mul(row, eigenValues).splice(0, 2);})
			// 2D reduction on Votings              
			var data_voting   = svdDep.V.map(function(row) { return numeric.mul(row, eigenValues).splice(0, 2);})
		}

		console.log("CALC SVD- FINISHED!! => PLOT")
	// ----------------------------------------------------------------------------------------------------------------
	return {deputies: data_deputies, voting: data_voting};
}

function filterDeputies ( deputiesInTheDateRange, rollCallInTheDateRange) {

		// calc the number of votes for each congressman
		calcNumVotes(deputiesInTheDateRange);
			
		// select only congressmans who votead at least one third 1/3 of all roll calls in the selected period
		function filterFunction(){ 
			var svdKey =0;
			var dep = $.map(deputiesInTheDateRange, function(deputy){ 

					if(deputy.numVotes > (rollCallInTheDateRange.length/3) ){ 

						deputy.svdKey = svdKey++;
						//deputy.selected = true;
						return deputy;

					}
					else{ 
						deputy.scatterplot = null;
						deputy.svdKey= null;
					} 
				})
			return dep;
		}
		// -------------------------------------------------------------------------------------------------------------------
	return filterFunction();
}