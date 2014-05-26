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
var votoStringToColor = {"Sim":"green","Não":"red","Abstenção":"purple","Obstrução":"blue","Art. 17":"yellow"}

var votingColorGR = ["rgb(165,0,38)","rgb(215,48,39)","rgb(244,109,67)","rgb(253,174,97)",
 "rgb(254,224,139)","rgb(255,255,191)","rgb(217,239,139)","rgb(166,217,106)",
 "rgb(102,189,99)","rgb(26,152,80)","rgb(0,104,55)"]

//var votingStdColor = "#1f77b4"

var votingColor = d3.scale.quantize()
    .domain([-1.0, 1.0])
    .range(d3.range(11).map(function(d) {  if(votingColorGR[d]===undefined)console.log(d); return votingColorGR[d] ; }));



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
	// start query date
	var start = new Date(2012, 0, 1);
	var end   = new Date(); // == "now"

	
	var rollCallInTheDateRange =[];
	var deputiesInTheDateRange ={};

	var deputyNodes =[];
	var rollCallNodes =[];

	// Deputies Scatterplot ----------------------------------------------------------------
		var deputiesScatterplot = d3.chart.deputiesScatterplot();
		// set html container
		var deputiesChartDispatch = deputiesScatterplot(d3.select('#canvasDeputies'));

		deputiesChartDispatch.on('selected', function(phonebookIDs){

			var selectedDeputies;
			if(phonebookIDs == null){ selectedDeputies = deputyNodes; }
			else{
				selectedDeputies = phonebookIDs.map(function(phonebookID){ return phonebook.getPhonebookOBJ(phonebookID);})
			}

			d3.selectAll('.node.deputy.graph').classed("selected", false);
			selectedDeputies.forEach( function(deputy){ d3.select("#deputy-g-"+deputy.phonebookID).classed("selected", true); } )


			calcRollCallAgreement(rollCallInTheDateRange,selectedDeputies)
			rollCallsScatterplot.update(null)

			/*partiesMap = {};
			selectedDeputies.forEach( function(deputy){ 
				if(partiesMap[deputy.party]===undefined) partiesMap[deputy.party]=0;

				partiesMap[deputy.party]++;
			});*/
		})

	// RollCalls Scatterplot ---------------------------------------------------------------
		var rollCallsScatterplot = d3.chart.rollCallsScatterplot();
		// set html container
		var rollCallChartDispatch = rollCallsScatterplot(d3.select('#canvasRollCalls'));

		rollCallChartDispatch.on('selected', function(ids){
			//console.log(ids)
			var idsMap = {};
			ids.forEach(function(id){ idsMap[id]=true; });

			var selectedRollCalls = [];
			rollCallNodes.forEach(function(rollCall){ if(idsMap[rollCall._id]) selectedRollCalls.push(rollCall);  })
			//console.log(selectedRollCalls)
			//console.log("chusme")

			calcDeputyNodesHistogram(selectedRollCalls)
			d3.selectAll(".node.deputy").style("fill", function(d) { 
				if(d.record !== undefined) d = d.record;

				if(d.rate == "noVotes"){return "#AAA"} else{return votingColor(d.rate) }
			});	
		})

	// deputados Graph 
		var deputiesGraph = d3.chart.deputiesGraph();
		deputiesGraph(d3.select('#canvasGraph'));

	// RollCalls timeline ------------------------------------------------------------------
		// var rollCallsTimeLine = d3.chart.rollCallsTimeLine()
		// // set html container
		// rollCallsTimeLine(d3.select('#timeline'))

		// rollCallsTimeLine.on("filter", function(filtered) {
		//  console.log("filtered", filtered);
		//  var date = d3.extent(filtered,function(d){return d.datetime})
		//  console.log(date)
		//  setNewDateRange(date[0],date[1]);
		// })
		var timelineBarChart = d3.chart.timelineBarChart();
		timelineBarChart(d3.select('#timeline'));

		// Set new range of dates!
		timelineBarChart.on("timelineFilter", function(filtered) { 
			console.log("filtered", filtered);
			setNewDateRange(filtered[0],filtered[1]);
		})


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

		deputiesChartDispatch.selected(null);

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

function calcRollCallAgreement(rollCallInTheDateRange,selectedDeputies){
	if(selectedDeputies === undefined) selectedDeputies = deputyNodes;
	var mapSelectedDeputies = {}; 
	selectedDeputies.forEach(function(deputy){ mapSelectedDeputies[deputy.phonebookID]=true; })

	$.each(rollCallInTheDateRange, function(d){
		
		rollCallInTheDateRange[d].agreement = 0;
		
		if(rollCallInTheDateRange[d].rollCall.votos == undefined){}// console.log("NO VOTES!('secret') -"+entry.rollCall.ObjVotacao)
		else{
			var totalVotes=0, // total of votes
				votes = {};   // sum of each type

			rollCallInTheDateRange[d].rollCall.votos.Deputado.forEach( function (vote){
				
				// if deputy is selected count the vote 
				if(mapSelectedDeputies[vote.phonebookID]!== undefined){
					if( votes[vote.Voto] == undefined ) votes[vote.Voto]=0;
					
					votes[vote.Voto] ++;
					totalVotes ++;
				}
			})

			 var maxAgree=0;
			 $.each(votes,function(v){ maxAgree = (votes[v] > maxAgree)? votes[v] : maxAgree })

			 if(votes['Sim'] === undefined) votes['Sim']=0;
			 if(votes['Não'] === undefined) votes['Não']=0;
			// agreement(%) is the number of votes in the major vote decision('Sim','Não',...) by the total of votes 
			rollCallInTheDateRange[d].agreement = maxAgree/totalVotes;
			rollCallInTheDateRange[d].rate = (votes['Sim']-votes['Não'])/totalVotes;
		}
	})

	// average - stddev
	var sum =0, sqrSum=0;
	$.each(rollCallInTheDateRange, function(d){ 
		sum += rollCallInTheDateRange[d].agreement; 
		sqrSum += Math.pow(rollCallInTheDateRange[d].agreement,2);  
	})
	var mean = sum/rollCallInTheDateRange.length;
	var stdev = Math.sqrt((sqrSum/rollCallInTheDateRange.length) - ( Math.pow(sum/rollCallInTheDateRange.length,2) ));
	return {mean:mean,stdev:stdev};
}

function calcDeputyNodesHistogram(selectedRollCalls){
	//console.log(selectedRollCalls)

	$.each(selectedRollCalls, function(d){
		if(selectedRollCalls[d].rollCall.votos == undefined){}
		else{
			
			selectedRollCalls[d].rollCall.votos.Deputado.forEach( function (vote){
				var deputy = phonebook.getPhonebookOBJ(vote.phonebookID);
				
				if(deputy.votes === undefined) deputy.votes = {};
				if( deputy.votes[vote.Voto] === undefined ) deputy.votes[vote.Voto]=0;
				deputy.votes[vote.Voto]++;

			})
		}
	})

	deputyNodes.forEach(function(deputy){

		if(deputy.votes===undefined) {deputy.rate = "noVotes";}
		else{
			if(deputy.votes['Sim'] === undefined) deputy.votes['Sim']=0;
			if(deputy.votes['Não'] === undefined) deputy.votes['Não']=0;
			var total = deputy.votes['Não'] + deputy.votes['Sim'];
			// agreement(%) is the number of votes in the major vote decision('Sim','Não',...) by the total of votes 
			deputy.rate = (deputy.votes['Sim']-deputy.votes['Não'])/total;
			
			deputy.votes['Sim']=0;
			deputy.votes['Não']=0;
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