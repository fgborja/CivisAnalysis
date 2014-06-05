/*global d3 tooltip*/
var tooltip = d3.select(".row")
	.append("div")
	.style("visibility", "hidden")
	.attr("class", "d3tooltip");


					  // "S.PART.","S.Part.","PRONA","PSDC","PST","PTN","PTdoB","PTC"
					  // "PMN","PMR","PPL","PEN","PSL","PHS","PRP","PRTB","PAN","PRB"

var partyColor = function(party){ 
	if(partiesNamesColor[party] !== undefined ) 
		{return partiesNamesColor[party];}
	else{ /*console.log(party);*/ return "#AAA" }
} 

// colors representing the vote value
var votoStringToColor = {"Sim":"green","Não":"red","Abstenção":"purple","Obstrução":"blue","Art. 17":"yellow","null":'grey'}

var votingColorGR = ["rgb(165,0,38)","rgb(215,48,39)","rgb(244,109,67)","rgb(253,174,97)",
 "rgb(254,224,139)","rgb(255,255,191)","rgb(217,239,139)","rgb(166,217,106)",
 "rgb(102,189,99)","rgb(26,152,80)","rgb(0,104,55)"]

//var votingStdColor = "#1f77b4"

var votingColor = d3.scale.quantize()
    .domain([-1.0, 1.0])
    .range(d3.range(11).map(function(d) {  /*if(votingColorGR[d]===undefined)console.log(d);*/ return votingColorGR[d] ; }));



// = d3.scale.ordinal()
// 	.domain(partiesNames)
// 	.range(partiesColors);

var motions = {};  					// collection of motions  => { "tipo+numero+ano":{ rollCalls:{}, details:{} },...}
var datetimeRollCall = [];			// array of all rollCalls
var ideCadastroCollection = {};   	// collection of ideCadastro => { ideCadastro: [ Object deputyDetails ], ... }
var phonebook = Phonebook();		// module to index deputy names 

var cahmberOfDeputies = $.chamberOfDeputiesDataWrapper(motions, ideCadastroCollection, datetimeRollCall, phonebook);

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
		var deputiesScatterplot 	= d3.chart.deputiesScatterplot();
		// set html container
		deputiesScatterplot(d3.select('#canvasDeputies'));

		// when a set of deputies is selected
		deputiesScatterplot.on('selected', function(phonebookIDs){
			
			// select the set of deputies in the graph
			deputiesGraph.setSelectedDeputies(phonebookIDs);

			// set the agreement rate for each RollCall
			calcRollCallAgreement(rollCallInTheDateRange,phonebookIDs);
			rollCallsScatterplot.setDeputyVotingRate();

			calcDeputyPerState(phonebookIDs, brazilianStates.getStates())
			// TODO? display the distribution of the selected ( state-> unselecting all states)
			brazilianStates.selectedDeputies();
			
			/*partiesMap = {};
			selectedDeputies.forEach( function(deputy){ 
				if(partiesMap[deputy.party]===undefined) partiesMap[deputy.party]=0;

				partiesMap[deputy.party]++;
			});*/
		})

		// when an deputy element is hovered 
		// @param deputy 		: deputy Object  
		// @param mouseover 	: boolean  => true if mouseover : false if mouseout
		deputiesScatterplot.on('hover', function(deputy, mouseover){
			if(deputy!=null){
				// highlight the state of the deputy
				brazilianStates.highlightDeputyState( deputy.state , mouseover );
				// highlight the votes of the deputy in each roll call
				rollCallsScatterplot.highlightDeputyVotes( deputy.phonebookID , mouseover );
				// highlight the deputy in the graph
				deputiesGraph.highlightDeputy( deputy.phonebookID , mouseover );
			} 
		})

	// =====================================================================================
	// RollCalls Scatterplot ---------------------------------------------------------------
		var rollCallsScatterplot 	= d3.chart.rollCallsScatterplot();
		// set html container
		rollCallsScatterplot(d3.select('#canvasRollCalls'));

		rollCallsScatterplot.on('selected', function (RollCallsIds){
						
			if(RollCallsIds == null) {
				deputiesScatterplot.resetRollCallRates();
				deputiesGraph.resetRollCallRates();
				brazilianStates.resetRollCallRates();
			}
			else {
				var selectedRollCalls = [];
				
				RollCallsIds.forEach( function(i){ selectedRollCalls.push(rollCallNodes[i]) } )
				
				calcDeputyNodesHistogram(selectedRollCalls)

				deputiesScatterplot.setRollCallVotingRate();
				deputiesGraph.setRollCallVotingRate();

				calcStatesHistogram(selectedRollCalls, brazilianStates.getStates() )
				//calcStatesHistogram(selectedRollCalls, deputiesScatterplot.getSelectedDeputies() )
				brazilianStates.setStatesColor();
			}
		})

		rollCallsScatterplot.on('hover', function( rollCall, mouseover){
			if(rollCall!=null){
				// highlight the state of the deputy
				brazilianStates.highlightRollCall( rollCall , mouseover );
				// highlight the votes of the deputy in each roll call
				deputiesGraph.highlightRollCall( rollCall , mouseover );
				// highlight the deputy in the graph
				deputiesScatterplot.highlightRollCall( rollCall , mouseover );
			} 
		})

	// ====================================================================================
	// deputados Graph   ------------------------------------------------------------------
		var deputiesGraph = d3.chart.deputiesGraph();
		deputiesGraph(d3.select('#canvasGraph'));

		// when an deputy element is hovered 
		// @param deputy 		: deputy Object  
		// @param mouseover 	: boolean  => true if mouseover : false if mouseout
		deputiesGraph.on('hover', function(deputy, mouseover){
			if(deputy!=null){
				// highlight the state of the deputy
				brazilianStates.highlightDeputyState( deputy.state , mouseover );
				// highlight the votes of the deputy in each roll call
				rollCallsScatterplot.highlightDeputyVotes( deputy.phonebookID , mouseover );
				// highlight the deputy in the graph
				deputiesScatterplot.highlightDeputy( deputy.phonebookID , mouseover );
			} 
		})
	
	// ====================================================================================
	// RollCalls timeline ------------------------------------------------------------------
		var timelineBarChart = d3.chart.timelineBarChart();
		timelineBarChart(d3.select('#timeline'));

		// Set new range of dates!
		timelineBarChart.on("timelineFilter", function(filtered) { 
			console.log("filtered", filtered);
			setNewDateRange(filtered[0],filtered[1]);
		})

	// ====================================================================================
	// States timeline ------------------------------------------------------------------
		var brazilianStates 		= d3.chart.brazilianStates();
		brazilianStates(d3.select('#infographs'));

		brazilianStates
			.on('selected', function (state,op) {
				deputiesScatterplot.selectStates(state,op);
				//deputiesGraph.selectStates(states);
			})
			.on('hover', function (state){
				deputiesScatterplot.hoverState(state);
				deputiesGraph.hoverState(state);
			})


	// ====================================================================================
	// start query date
	var start = new Date(2012, 0, 1);
	var end   = new Date(); // == "now"

	setNewDateRange(start,end);



// ======================================================================================================================
// ======================================================================================================================

function setNewDateRange(start,end){
	deputyNodes =[];
	rollCallNodes =[];

	updateDataforDateRange(start,end, function(){
		
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

		//rollCallsTimeLine.data(datetimeRollCall)
		//rollCallsTimeLine.update();

		timelineBarChart.data(datetimeRollCall)
		timelineBarChart.update();

		//deputiesScatterplot.init();

	})
}

function updateDataforDateRange(start,end,callback){

	//scaleAdjustment.setSampling(deputiesInTheDateRange);

	// get the data (from db or already loaded in the dataWrapper)
	cahmberOfDeputies.setDateRange(start,end, function(arollCallInTheDateRange,adeputiesInTheDateRange){

		rollCallInTheDateRange = arollCallInTheDateRange;
		deputiesInTheDateRange = adeputiesInTheDateRange;

		// console.log(datetimeRollCall)
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
			deputyNodes = createDeputyNodes(SVDdata.deputies,filteredDeputies,end);
			// RollCalls array
			rollCallNodes = createRollCallNodes(SVDdata.voting,rollCallInTheDateRange);
		//

		//scaleAdjustment.testSampling(deputiesInTheDateRange);
		callback();
	}) // cahmberOfDeputies.setDateRange

}
//=========================================================================================================================
//=========================================================================================================================

function createDeputyNodes(data_deputies, selecteddeputies, endDate){
	
	for (var i = 0; i < selecteddeputies.length; i++) {
		selecteddeputies[i].scatterplot = data_deputies[i];
	};

	return selecteddeputies;
}

function createRollCallNodes(data_voting, rollCalls){
	
	 
	rollCalls.forEach(function(value, i) {
		value.scatterplot = data_voting[i];
	})

	return rollCalls;
}


function calcNumVotesHistogram(deputiesInTheDateRange){
	//number of votes of each deputy
	$.each(deputiesInTheDateRange, function(deputy){    deputiesInTheDateRange[deputy].numVotes = 0;  })
	rollCallInTheDateRange.forEach( function( entry ){
		if(entry.rollCall.votos == undefined){}// console.log("NO VOTES!('secret') -"+entry.rollCall.ObjVotacao)
		else {
			entry.rollCall.votos.Deputado.forEach( function(deputy){

				deputiesInTheDateRange[deputy.phonebookID].numVotes++;
				//else {console.log(deputy.Nome); console.log(entr)}
			})
		}
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


function calcRollCallAgreement(rollCalls,phonebookIDs){
	var mapSelectedDeputies = {}; 

	if(phonebookIDs != null) 
		 phonebookIDs.forEach(function(phonebookID){ mapSelectedDeputies[phonebookID]=true; })
	else deputyNodes.forEach( function(d){ mapSelectedDeputies[d.phonebookID]=true; })


	$.each(rollCalls, function(d){
		rollCalls[d].rate='noVotes'
		rollCalls[d].agreement = 0;
		
		if(rollCalls[d].rollCall.votos == undefined){}// console.log("NO VOTES!('secret') -"+entry.rollCall.ObjVotacao)
		else{
			var totalVotes=0, // total of votes
				votes = {};   // sum of each type

			rollCalls[d].rollCall.votos.Deputado.forEach( function (vote){
				
				// if deputy is selected count the vote 
				if(mapSelectedDeputies[vote.phonebookID]!== undefined){
					if( votes[vote.Voto] == undefined ) votes[vote.Voto]=0;
					
					votes[vote.Voto] ++;
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
		if(selectedRollCalls[d].rollCall.votos == undefined){}
		else{
			
			selectedRollCalls[d].rollCall.votos.Deputado.forEach( function (vote){
				var deputy = phonebook.getPhonebookOBJ(vote.phonebookID);
				
				if(deputy.votes === undefined) deputy.votes ={};
				if( deputy.votes[vote.Voto] === undefined ) deputy.votes[vote.Voto]=0;
				deputy.votes[vote.Voto]++;

			})
		}
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
	$.each(states, function(id){ states[id].votes={}; })

	$.each(selectedRollCalls, function(d){
		if(selectedRollCalls[d].rollCall.votos == undefined){}
		else{
			
			selectedRollCalls[d].rollCall.votos.Deputado.forEach( function (vote){
				var deputy = phonebook.getPhonebookOBJ(vote.phonebookID);
				
				//if(states[deputy.state]===undefined) console.log(deputy.state);
				//if(states[deputy.state].votes===undefined) states[deputy.state].votes={};

				if( states[deputy.state].votes[vote.Voto] === undefined ) states[deputy.state].votes[vote.Voto]=0;
				states[deputy.state].votes[vote.Voto]++;

			})
		}
	})

	$.each(states, function(id){

		if(Object.size(states[id].votes)==0) {states[id].votes = null;}
		else{
			if(states[id].votes['Sim'] === undefined) states[id].votes['Sim']=0;
			if(states[id].votes['Não'] === undefined) states[id].votes['Não']=0;
			var total = states[id].votes['Não'] + states[id].votes['Sim'];
			// agreement(%) is the number of votes in the major vote decision('Sim','Não',...) by the total of votes 
			states[id].rate = (states[id].votes['Sim']-states[id].votes['Não'])/total;
			
			//states[id].votes['Sim']=0;
			//states[id].votes['Não']=0;
		}
	})

	//return states;
}

function calcDeputyPerState(phonebookIDs, states){
	$.each(states, function(){ this.total=0; this.selected=0; })

	deputyNodes.forEach(function(d){
		states[d.state].total++;
		if(phonebookIDs==null) states[d.state].selected++;
	})

	if(phonebookIDs==null) return states;

	var phonebookIDsMAP = {};
	phonebookIDs.forEach( function(phonebookID){ phonebookIDsMAP[phonebookID]=true; })

	deputyNodes.forEach(function(d){
		if( phonebookIDsMAP[d.phonebookID] !== undefined ){
			states[d.state].selected++;
		}
	})
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
				

				if(rollCallEntry.rollCall.votos == undefined) console.log("NO VOTES('secret')! -"+rollCallEntry.rollCall.ObjVotacao)
				else{
					// for each vote in the roll call
					rollCallEntry.rollCall.votos.Deputado.forEach( function(deputy){

						var svdKey = deputiesInTheDateRange[deputy.phonebookID].svdKey;
						if(svdKey !== undefined){
							//if(votoStringToInteger[deputy.Voto]===undefined) console.log("'"+deputy.Voto+"'");

							tableDepXRollCall[svdKey][rollCallKey]=votoStringToInteger[deputy.Voto];

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