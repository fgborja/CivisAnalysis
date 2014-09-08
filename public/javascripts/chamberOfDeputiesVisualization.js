/*global d3 tooltip*/
var tooltip = d3.select("#main")
	.append("div")
	.style("visibility", "hidden")
	.style("opacity", 0)
	.attr("class", "d3tooltip");

// div of selection
$('div.selected').css('visibility','hidden');


var motions = {};  					// collection of motions  => { "tipo+numero+ano":{ rollCalls:{}, details:{} },...}
var datetimeRollCall = [];			// array of all rollCalls
var ideCadastroCollection = {};   	// collection of ideCadastro => { ideCadastro: [ Object deputyDetails ], ... }

//var phonebook = Phonebook();		// module to index deputy names 
//var chamberOfDeputies = $.chamberOfDeputiesDataWrapper(motions, datetimeRollCall, phonebook);

var phonebook = {
			getDeputyObj  : function(deputyID){ return this.deputiesArray[deputyID]; },
			deputiesArray : []
		};
var chamberOfDeputies = $.chamberOfDeputiesDataWrapperMin(motions, datetimeRollCall, phonebook.deputiesArray);

//var scaleAdjustment     = scaleAdjustment();

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
				calcRollCallAgreement(rollCallInTheDateRange,deputies);
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
		var rollCallsScatterplot 	= d3.chart.rollCallsScatterplot();
		// set html container
		rollCallsScatterplot(d3.select('#canvasRollCalls'));

		rollCallsScatterplot.on('selected', function (selectedRollCalls){

			//console.log('rollCallsScatterplot.on(selected')
						
			if(selectedRollCalls.length == rollCallNodes.length) {
				$('div.rollCalls.selected').css('visibility','hidden');
				deputiesScatterplot.resetRollCallRates();
				deputiesGraph.resetRollCallRates();
				brazilianStates.resetRollCallRates();
				partiesInfographic.resetRollCallRates();
			}
			else {			
				$('div.rollCalls.selected').css('visibility','visible');
				calcDeputyNodesHistogram(selectedRollCalls)

				deputiesScatterplot.setRollCallVotingRate();
				deputiesGraph.setRollCallVotingRate();

				calcStatesHistogram(selectedRollCalls, brazilianStates.getStates() )
				//calcStatesHistogram(selectedRollCalls, deputiesScatterplot.getSelectedDeputies() )
				brazilianStates.setRollCallRates();
				partiesInfographic.setRollCallRates(selectedRollCalls);
			}
		})

		rollCallsScatterplot.on('hover', function(rollCall){
			// console.log('hover'+rollCall)
			// console.log('hover'+mouseover)
			if(rollCall!=null){
					 calcStatesHistogram([rollCall], brazilianStates.getStates() ); 

					// highlight the rates of the rollCall in the states
					brazilianStates.highlightRollCall( rollCall );
					// highlight the votes of deputies
					deputiesGraph.highlightRollCall( rollCall );
					// highlight the votes of deputies
					deputiesScatterplot.highlightRollCall( rollCall );
					// highlight the votes of parties
					partiesInfographic.setRollCallRates([rollCall]);
			} else {
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
		var timelineBarChart = d3.chart.timelineBarChart();
		timelineBarChart(d3.select('#timeline'));
	//
	// interactions
		timelineBarChart
			// Set new range of dates!
			.on("timelineFilter", function(filtered) { 
				console.log("filtered", filtered);

				$('#loading').css('visibility','visible');
				$('div.selected').css('visibility','hidden');

				setNewDateRange(filtered[0],filtered[1], 
					function(){
						d3.select('#loading').style('visibility','hidden');
					}
				);
			})
			// Set the alliance!
			.on("setAlliances", function(alliances) { 

				// SET THE PARTIES COLORS ACORDING TO EACH ALLIANCE
					if(alliances==null) getPartyColor = getConstantPartyColor;
					else {
						var partiesColigationColor = {};
						$.each(alliances, function(i){
							$.each(alliances[i].parties, function(party){ return partiesColigationColor[alliances[i].parties[party]]= getPartyColor( alliances[i].parties[0] )  })
						});
						getPartyColor = function(party){ 
							if(partiesColigationColor[party] !== undefined ) 
								{return partiesColigationColor[party];}
							else{ /*console.log(party);*/ return "#AAA" }
						}
					}
					//deputiesScatterplot.setAlliances
					//deputiesGraph.setAlliances
						d3.selectAll(".deputy .node").style("fill", function(d) { 
							if(d.record !== undefined) d = d.record;
							return getPartyColor(d.party) 
						});

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
			})
	// ====================================================================================

	

	// ====================================================================================
	//  SET THE START DATE FRAME - LAUNCH APP!!
	// ====================================================================================
		var start = new Date(2012, 0, 1);
		var end   = new Date(); // == "now"

		setNewDateRange(start,end, null);
	// ====================================================================================
	// ====================================================================================



// ======================================================================================================================
// ======================================================================================================================

function setNewDateRange(start,end,callback){
	deputiesGraph.stop();

	deputyNodes =[];
	rollCallNodes =[];

	updateDataforDateRange(start,end, function(){
		
		timelineBarChart.data(datetimeRollCall)
		timelineBarChart.update();

		// set deputy data
		deputiesScatterplot.data(deputyNodes);
		// plot
		deputiesScatterplot.update(null)

		calcRollCallAgreement(rollCallNodes,null)
		// set rollcall data
		rollCallsScatterplot.data(rollCallNodes);
		// plot
		rollCallsScatterplot.update(null);

		// GRAPHHH!!
		// set tableDepXRollCall data
		deputiesGraph.data(tableDepXRollCall);
		// plot
		deputiesGraph.update(null);

		partiesInfographic.data(deputyNodes);
		partiesInfographic.update(null);

		
		calcDeputyPerState(null, brazilianStates.getStates())
		brazilianStates.resetRollCallRates();
		brazilianStates.selectAllStates();

		callback();
	})
}

function updateDataforDateRange(start,end,callback){

	//scaleAdjustment.setSampling(deputiesInTheDateRange);

	// get the data (from db or already loaded in the dataWrapper)
	chamberOfDeputies.setDateRange(start,end, function(arollCallInTheDateRange,adeputiesInTheDateRange){

		rollCallInTheDateRange = arollCallInTheDateRange;
		deputiesInTheDateRange = adeputiesInTheDateRange;

		// console.log(datetimeRollCall)
		 // console.log('deputies',deputiesInTheDateRange)
		 // console.log('rollCalls',rollCallInTheDateRange)
		// console.log(motions)
		//AT THIS POINT rollCallInTheDateRange and deputiesInTheDateRange are updated with the date range 
		
		// -------------------------------------------------------------------------------------------------------------------
		//calc Vote Density Histogram  ---------------------------------------------------------------------------------------
		// 	console.log("calc Vote Density Histogram")

			var mean=0,stdev=0;
			var result = calcNumVotesHistogram(deputiesInTheDateRange);
		// 	var mean  = result.mean;
		// 	var stdev = result.stdev;
		// 	$('#averageDeputies').text(mean.toPrecision(Math.log(mean)));
		// 	$('#stdDeputies').text(stdev.toPrecision(Math.log(stdev)));

		// // calc rollCall agreement rate%
		// 	console.log("calc rollCall agreement rate%")
		// 	var result = calcRollCallAgreement(rollCallInTheDateRange);
		// 	var mean  = Math.floor( (result.mean *100));
		// 	var stdev = Math.floor( (result.stdev*100));
		// 	$('#averageRollCalls').text(mean+'%');
		// 	$('#stdRollCalls').text(stdev+'%');
			
		
		function filterDeputies(filter){ 
			var svdKey =0;
			var filteredDeputies;

			filteredDeputies = $.map(deputiesInTheDateRange, function(deputy){ 

				if(deputy.numVotes > (rollCallInTheDateRange.length/3) ){ 

					deputy.svdKey = svdKey++;
					//deputy.selected = true;
					return deputy;

				}
				else{ 
					deputy.svdKey=undefined
				} 

			})

			return filteredDeputies;
		}
		// -------------------------------------------------------------------------------------------------------------------
		filteredDeputies = filterDeputies(true)
		

		var SVDdata = calcSVD(filteredDeputies,rollCallInTheDateRange);
		
		// Create the arrays to D3 plot (TODO set to var var var); ---------------------------------------------------------------
			// Deputies array
			deputyNodes = createDeputyNodes(SVDdata.deputies,filteredDeputies);
			// RollCalls array
			rollCallNodes = createRollCallNodes(SVDdata.voting,rollCallInTheDateRange);
		//

		scaleAdjustment().setGovernmentTo3rdQuadrant(deputyNodes,rollCallNodes,end);
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
		rollCall.i = i;
	})

	return rollCalls;
}


function calcNumVotesHistogram(deputiesInTheDateRange){
	//number of votes of each deputy
	$.each(deputiesInTheDateRange, function(deputy){    deputiesInTheDateRange[deputy].numVotes = 0;  })
	rollCallInTheDateRange.forEach( function( entry ){
			entry.rollCall.votes.forEach( function(vote){

				deputiesInTheDateRange[vote.deputyID].numVotes++;
				//else {console.log(deputy.Nome); console.log(entr)}
			})
	})
	// average - stddev
	var sum =0, sqrSum=0;
	$.each(deputiesInTheDateRange, function(d){ 
		sum += deputiesInTheDateRange[d].numVotes; 
		sqrSum += Math.pow(deputiesInTheDateRange[d].numVotes,2);  
	})
	var mean = sum/Object.size(deputiesInTheDateRange);
	var stdev = Math.sqrt((sqrSum/Object.size(deputiesInTheDateRange)) - ( Math.pow(sum/Object.size(deputiesInTheDateRange),2) ));
	return {mean:mean,stdev:stdev};
}


function calcRollCallAgreement(rollCalls,deputies){
	//console.log(rollCalls)
	var mapSelectedDeputies = {}; 

	if(deputies != null) 
		 deputies.forEach(function(deputy){ mapSelectedDeputies[deputy.deputyID]=true; })
	else deputyNodes.forEach( function(d){ mapSelectedDeputies[d.deputyID]=true; })


	$.each(rollCalls, function(d){
		rollCalls[d].rate='noVotes'
		rollCalls[d].agreement = 0;
		
		var totalVotes=0, // total of votes
			votes = {};   // sum of each type

		rollCalls[d].rollCall.votes.forEach( function (vote){
			
			// if deputy is selected count the vote 
			if(mapSelectedDeputies[vote.deputyID]!== undefined){
				if( votes[vote.vote] == undefined ) votes[vote.vote]=0;
				
				votes[vote.vote] ++;
				totalVotes ++;
			}
		})

		 var maxAgree=0;
		 $.each(votes,function(v){ maxAgree = (votes[v] > maxAgree)? votes[v] : maxAgree })

		 if( ( (votes['Sim'] ===undefined ) && (votes['Não'] ===undefined )) )
			{rollCalls[d].rate = 'noVotes'}
		 else {
			 if(votes['Sim'] === undefined) votes['Sim']=0;
			 if(votes['Não'] === undefined) votes['Não']=0;
			// agreement(%) is the number of votes in the major vote decision('Sim','Não',...) by the total of votes 
			rollCalls[d].agreement = maxAgree/totalVotes;
			rollCalls[d].rate = (votes['Sim']-votes['Não'])/totalVotes;
		}
	})

	// average - stddev
	var sum =0, sqrSum=0;
	$.each(rollCalls, function(d){ 
		sum += rollCalls[d].agreement; 
		sqrSum += Math.pow(rollCalls[d].agreement,2);  
	})
	var mean = sum/rollCalls.length;
	var stdev = Math.sqrt((sqrSum/rollCalls.length) - ( Math.pow(sum/rollCalls.length,2) ));
	return {mean:mean,stdev:stdev};
}

// given a set of roll calls calc the rate of votes of each deputy  ([Sim]-[Não])/([Sim]+[Não])
function calcDeputyNodesHistogram(selectedRollCalls){
	deputyNodes.forEach(function(deputy){
		deputy.votes ={};
		deputy.votes['Sim']=0;
		deputy.votes['Não']=0;
	})

	$.each(selectedRollCalls, function(d){
		selectedRollCalls[d].rollCall.votes.forEach( function (vote){
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

function calcStatesHistogram(selectedRollCalls, states ){
	//$.each(states, function(id){ states[id]={}; /*states[id].votes={};*/})
	$.each(states, function(){ this.votes={}; this.votes['Sim']=0; this.votes['Não']=0; })

	$.each(selectedRollCalls, function(){

		this.rollCall.votes.forEach( function (vote){
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
			
			//states[id].votes['Sim']=0;
			//states[id].votes['Não']=0;
		}
	})

	//$.each(states, function(id){ console.log(id+' '+this.rate+' '+this.votes['Não']+' '+this.votes['Sim']) })

	//return states;
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



//var day_month_year = Data.match(/\d+/g);
// function getPartyAtDate(deputyDetails, endDate){
// 	if(deputyDetails.filiacoesPartidarias == "") return deputyDetails.partidoAtual.sigla;
// 	else{
// 		var party="";
// 		if(isArray(deputyDetails.filiacoesPartidarias.filiacaoPartidaria)){
			
// 			var sdate= new Date(1789,6,14);

// 			deputyDetails.filiacoesPartidarias.filiacaoPartidaria.forEach(
// 				function(filiacaoPartidaria){
// 					var day_month_year = filiacaoPartidaria.dataFiliacaoPartidoPosterior.match(/\d+/g);
// 					var dateFili = new Date(day_month_year[2],day_month_year[1]-1,day_month_year[0]);

// 					if(party =="") party = filiacaoPartidaria.siglaPartidoAnterior;
// 					if( (endDate >= dateFili)) party = filiacaoPartidaria.siglaPartidoPosterior;                    

// 				}
// 			)
// 		}
// 		else{
// 			//console.log( deputyDetails.filiacoesPartidarias)
// 			var day_month_year = deputyDetails.filiacoesPartidarias.filiacaoPartidaria.dataFiliacaoPartidoPosterior.match(/\d+/g);
// 			var dateFili = new Date(day_month_year[2],day_month_year[1]-1,day_month_year[0]);

// 			if(party =="") party = deputyDetails.filiacoesPartidarias.filiacaoPartidaria.siglaPartidoAnterior;
// 			if( (endDate >= dateFili)) party = deputyDetails.filiacoesPartidarias.filiacaoPartidaria.siglaPartidoPosterior;
// 		}
// 		return party;
// 	}
// }


function calcSVD(deputies,rollCalls){
	// -------------------------------------------------------------------------------------------------------------------
	// Create the matrix [ Deputy ] X [ RollCall ] => table[Deputy(i)][RollCall(j)] = vote of deputy(i) in the rollCall(j)
		console.log("calc matrix deputy X rollCall!!")
		tableDepXRollCall = numeric.rep([ deputies.length, rollCalls.length],0)
		
		// How the votes will be represented in the matrix for the calc of SVD 
		var votoStringToInteger = {"Sim":1,"Não":-1,"Abstenção":0,"Obstrução":0,"Art. 17":0,"Branco":0}

		// for each rollCall
		rollCalls.forEach( function( rollCallEntry, rollCallKey ){
				

				if(rollCallEntry.rollCall.votes.length == 0) console.log("NO VOTES('secret')! -"+rollCallEntry.rollCall.ObjVotacao)
				else{
					// for each vote in the roll call
					rollCallEntry.rollCall.votes.forEach( function(vote){

						var svdKey = deputiesInTheDateRange[vote.deputyID].svdKey;
						if(svdKey !== undefined){
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

//=============================================================================
// Deputies - Modal
function setDeputyModal_SearchAll(){
	setDeputyModal_Init();
	setDeputyModal_setTable(deputyNodes);
	setDeputyModal_Click();
}

function setDeputyModal_ListSelected(){
	setDeputyModal_Init();
	setDeputyModal_setTable(deputiesScatterplot.getSelected());
	setDeputyModal_Click();
}

function setDeputyModal_Init(){
	d3.select('.modal-title').text('Deputies - search & select')
	$('.modal-body').children().remove();
	$('.modal-body').append('<table id="table" calss="display"><thead><tr><th>Name</th><th>Party</th><th>State</th></tr><thead/></table>')
}

function setDeputyModal_setTable(data){
	$('#table').DataTable( {
		data 	: data,
		columns : [
			{ data: 'name' },
			{ data: 'party'},
			{ data: 'district'}
		],
		createdRow: function ( row, data, index ) {
            if ( deputiesScatterplot.isSelected( data.deputyID ) ) {
                 $(row).addClass('selected');
            }
        }
	});
}

function setDeputyModal_Click(){
	$('#table tbody').on("click", "tr", function(){
		$(this).toggleClass('selected');
		
		var name = $('td', this).eq(0).text();
		var party = $('td', this).eq(1).text();
		var state = $('td', this).eq(2).text();
		alert( 'You clicked on '+name+'\'s row' );
	});
}
//=============================================================================


//=============================================================================
// RollCall - Modal

function setRollCallModal_SearchAll(){
	setRollCallModal_Init()
	setRollCallModal_setTable(rollCallNodes)
	setRollCallModal_Click();
}

function setRollCallModal_ListSelected(){
	setRollCallModal_Init()
	setRollCallModal_setTable( rollCallsScatterplot.getSelected())
	setRollCallModal_Click();
}

function setRollCallModal_Init(){
	d3.select('.modal-title').text('Roll Calls - search & select')
	$('.modal-body').children().remove();
	$('.modal-body').append('<table id="table" calss="display"><thead><tr><th>Type</th><th>Number</th><th>Year</th></tr><thead/></table>')
}
function setRollCallModal_setTable(data){
	$('#table').DataTable({
		data: data,
		columns: [
			{ data: 'tipo', },
			{ data: 'numero' },
			{ data: 'ano' }
		],
		createdRow: function ( row, data, index ) {
            if ( rollCallsScatterplot.isSelected( data.i ) ) {
                 $(row).addClass('selected');
            }
        }
	});
}
function setRollCallModal_Click(){
	$('#table tbody').on("click", "tr", function(){
		var name = $('td', this).eq(0).text();
		var party = $('td', this).eq(1).text();
		var state = $('td', this).eq(2).text();
		alert( 'You clicked on '+name+'\'s row' );
	});
}
//=============================================================================
