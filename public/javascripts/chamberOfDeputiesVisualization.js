/*global d3 tooltip*/
var tooltip = d3.select("body")
	.append("div")
	.style("visibility", "hidden")
	.style("opacity", 0)
	.attr("class", "d3tooltip");

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
	$('#main').animate({height: '0%'},1000,function(){ $('#main').hide()})

	timeline
		.data(arrayRollCalls)
		.update();
});

// ======================================================================================================================
// LAUNCH APP ===========================================================================================================
	var radius = 3.5;
	var radiusHover = radius*2;

	// deputies and rollCalls found in the date range 
	var rollCallInTheDateRange =[];
	var deputiesInTheDateRange ={};

	// deputies and rollCalls to plot 
	var deputyNodes =[]; // (filtered)
	var rollCallNodes =[];

	var parties = {};

	// MAIN CANVAS (where all the visualization will be appended)
	var canvasDimension = { height: $(window).height()*0.80 /*$('.canvas').width()*2.2*/, width:$('#canvas').width() };
	var canvasSVG = d3.select('#canvas').append('svg').attr(canvasDimension);

	// =====================================================================================
	// Chamber Of Deputies Infographic -----------------------------------------------------
	//
		var chamberRadius = (canvasDimension.height/2 < canvasDimension.width)? canvasDimension.width/5 : canvasDimension.height/6;
		var chamberInfographic = d3.chart.chamberInfographic();
		chamberInfographic( canvasSVG ,{cx:canvasDimension.width/2, cy:canvasDimension.height/2-20, r: chamberRadius   });

		chamberInfographic
			.on('update', updateDeputies )
	// =====================================================================================


	// =====================================================================================
	// Deputies Scatterplot ----------------------------------------------------------------
	//
		var deputiesScatterplot = d3.chart.deputiesScatterplot();
		deputiesScatterplot(canvasSVG, {x:10, y:canvasDimension.height/2+30, width: canvasDimension.width-15, height: $('.canvas').width(), radius: radius} );

		deputiesScatterplot
			.on('update', updateDeputies )
	// ====================================================================================

	// ====================================================================================
	// Labels   --------------------------------------------------------------------
		var labelManager = d3.chart.labelManager();
		labelManager(canvasSVG, 
			{
				x:0, y:0, 
				partiesLabel: {x:0, y:0, width: 0, height:0 },
				deputiesLabel: {cx:canvasDimension.width/2, cy:canvasDimension.height/2-20, r:chamberRadius-5 },
				RollCallsLabel: {x:0, y:0, width: 0, height:0 }
			} 
		)
		labelManager.on('update', updateDeputies);
	// ====================================================================================

	// ====================================================================================
	// States Infographic -----------------------------------------------------------------
		var brazilianStates = d3.chart.brazilianStates();
		brazilianStates(d3.select('#infoStates'));
		
		brazilianStates
			.on('update', updateDeputies )
	// ====================================================================================

	// ====================================================================================
	// RollCalls Scatterplot --------------------------------------------------------------
	//
	//
	// init
		var rollCallsScatterplot 	= d3.chart.rollCallsScatterplot();
		// set html container
		rollCallsScatterplot(d3.select('#canvasRollCalls'));
	//
	// interactions
		rollCallsScatterplot
			.on('update', updateRollCalls )
			/*
			.on('selected', function (selectedRollCalls){

				deputyNodes.forEach(function (deputy) { deputy.rate = null; deputy.vote = null; })

				if(selectedRollCalls.length == 1){ rollCallsScatterplot.dispatchHovered(selectedRollCalls[0]); return; }
							
				if(selectedRollCalls.length == rollCallNodes.length) {
					// ALL RollCalls selected - reset roll call rates
					$('div.rollCalls.selected').css('visibility','hidden');

					// reset party
					for ( var party in parties) parties[party].rate = null;
					// reset states	
					brazilianStates.resetRollCallRates();
				}
				else {			
					$('div.rollCalls.selected').css('visibility','visible');
					
					calcDeputyNodesRates(selectedRollCalls);
					updatePartyRollCalls(selectedRollCalls);

					calcStatesRates(selectedRollCalls, brazilianStates.getStates() )
					brazilianStates.setRollCallRates();
				}

				deputiesScatterplot.update();
				chamberInfographic.update();
			})

			.on('hover', function(rollCall){
				if(rollCall!=null){
						deputyNodes.forEach(function (deputy) { deputy.vote = null; })

						calcStatesRates([rollCall], brazilianStates.getStates() ); 
						
						// set the votes
						rollCall.votes.forEach( function (deputyVote) {
							deputiesInTheDateRange[deputyVote.deputyID].vote = deputyVote.vote;
						})
						// who is in the plot and did not voted - set vote to 'null'
						deputyNodes.forEach( function (deputy) {
							if(deputy.vote == null) deputy.vote = 'null';
						})

						updatePartyRollCalls([rollCall]);

						// highlight the rates of the rollCall in the states
						calcStatesRates([rollCall], brazilianStates.getStates() )
						brazilianStates.setRollCallRates();
						// highlight the votes of deputies
						//deputiesGraph.highlightRollCall( rollCall );
						// highlight the votes of deputies
						//deputiesScatterplot.highlightRollCall( rollCall );

						deputiesScatterplot.update();
						chamberInfographic.update();
						// highlight the votes of parties
						//partiesInfographic.setRollCallRates([rollCall]);
				} else {
					// reset rollCallsScatterplot
					rollCallsScatterplot.dispatchSelected();
				}
			})
*/
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

				//$('#main').show().animate({height: $('body').height()/2},1000)
				$('#main').show().animate({height: '80%'/*$('#canvas').height()*/},2000)
				console.log("filtered", filtered);
				//$('#loading').css('visibility','visible');
				$('span.startDate').text(filtered[0].toLocaleDateString());
				$('span.endDate').text(filtered[1].toLocaleDateString());

				setNewDateRange(filtered, 
					function(){
						$('a.deputies').text(deputyNodes.length + ' Deputies ');
						$('a.rollCalls').text(rollCallNodes.length + ' Roll Calls ');

						// reset rates
						deputyNodes.forEach( function(deputy) { deputy.rate = null; deputy.vote = null; deputy.selected = (true)? true : false; })
						rollCallNodes.forEach( function(rollCall) { rollCall.selected = (true)? true : false; })

						// set parties
						parties = calcPartiesSizeAndCenter(deputyNodes);

						// set the data to all visualizations
						// ...
						deputiesScatterplot
							.data(deputyNodes) // set deputy data
							.update()  // plot
						
						rollCallsScatterplot
							.data(rollCallNodes) 	// set rollcall data
							.update(null);			// plot

						chamberInfographic
							.data(deputyNodes)
							.parties(parties)
							.update();

						labelManager
							.deputies(deputyNodes)
							.parties(parties)
							.rollCalls(rollCallNodes)
							.update()

						calcDeputyPerState(null, brazilianStates.getStates())
						brazilianStates.deputies(deputyNodes);
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
					
					if(deputiesScatterplot.data() !== undefined){
						deputiesScatterplot.update();
						chamberInfographic.setAlliances(alliances)
						chamberInfographic.update();
					}

						d3.selectAll('.traces .trace path').style('fill', function (d) { return CONGRESS_DEFINE.getPartyColor(d.key) })

				// Set the alliance to the partiesInfographic - movment
				//partiesInfographic.setAlliance(alliances)
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

function updatePartyRollCalls(rollCalls){
	for( var party in parties){
		parties[party].votes = {"Sim":0,"Não":0,"Abstenção":0,"Obstrução":0,"Art. 17":0,"null":0}
	} 

	rollCalls.forEach(function(rollCall){
		rollCall.votes.forEach( function (vote){
			if(parties[vote.party] != undefined)
				parties[vote.party].votes[vote.vote]++
		})
	})

	for( var party in parties ){
		if( (parties[party].votes['Sim']==0) && (parties[party].votes['Não']==0) ) {parties[party].rate = 'noVotes'}
		else{
			var total = parties[party].votes['Não'] + parties[party].votes['Sim'];
			parties[party].rate = (parties[party].votes['Sim']-parties[party].votes['Não'])/total;
		}
	} 
}

function updateRollCalls(){
	var selectedRollCalls = [];
	var hoveredRollCalls = [];
	rollCallNodes.forEach(function (deputy) { 
		if(deputy.selected) selectedRollCalls.push(deputy);  
		if(deputy.hovered) hoveredRollCalls.push(deputy);
	})

	if (selectedRollCalls.length == rollCallNodes.length)
		d3.selectAll('#rollCallsSelected a').classed('disabled',true);
	else d3.selectAll('#rollCallsSelected a').classed('disabled',false);


	if( (selectedRollCalls.length == rollCallNodes.length) && (hoveredRollCalls.length == 0) ){
		// reset deputies
		deputyNodes.forEach(function (deputy) { deputy.rate = null; deputy.vote = null; })
		// reset party
		for ( var party in parties) parties[party].rate = null;
		// reset states	
		 brazilianStates.resetRollCallRates();
	}
	else {
		if( (hoveredRollCalls.length==1) || (selectedRollCalls.length==1) ){ 

			deputyNodes.forEach( function (deputy) { deputy.vote = 'null'; })

			var rollCall = (hoveredRollCalls.length==1)? hoveredRollCalls[0] : selectedRollCalls[0];
			// set the deputy votes
			rollCall.votes.forEach( function (deputyVote) {
				deputiesInTheDateRange[deputyVote.deputyID].vote = deputyVote.vote;
			})
			
			selectedRollCalls = [rollCall];
		} else{ 
			deputyNodes.forEach( function (deputy) { deputy.rate = null; deputy.vote = null; })
			calcDeputyNodesRates(selectedRollCalls);
		}
		
		// set party rates
		updatePartyRollCalls(selectedRollCalls);
		// set states rate
		calcStatesRates(selectedRollCalls, brazilianStates.getStates() )
		brazilianStates.setRollCallRates();
	}

	deputiesScatterplot.update();
	chamberInfographic.update();
	rollCallsScatterplot.update();
	labelManager.update();
}

function updateDeputies(){
	var selectedDeputies = [];
	var hoveredDeputies = [];
	deputyNodes.forEach(function (deputy) { 
		if(deputy.selected) selectedDeputies.push(deputy);  
		if(deputy.hovered) hoveredDeputies.push(deputy);
	})

	if(selectedDeputies.length == deputyNodes.length)
		d3.selectAll('#deputiesSelected a').classed('disabled',true);
	else d3.selectAll('#deputiesSelected a').classed('disabled',false);

	// SET RollCall votes  ----------------------------------------------------------------------
		rollCallNodes.forEach( function(rollCall){
			rollCall.vote = null; 
			rollCall.rate = null; 
		})

		// show the votes of one deputy
		if( (hoveredDeputies.length==1) || (selectedDeputies.length==1) ){
			// get the deputy id
			var deputyID = (hoveredDeputies.length==1)? hoveredDeputies[0].deputyID : selectedDeputies[0].deputyID;
			// set the deputy vote for each rollCall
			rollCallNodes.forEach( function(rollCall){
				rollCall.vote = 'null'
				rollCall.votes.forEach( function(vote){
					if(vote.deputyID == deputyID){
						rollCall.vote = vote.vote;
					}
				})
			})
		}
		else {
			//set the agreement rate for each RollCall
			calcRollCallRate(rollCallNodes,selectedDeputies);
		}
	// ------------------------------------------------------------------------------------------

	// set party selection  --------------------------------
		for( var party in parties) parties[party].selected = 0;
			
		selectedDeputies.forEach(function (deputy){
			//if(parties[deputy.party] == undefined ) console.log(deputy.party) 
			parties[deputy.party].selected++ 
		})
	//-----------------------------------------------------
	calcDeputyPerState(selectedDeputies, brazilianStates.getStates())
	// TODO? display the distribution of the selected ( state-> unselecting all states)
	brazilianStates.selectedDeputies();

	deputiesScatterplot.update();
	chamberInfographic.update();
	rollCallsScatterplot.update();
	//brazilianStates.update();	
	labelManager.update();
}


// ======================================================================================================================
// ======================================================================================================================
// set new date and set the new data for all visualizations 
function setNewDateRange(period,callback){
	//deputiesGraph.stop();

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

function calcPartiesSizeAndCenter( deputies ){
	if(deputies==null) return null;

	var parties = {};

	deputies.forEach(function(deputy){

		if(parties[deputy.party] === undefined) parties[deputy.party] = {size:0, selected:0, center:[0,0], stdev:[0,0]};
		parties[deputy.party].size++;
		if(deputy.selected) parties[deputy.party].selected++;
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
		function filterDeputiesWhoVotedAtLeastOneThirdOfVotes(){ 
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

		// select 513 deputies, deputies with more present in votings.
		function filter513DeputiesMorePresent(){ 
			var deputies = $.map(deputiesInTheDateRange, function(deputy){ 
								return deputy;
							})
			deputies = deputies.sort(function(a,b){ return b.numVotes - a.numVotes})

			// get the first 513nd deputies
			var selectedDeputies = deputies.splice(0, ((deputies.lenght < 513)? deputies.lenght : 513) )

			// set selected
			var svdKey =0;
			selectedDeputies.forEach( function(deputy,i){
				deputy.svdKey = svdKey++;
			})

			// reset non selected
			deputies.forEach( function(deputy){
				deputy.scatterplot = null;
				deputy.svdKey= null;
			})

			return selectedDeputies;
		}
		// -------------------------------------------------------------------------------------------------------------------
	var filterFunction = filter513DeputiesMorePresent;
	return filterFunction();
}


$('a.deputies').mouseover(function () { 
	deputyNodes.forEach( function (deputy) { 
		deputy.hovered = true; 
	}); 
	deputiesScatterplot.update();
	chamberInfographic.update();
});
$('a.deputies').mouseout(function () {
	deputyNodes.forEach( function (deputy) { 
		deputy.hovered = false;
	}); 
	deputiesScatterplot.update();
	chamberInfographic.update();
});
$('a.rollCalls').mouseover(function () {
	rollCallNodes.forEach( function (rollCall) {
		rollCall.hovered = true; 
	}); 
	rollCallsScatterplot.update();
});
$('a.rollCalls').mouseout(function () {
	rollCallNodes.forEach( function (rollCall) { 
		rollCall.hovered = false;
	}); 
	rollCallsScatterplot.update();
});