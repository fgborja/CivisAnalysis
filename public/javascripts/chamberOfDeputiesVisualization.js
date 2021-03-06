var dimRedTechnique = 'svd'; // tsne
var tsneOpt = null;

partiesInfo.init();

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
	$('#main').animate({height: 0},1000,function(){ $('#main').hide()})

	timeline
		.data(arrayRollCalls)
		.update();
});

// ======================================================================================================================
// LAUNCH APP ===========================================================================================================
	var radius = 3.7;
	var radiusHover = radius*2;

	// deputies and rollCalls found in the date range 
	var rollCallInTheDateRange =[];
	var deputiesInTheDateRange ={};

	// deputies and rollCalls to plot 
	var deputyNodes =[]; // (filtered)
	var rollCallNodes =[];

	var parties = {};

	// MAIN CANVAS (where all the visualization will be appended)
	var canvasViewBox = {width:580,height:460, toSting: function(){ return '0 0 '+canvasViewBox.width+' '+canvasViewBox.height }};
	var canvasDimension = { 
		height: Math.min($(window).height()*0.77,$('#canvas').width()*0.8) , 
		width:$('#canvas').width() ,
		viewBox: canvasViewBox.toSting()
	};
	var canvasSVG = d3.select('#canvas').append('svg').attr(canvasDimension);


	// ====================================================================================
	// States Labels   --------------------------------------------------------------------
		var labelManager = d3.chart.labelManager();
		labelManager(canvasSVG, 
			{
				x:0, y:0, 
				partiesLabel: {x:0, y:0, width: 0, height:0 },
				deputiesLabel: {x:canvasViewBox.width*0.5 -30, y:canvasViewBox.height/2-30, width: canvasViewBox.width*0.35, height:0 },
				RollCallsLabel: {x:0, y:0, width: 0, height:0 }
			} 
		)
		labelManager.on('update', updateDeputies);
	// ====================================================================================

	// =====================================================================================
	// Chamber Of Deputies Infographic -----------------------------------------------------
	//
		var chamberInfographic = d3.chart.chamberInfographic();
		chamberInfographic( canvasSVG ,{direction:'horizontal' ,x:14, y:97, width: canvasViewBox.width-200, height: canvasViewBox.height*0.53 });

		chamberInfographic
			.on('update', updateDeputies )
	// =====================================================================================


	// =====================================================================================
	// Deputies Scatterplot ----------------------------------------------------------------
	//
		var deputiesScatterplot = d3.chart.deputiesScatterplot();
		var deputiesScatterplotDimensions = {direction:'horizontal', x:10, y:canvasViewBox.height*0.62, width: canvasViewBox.width-14, height: canvasViewBox.height*0.4, radius: radius};
		deputiesScatterplot(canvasSVG, deputiesScatterplotDimensions);

		deputiesScatterplot
			.on('update', updateDeputies )
			.on('cuttingPlane', function(rollCall) {
				rollCallsScatterplot.showCuttingPlane(rollCall);
			});
	// ====================================================================================


	// ====================================================================================
	// States Infographic -----------------------------------------------------------------
		var brazilianStates = d3.chart.brazilianStates();
		brazilianStates.width($('#chamber').width()/*canvasDimension.height*0.5*/)
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
		rollCallsScatterplot(d3.select('#canvasRollCalls'), {width:$('.col-md-6').width(),height:canvasDimension.height*0.5 });
	//
	// interactions
		rollCallsScatterplot
			.on('update', updateRollCalls )
			// .on('cuttingPlane', function(deputy) {
			// 	deputiesScatterplot.showCuttingPlane(deputy);
			// });
	// ====================================================================================


	// ====================================================================================
	// RollCalls timeline -----------------------------------------------------------------
	//
	// init
		var timeline = d3.chart.timeline();
		timeline(d3.select('#timeline'), 
					$('#timeline').width(), //width
					$(window).height()*0.6  // height
				);
	//
	// interactions
		timeline
			// Set new range of dates!
			.on("timelineFilter", function(filtered) { 

				$('#main').show().animate({height: $('#canvas').height()+50},1000)
				console.log("filtered", filtered);
				//$('#loading').css('visibility','visible');
				$('span#startDate').text(filtered[0].toLocaleDateString());
				$('span#endDate').text(filtered[1].toLocaleDateString());

				setNewDateRange(filtered, 
					function(){
						$('a#deputies').text(deputyNodes.length + ' Deputies ');
						$('a#rollCalls').text(rollCallNodes.length + ' Roll Calls ');
						$('tspan#totalDeputies').text( 
							(Object.size(deputiesInTheDateRange) > 0)?
							' (out of '+ Object.size(deputiesInTheDateRange) + ') in '
							:
							' in '
						);

						var keepSelection = $('#btn-lockDeputies').hasClass('btn-danger');
						// reset rates
						deputyNodes.forEach( function(deputy) { 
							deputy.rate = null; 
							deputy.vote = null; 
							if(deputy.selected === undefined) deputy.selected = false;

							deputy.selected = (keepSelection)?  
								selectionModule.isDeputySelected(deputy.deputyID) 
								: 
								true; 
						})

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
			.on("setAlliances", function(d) { 
				// SET THE PARTIES COLORS ACORDING TO EACH ALLIANCE
					if(d==null) CONGRESS_DEFINE.getPartyColor = CONGRESS_DEFINE.getConstantPartyColor;
					else {
						var partiesColigationColor = {};
						$.each(d.alliances, function(i){
							$.each(d.alliances[i].parties, function(party){ return partiesColigationColor[d.alliances[i].parties[party]]= CONGRESS_DEFINE.getPartyColor( d.alliances[i].parties[0] )  })
						});
						CONGRESS_DEFINE.getPartyColor = function(party){ 
							if(partiesColigationColor[party] !== undefined ) 
								{return partiesColigationColor[party];}
							else{ /*console.log(party);*/ return "#AAA" }
						}
					}
					
					if(deputiesScatterplot.data() !== undefined){
						deputiesScatterplot.update();
						chamberInfographic.setAlliances(d)
						chamberInfographic.update();
					}

					d3.selectAll('.step').style('fill', function (d) { return CONGRESS_DEFINE.getPartyColor(d.value.party) })

				if(d != null){
					var tableContent = '';
					$.each(d.alliances, function(i){
						tableContent += '<div class="col-md-3 alliance" style="word-wrap: break-word; margin-bottom:15px;">';
						tableContent += 
							'<div class="col-md-12 no-padding">'+
							'<div class="col-md-2 no-padding"><h4><span class="color-preview" style="background-color: '+ CONGRESS_DEFINE.getConstantPartyColor(d.alliances[i].parties[0])+';"></span></h4></div>'+
							'<h4>'+d.alliances[i].name+'</h4>'+
							'</div>';
						tableContent += '<div class="col-md-12>">';
						tableContent += '<div>'+(d.alliances[i].result[0]*100).toFixed(2)+' %</div>';
						tableContent += '<div>'+ ((d.alliances[i].result[1] === undefined)? '-' : (d.alliances[i].result[1]*100).toFixed(2) +'%')+ '</div>';
						tableContent += '<div>'+d.alliances[i].president+ '</div>';
						tableContent += '<div>'+ $.map(d.alliances[i].parties, function(party){ return ' '+party}) +'</div>';
						// tableContent += '<td>' + this.email + '</td>';
						// tableContent += '<td><a href="#" class="linkdeleteuser" rel="' + this._id + '">delete</a></td>';
						tableContent += '</div>';			
						tableContent += '</div>';			
					});
					var html = 
					'<div id="content" style="display: none;">' +
						'<div>'+
							'<text style="font-size:x-large;">Brazilian Presidential Election of '+d.name+'</text>'+
							'<a class="reset" href="javascript:timeline.resetAlliances()">close</a>'+
						'</div>'+
						tableContent +
					'</div>';

					$('#timelineInfo').append(html)
					$('#timelineInfo #content').show('slow')
				}else{
					$('#timelineInfo').children().hide('fast', function(d) {
						$(this).remove();
					})
				}

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
	$('#rollCallInfo').html('')
	$('#rollCallInfo').attr({style:"opacity:0"})
	deputiesScatterplot.showRollCallCuttingPlane(null)

	var selectedRollCalls = [];
	var hoveredRollCalls = [];
	rollCallNodes.forEach(function (rollCall) { 
		if(rollCall.selected) selectedRollCalls.push(rollCall);  
		if(rollCall.hovered) hoveredRollCalls.push(rollCall);
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
		// ONLY ONE ROLL CALL SELECTED || HOVER
		if( (hoveredRollCalls.length==1) || (selectedRollCalls.length==1) ){ 

			deputyNodes.forEach( function (deputy) { deputy.vote = 'null'; })

			var rollCall = (hoveredRollCalls.length==1)? hoveredRollCalls[0] : selectedRollCalls[0];
			// set the deputy votes
			rollCall.votes.forEach( function (deputyVote) {
				deputiesInTheDateRange[deputyVote.deputyID].vote = deputyVote.vote;
			})
			
			$('#rollCallInfo').html(
				'<div class="panel panel-default" style="margin-top:5px; ">'+  	
				  '<div class="panel-body" style="overflow-y:scroll; height: '+(rollCallsScatterplot.height()-5)+'px; font-size: small;">'+
					'<h5>'+"Roll Call - "+rollCall.type+' '+rollCall.number+'/'+rollCall.year+" : "+ rollCall.datetime.toLocaleString()+'</h5>'+
					((rollCall.summary != '')?"Status: "+rollCall.summary+'<br/>':'')+
					"Amendment: "+motions[rollCall.type+rollCall.number+rollCall.year].amendment +'<br/><br/>'+
					"Tags: "+motions[rollCall.type+rollCall.number+rollCall.year].tags +
				  '</div>'+
				'</div>'
			)

			selectedRollCalls = [rollCall];

			deputiesScatterplot.showRollCallCuttingPlane({
					name: rollCall.type+' '+rollCall.number+'/'+rollCall.year, 
					coord: [
						rollCallsScatterplot.scale().x(rollCall.scatterplot[1])/ rollCallsScatterplot.dim().width, 
						rollCallsScatterplot.scale().y(rollCall.scatterplot[0])/ rollCallsScatterplot.dim().height
					] 
				});
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
	$('#rollCallInfo').animate({opacity: 1},200)
}

function updateDeputies(){
	var selectedDeputies = [];
	var hoveredDeputies = [];
	rollCallsScatterplot.showDeputyCuttingPlane(null);
	deputyNodes.forEach(function (deputy) { 
		if(deputy.selected) selectedDeputies.push(deputy);  
		if(deputy.hovered) hoveredDeputies.push(deputy);
	})

	// IF the deputies are locked a new selection will unlock the selection
	if(d3.select('#btn-lockDeputies').classed('btn-danger')){
		// check if there is a new selection
		deputyNodes.forEach(function (deputy) {
			// if there is any disparity between the selections
			if( selectionModule.isDeputySelected(deputy.deputyID) !== deputy.selected )
				// unlock deputies
				d3.select('#btn-lockDeputies').classed('btn-danger',false);
		})
	}

	// IF all Deputies are selected disable buttons (reset,list,lock)
	if(selectedDeputies.length == deputyNodes.length){
		d3.selectAll('.btn-deputiesSelected').classed('disabled',true);
	}
	else d3.selectAll('.btn-deputiesSelected').classed('disabled',false);

	// SET RollCall votes  ----------------------------------------------------------------------
		rollCallNodes.forEach( function(rollCall){
			rollCall.vote = null; 
			rollCall.rate = null; 
		})

		// show the votes of one deputy
		if( (hoveredDeputies.length==1) || (selectedDeputies.length==1) ){
			// get the deputy id
			var deputy = (hoveredDeputies.length==1)? hoveredDeputies[0] : selectedDeputies[0];
			// set the deputy vote for each rollCall
			rollCallNodes.forEach( function(rollCall){
				rollCall.vote = 'null'
				rollCall.votes.forEach( function(vote){
					if(vote.deputyID == deputy.deputyID){
						rollCall.vote = vote.vote;
					}
				})
			})
			rollCallsScatterplot.showDeputyCuttingPlane({
				name: deputy.name, 
				coord: [
					deputiesScatterplot.scale().x(deputy.scatterplot[1])/ deputiesScatterplot.width(), 
					deputiesScatterplot.scale().y(deputy.scatterplot[0])/ deputiesScatterplot.height()
				] 
			});
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
function setNewDateRange(period,setNewDateRangeCallback){
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

	$('#loading').css('visibility','visible');
	
	if(precalc.found) {
		$('#loading #msg').text('Loading Data');
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
			$('#loading').css('visibility','hidden');
			setNewDateRangeCallback()
		})
	}

	// update the data for the selected period
	updateDataforDateRange(period, function(){
		// if the precal was found we dont need to calc the SVD
		if(!precalc.found) {
			filteredDeputies = filterDeputies( deputiesInTheDateRange, rollCallInTheDateRange)
			matrixDeputiesPerRollCall = createMatrixDeputiesPerRollCall(filteredDeputies,rollCallInTheDateRange)
			
			function calcCallback(twoDimData) {
				// Create the arrays to D3 plot (TODO set to var var var); ---------------------------------------------------------------
				// Deputies array
				deputyNodes = createDeputyNodes(twoDimData.deputies,filteredDeputies);
				// RollCalls array
				rollCallNodes = createRollCallNodes(twoDimData.voting,rollCallInTheDateRange);
				// Adjust the SVD result to the political spectrum
				scaleAdjustment().setGovernmentTo3rdQuadrant(deputyNodes,rollCallNodes,period[1]);

				calcRollCallRate(rollCallNodes,null)

				$('#loading').css('visibility','hidden');
				setNewDateRangeCallback();
			}

			// var twoDimData;
			if(dimRedTechnique == 'svd'){
				$('#loading #msg').text('Gerating Political Spectra by SVD');
				setTimeout(	function(){calcSVD(matrixDeputiesPerRollCall,calcCallback)}, 10);
			} else if(dimRedTechnique == 'tsne'){
				$('#loading #msg').text('Generating Political Spectra by t-SNE');
				calcTSNE(matrixDeputiesPerRollCall,calcCallback);
			}
			dimRedTechnique='svd'; // return to svd
		}
	})
}

function updateDataforDateRange(period,callback){
	$('#loading #msg').text('Loading Data');
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
function createMatrixDeputiesPerRollCall (deputies,rollCalls){
	// -------------------------------------------------------------------------------------------------------------------
	// Create the matrix [ Deputy ] X [ RollCall ] => table[Deputy(i)][RollCall(j)] = vote of deputy(i) in the rollCall(j)
		console.log("create matrix deputy X rollCall!!")
		var tableDepXRollCall = numeric.rep([ deputies.length, rollCalls.length],0)

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
	return tableDepXRollCall;
}

function calcSVD(matrixDepXRollCall,endCalcCallback){
	// -----------------------------------------------------------------------------------------------------------------
	// CALC the Singular Value Decomposition (SVD) ---------------------------------------------------------------------
		console.log("calc SVD",matrixDepXRollCall)
		
		//!! Uncaught numeric.svd() Need more rows than columns
		//  if(rows < columns)-> 
		var transposeToSVD = (matrixDepXRollCall.length < matrixDepXRollCall[0].length)? true : false;

		if(transposeToSVD){
			//TRANSPOSE the table to fit the rowsXcolumns numeric.svd() requirement !!
			matrixDepXRollCall = numeric.transpose(matrixDepXRollCall)  
		}

		var svdDep = numeric.svd(matrixDepXRollCall);
		var eigenValues = numeric.sqrt(svdDep.S);

		if(transposeToSVD){matrixDepXRollCall = numeric.transpose(matrixDepXRollCall)};

		//Uncaught numeric.svd() Need more rows than columns  numeric.transpose()
		if(transposeToSVD){
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
	var result = {deputies: data_deputies, voting: data_voting};
	endCalcCallback(result);
}
function calcTSNE(matrixDepXRollCall,endCalcCallback){
	// -----------------------------------------------------------------------------------------------------------------
		//console.log(tsneOpt)
		console.log('START TSNE');
		var opt = {epsilon: 10, perplexity: 30, dim: 2};
		if(tsneOpt != null){
			opt.perplexity = tsneOpt.perplexity;
			opt.epsilon = tsneOpt.learningRate;
		}
		var T = new tsnejs.tSNE(opt); // create a tSNE instance
		T.initDataRaw(matrixDepXRollCall);

		var opt1 = {epsilon: 10, perplexity: 30, dim: 2};
		var X = new tsnejs.tSNE(opt1); // create a tSNE instance
		var matrixRollCallXDep = numeric.transpose(matrixDepXRollCall) 
		X.initDataRaw(matrixRollCallXDep);
		
		var intervalT = setInterval(stepT, 5);
		function stepT() {
			var cost = T.step(); // do a few steps
			//console.log("iteration Y " + T.iter + ", cost: " + cost);
		}
		var intervalX = setInterval(stepX, 5);
		function stepX() {
			var cost = X.step(); // do a few steps
			//console.log("iteration X " + X.iter + ", cost: " + cost);
		}

		var result = {deputies: [], voting: []};

		setTimeout(function(){
			clearInterval(intervalT);
			result.deputies = T.getSolution();
		},tsneOpt.iterationSec*1000)

		setTimeout(function(){
			clearInterval(intervalX);
			result.voting = X.getSolution(); 
		},tsneOpt.iterationSec*1000)

		setTimeout(function () {
			endCalcCallback(result);
		},tsneOpt.iterationSec*1000+300)

		console.log("CALC TSNE- FINISHED!! => PLOT")
	// ----------------------------------------------------------------------------------------------------------------
	// return {deputies: data_deputies, voting: data_voting};
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


// INIT HTML + JS COMPONENTS
$('a#deputies').mouseover(function () { 
	deputyNodes.forEach( function (deputy) { 
		deputy.hovered = true; 
	}); 
	deputiesScatterplot.update();
	chamberInfographic.update();
});
$('a#deputies').mouseout(function () {
	deputyNodes.forEach( function (deputy) { 
		deputy.hovered = false;
	}); 
	deputiesScatterplot.update();
	chamberInfographic.update();
});
$('a#rollCalls').mouseover(function () {
	rollCallNodes.forEach( function (rollCall) {
		rollCall.hovered = true; 
	}); 
	rollCallsScatterplot.update();
});
$('a#rollCalls').mouseout(function () {
	rollCallNodes.forEach( function (rollCall) { 
		rollCall.hovered = false;
	}); 
	rollCallsScatterplot.update();
});

var selectionModule = $.selectionModule();
$('#btn-lockDeputies').click(function() {
	$(this).toggleClass('btn-danger');

	if(d3.select('#btn-lockDeputies').classed('btn-danger')){
		selectionModule.resetSelection();

		deputyNodes.forEach(function (deputy) {
			if(deputy.selected) selectionModule.setSelectDeputy(deputy.deputyID)
		})
	}
})

// Timeline settings buttons ----------
	$('#cluttered').on('click',function(){ 
		if(!$('#cluttered').hasClass('active')){
			timeline.setDrawingType("cluttered"); 
			$('#cluttered').toggleClass('active');
			$('#uncluttered').toggleClass('active');
		} 
	})
	$('#uncluttered').on('click',function(){ 
		if(!$('#uncluttered').hasClass('active')){
			timeline.setDrawingType("uncluttered"); 
			$('#uncluttered').toggleClass('active');
			$('#cluttered').toggleClass('active');
		} 
	})

// -----------------------------------------------------------------------------------------------------------------------
function colorsReDraw(){
	partiesInfo.refreshInputColors();
	timeline.reColorPresidents();
	timeline.drawParties();
	updateDeputies();
}