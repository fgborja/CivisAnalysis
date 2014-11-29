////  ===================================================================================
////  ===================================================================================
////  functions to load data from camara.leg.br and save into the MongoDB

var chamberOfDeputiesManager= $.chamberOfDeputiesManager();
var chamberOfDeputies	= $.chamberOfDeputiesClientDB();

// call the callback function(tipo,numero,ano) for each
function forEachMotionRollCallinYear( year, callbackForEachMotionRollCalls ){
	// Use AJAX to get the voted motions...
	chamberOfDeputies.getMotionRollCallInYear( year, function( motionRollCallInYear ) {
		
		if(motionRollCallInYear != null ){ 
			for (var i = 0; i < motionRollCallInYear.data.proposicoes.proposicao.length; i++) {
				
				var arr = motionRollCallInYear.data.proposicoes.proposicao[i].nomeProposicao.match(/\w+/g);
				
				var tipo 	= arr[0];
				var numero	= arr[1];
				var ano		= arr[2];

				chamberOfDeputies.getMotionRollCalls(tipo,numero,ano,callbackForEachMotionRollCalls)
				
			}
		} 
		else {console.log("No data for "+year+" year!!")}

	})
}




// Check if all motions voted in the @param:year are loaded in the DB
// else call the manager to update/download this motion
function updateMotionsByYear(year) {
	// Use AJAX to get the voted motions...
	forEachMotionRollCallinYear(year, 
		function(motionRollCalls,tipo,numero,ano){

			// IF WE DID NOT FIND IN THE DB Load from CAMARA
			if(motionRollCalls === null){ 
				console.log(tipo+' '+numero+' '+ano);
				chamberOfDeputiesManager.obterVotacaoProposicao(tipo,numero,ano);
			}

			//check MotionDetails
			chamberOfDeputies.getMotionDetails(tipo,numero,ano, 
				function(motionDetails,tipo,numero,ano){
					// IF WE DID NOT FIND IN THE DB Load from CAMARA
					if(motionDetails === null){
						console.log(tipo+' '+numero+' '+ano);
						chamberOfDeputiesManager.obterProposicao(tipo,numero,ano);
						return true;
					} 
				}
			)
			return false;
		}
	)
	console.log('END')
}

ideCadastroMAP = {}; 
// asynch!! to load(or not) many years in the map
function getAllDeputiesIDs(year){
	
	forEachMotionRollCallinYear(year,
		function (motionRollCalls){
			chamberOfDeputies.iterateMotionRollCallsVotes(motionRollCalls, 
				function(deputyVote,rollCallId){
					ideCadastroMAP[deputyVote.ideCadastro]="ok";
				}
			)
		}
	)
}

//using the filled ideCadastroMAP 
function updateAllDeputiesInTheIdeCadastroMAP(){
	$.each(ideCadastroMAP, function(ideCadastro){ 
		console.log(ideCadastro)
		chamberOfDeputies.getDeputyDetails(ideCadastro, function (deputy){
			if(deputy == null) chamberOfDeputiesManager.obterDetalhesDeputado(ideCadastro);
		})
	})
}




/// =======================================================================================
/// =======================================================================================
// store the BD entries to JSON
//
// -execute:
//  LOAD_ALL_DATA()
//	saveDeputiesToFILE() 	//download the arrayDeputies
//	saveMotionsWithDelay()	// download the arrayMotions (1second for each motion) 
//  saveRollCallsArray()
//  --> you should minify all! (npm install json-minify)
function saveMotionsWithDelay(){
	saveEntriesOfArray(arrayMotions, function(motion){ return motion.type + motion.number + motion.year; }, 0)
}
function saveDeputiesToFILE(){
	console.save(arrayDeputies,'deputies.json');
}
function saveRollCallsArray(){
	arrayRollCalls.forEach( function (d) {
		d.datetime = new Date( d.datetime )
	});

	arrayRollCalls.sort(function(a,b){
		// Turn your strings into dates, and then subtract them
		// to get a value that is either negative, positive, or zero.
		return a.datetime - b.datetime;
	});

	console.save(arrayRollCalls,'arrayRollCalls.json');
}

var arrayMotions = [];
var arrayDeputies  = [];
var arrayRollCalls = [];

	var motionsMAP	 = {};
	var motionsCount = -1;
	function setMotion(motion){
		motion.tipo = motion.tipo.trim()
		motion.numero = motion.numero.trim()
		motion.ano = motion.ano.trim()
		motion.name = motion.tipo+motion.numero+motion.ano;
		if(motionsMAP[motion.name] === undefined){
			var newMotion = {}
			newMotion.type = motion.tipo;
			newMotion.number = motion.numero;
			newMotion.year = motion.ano;
			newMotion.date = motion.DataApresentacao;
			newMotion.author = motion.Autor;
			newMotion.amendment = motion.Ementa;
			newMotion.tags = motion.Indexacao;
			newMotion.status = motion.Situacao;
			newMotion.rollCalls = [];

			motionsMAP[motion.name] = motionsCount++;
			arrayMotions[motionsCount]= newMotion;

			return newMotion;
		}
	}

	var deputiesNAMES = {};
	var phonebookIDcount = 0;
	function setDeputy(deputy){
			deputy.district = deputy.UF.trim();
			deputy.name    = deputy.Nome.trim().toUpperCase();
			// correct misspelled 
			if( dict[deputy.name] !== undefined) deputy.name = dict[deputy.name];

			if(deputiesNAMES[deputy.name] === undefined) {

				var newDeputy = {};
				newDeputy.name = deputy.name;
				newDeputy.district = deputy.district;

				deputiesNAMES[newDeputy.name] = phonebookIDcount++; 
				arrayDeputies.push(newDeputy);
			}
			return deputiesNAMES[deputy.name];
	}

	function setRollCall(motion, motionRollCalls){

		if (motionRollCalls.Votacoes != null) {
			if (motionRollCalls.Votacoes.Votacao != null) {
				motionRollCalls.Votacoes.Votacao.forEach( function(votacao){

					// datetimeRollCall - array of all rollCalls
					var newDateTimeRollCall = {};
					newDateTimeRollCall.type = motionRollCalls.Sigla.trim();
					newDateTimeRollCall.year = motionRollCalls.Ano.trim();
					newDateTimeRollCall.number = motionRollCalls.Numero.trim();
					newDateTimeRollCall.datetime = votacao.datetime;
					arrayRollCalls.push(newDateTimeRollCall);

					// complete RollCall Object - inserted on the motion
					var newRollCall = {}
					newRollCall.datetime = votacao.datetime;
					newRollCall.obj = votacao.ObjVotacao ;
					newRollCall.summary = votacao.Resumo ;

					newRollCall.votes = [];
					//console.log(newRollCall)

					if(votacao.votos != undefined){
						votacao.votos.Deputado.forEach(function(deputado){
							var deputyID = setDeputy(deputado);
							var vote = {};
							vote.deputyID = deputyID;
							vote.vote     = CONGRESS_DEFINE.votoToInteger[deputado.Voto.trim()];
							vote.party    = deputado.Partido.trim();
							newRollCall.votes.push(vote)
						})
					}

					motion.rollCalls.push(newRollCall);
				})

			};
		};
	}


	function LOAD_ALL_DATA(){
		// load all motion details
		$.getJSON( '/getAllMotionsDetails', function( motionsDetails ) {
			if(motionsDetails === null) console.log('Could not load DB listAllMotions/');
			else{
				motionsDetails.forEach( function(motion){ 

					motion = setMotion(motion.proposicao) 
					// console.log(motion)
					$.chamberOfDeputiesClientDB().getMotionRollCalls(motion.type,motion.number,motion.year, 
						function(motionRollCalls){
							//console.log(motionRollCalls)
							setRollCall(motion, motionRollCalls.proposicao )
					})
				})
			

			}
		})
	}


var dict= { // found with Levenshtein Distance levDist() - misspelling deputies names
			'ANDRE VARGAS':'ANDRÉ VARGAS',
			'JOSE STÉDILE':'JOSÉ STÉDILE', 
			'DUDIMAR PAXIUBA':'DUDIMAR PAXIÚBA', 
			'MARCIO REINALDO MOREIRA':'MÁRCIO REINALDO MOREIRA', 
			'FELIX MENDONÇA JÚNIOR':'FÉLIX MENDONÇA JÚNIOR', 
			'FABIO TRAD':'FÁBIO TRAD', 
			'JOÃO PAULO  LIMA':'JOÃO PAULO LIMA', 
			'JERONIMO GOERGEN':'JERÔNIMO GOERGEN', 
			'JAIRO ATAIDE':'JAIRO ATAÍDE',
			'OSMAR  TERRA':'OSMAR TERRA', 
			'MARCIO MARINHO':'MÁRCIO MARINHO',
			'LAERCIO OLIVEIRA':'LAÉRCIO OLIVEIRA',
			'EMILIA FERNANDES':'EMÍLIA FERNANDES',
			'SIBA MACHADO':'SIBÁ MACHADO', 
			'JOAO ANANIAS':'JOÃO ANANIAS',
			'PADRE JOAO':'PADRE JOÃO',
			'JOSE HUMBERTO':'JOSÉ HUMBERTO',
			'ROGERIO CARVALHO':'ROGÉRIO CARVALHO',
			'JOSÉ  C. STANGARLINI':'JOSÉ C. STANGARLINI',
			'JOSÉ C STANGARLINI':'JOSÉ C. STANGARLINI', 
			'MANUELA DÁVILA':'MANUELA D`ÁVILA', 
			'CHICO DANGELO':'CHICO D`ANGELO', 
			'VANESSA  GRAZZIOTIN':'VANESSA GRAZZIOTIN', 
			'FRANCISCO TENORIO':'FRANCISCO TENÓRIO', 
			'CLAUDIO DIAZ':'CLÁUDIO DIAZ',
			'DR. PAULO CESAR':'DR. PAULO CÉSAR', 
			'ANDRE ZACHAROW':'ANDRÉ ZACHAROW',
			'ISAIAS SILVESTRE':'ISAÍAS SILVESTRE', 
			'LEO ALCÂNTARA':'LÉO ALCÂNTARA', 
			'CARLOS  MELLES':'CARLOS MELLES', 
			'DAVI ALVES SILVA JUNIOR':'DAVI ALVES SILVA JÚNIOR', 
			'WELINTON FAGUNDES':'WELLINGTON FAGUNDES',
			'WELLINTON FAGUNDES':'WELLINGTON FAGUNDES',
			'SERGIO CAIADO':'SÉRGIO CAIADO', 
			'TARCISIO ZIMMERMANN':'TARCÍSIO ZIMMERMANN',
			'CLAUDIO RORATO':'CLÁUDIO RORATO', 
			'MARCIO BITTAR':'MÁRCIO BITTAR', 
	}


/// =======================================================================================
/// =======================================================================================
//
//	 FUNCTIONS TO CALC TRACES/FLOWS
//
// calc the traces
var yearPartyExtent ={};
var partyTrace = {};

// watch only these
var filter = {PPR:true,PDS:true,PTB:true,PT:true,PSDB:true,DEM:true,PFL:true,PP:true,PPB:true,PMDB:true,PR:true,PL:true,PDT:true,PSB:true}

function calcThePartyTracesByLegislature( ){
	function calcOneLegislatureRecursive(i) { 

		if(legislatures.length == i){ return; }

		updateDataforDateRange( legislatures[i].start, legislatures[i].end , function(){

			// store parties trace
			var parties = calcPartiesSizeAndCenter(deputyNodes);
			$.each(parties, function(party){
				if(filter[party] === undefined) { delete parties[party] }
			});

			$.each(parties, function(party){
				if(partyTrace[party] === undefined) partyTrace[party] = {};

				partyTrace[party][i]={}
				partyTrace[party][i].center = this.center;
				partyTrace[party][i].size = this.size;

			})
			yearPartyExtent[i] = d3.extent( d3.entries(parties), function(d){ return d.value.center[1] });

			calcOneLegislatureRecursive(i+1);
		})

	};

	calcOneLegislatureRecursive(0);
}

function calcThePartyTracesByYear( periodOfYears ){
	var startYear = 1991, endYear = 2014;

	function calcOneYearRecursive(year) { 

		if(year > endYear){  return; }

		updateDataforDateRange( new Date(year,0,1), new Date(year+periodOfYears,0,1), function(){

			// store parties trace
			var parties = calcPartiesSizeAndCenter(deputyNodes);
			$.each(parties, function(party){
				if(filter[party] === undefined) { delete parties[party] }
			});

			$.each(parties, function(party){
				if(partyTrace[party] === undefined) partyTrace[party] = {};

				partyTrace[party][year]={}
				partyTrace[party][year].center = this.center;
				partyTrace[party][year].size = this.size;

			})
			yearPartyExtent[year] = d3.extent( d3.entries(parties), function(d){ return d.value.center[1] });
			
			calcOneYearRecursive(year+periodOfYears);
		})

	};

	calcOneYearRecursive(startYear);

}
calcThePartyTracesByYear(2); // calc by two years

function addTraceSVG(){

	var svg = 
		d3.select('#timeline').append('svg').attr({id:'traces',width:1188,height:500})
		
	var yearColumms = svg.append('g').attr({transform:'translate(30,0)'});

	function scaleX_middleOfYear(year) { return (timelineBarChart.scaleByX(new Date(year+1,0)) - timelineBarChart.scaleByX(new Date(year,0)))/2 + timelineBarChart.scaleByX(new Date(year,0)) }

	d3.range(1991,2015).forEach(function(year){ 
		yearColumms.append('path').attr({
			d: 'M '+scaleX_middleOfYear(year)+' 10 V 500',
			stroke:'grey',
			'stroke-dasharray':"10,10"
		})    
	})
	//yearColumms.append('text').text('Anti-Regime').attr({x:0,y:495, 'font-size':'10px'})
	//yearColumms.append('text').text('Pro-Regime').attr({x:0,y:20, 'font-size':'10px'})

}

function addDeputyTrace(){
		var scaleYearExtents ={};
		$.each(yearPartyExtent, function(year){
			scaleYearExtents[year] = d3.scale.linear()
										.domain(this)
										.range([460,70]);
										//.range([60, 440]);
		})

		function scale_middleOfLegislature(i){
			return (timelineBarChart.scaleByX(legislatures[i].end) - timelineBarChart.scaleByX(legislatures[i].start))/2 + timelineBarChart.scaleByX(legislatures[i].start);
		}
}

function drawPartyFlows (party, scaleX_middleOf) {

	var lineFunction = d3.svg.line()
		.x(function (d) { return d.x })
		.y(function (d) { return d.y })
		.interpolate("cardinal");

	var dataPath = [];

	d3.entries( party).forEach( function (d) {
		dataPath.push( {
			x: scaleX_middleOf (Number.parseInt(d.key)+1), 
			y: scaleYearExtents[d.key](d.value.center[1]) + d.value.size/2
		});
	});

	d3.entries( party ).reverse().forEach( function (d) {
		dataPath.push( {
			x: scaleX_middleOf(Number.parseInt(d.key)+1), 
			y: scaleYearExtents[d.key](d.value.center[1]) - d.value.size/2
		});
	});


	var lineGraph = yearColumms.append("path")
						.attr('class', 'chusme')
						.attr("d", lineFunction( dataPath ) + "Z")
						.attr("stroke", 'white' )
						.attr("stroke-width", 2)
						.attr("fill", CONGRESS_DEFINE.getPartyColor(party))
						.attr("opacity", 0.6);


}

function mergeObjects(obj1,obj2){
	var obj3 = {};
	for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
	for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
	return obj3;
}

partyTrace['DEM'] = mergeObjects(partyTrace['PFL'],partyTrace['DEM'])
partyTrace['PR'] = mergeObjects(partyTrace['PL'],partyTrace['PR'])
partyTrace['PP'] = mergeObjects(partyTrace['PPB'],partyTrace['PP'])

delete partyTrace['PFL'];
delete partyTrace['PL'];
delete partyTrace['PPB'];
delete partyTrace['PPR']; // ??

$.each( partyTrace, function(){ drawPartyFlows(this, scaleX_middleOfYear)})



/// PARTY HISTOGRAM 
//
//
var histogramBands = 10;
var deputiesHistogram = {};

var filter = {PPR:true,PDS:true,PTB:true,PT:true,PSDB:true,DEM:true,PFL:true,PP:true,PPB:true,PMDB:true,PR:true,PL:true,PDT:true,PSB:true}

function calcTheDeputyHistogramBy(year){
	function calcOneLegislatureRecursive(i) { 

		if(year) { if(i==2015) return; } 
		else if (legislatures.length == i){ return; }

		var start,end;
		if(year) { start = new Date(i,0); 		  end = new Date(i+1,0); }
		else 	 { start = legislatures[i].start; end = legislatures[i].end; }

		updateDataforDateRange( start, end, function(){

			deputiesHistogram[i]=  d3.range(histogramBands).map( function(){ return {} } );

			var histogramMap= d3.scale.quantize()
				.domain(d3.extent(deputyNodes, function(deputy) { return deputy.scatterplot[1]; }))
				.range(d3.range(histogramBands))
				
			// store deputy trace
			deputyNodes.forEach( function(deputy){ 
				if(filter[deputy.party]){
				
					var deputyBand = histogramMap(deputy.scatterplot[1])

					if( deputiesHistogram[i][deputyBand][deputy.party] === undefined)
						 deputiesHistogram[i][deputyBand][deputy.party] = 0;

					deputiesHistogram[i][deputyBand][deputy.party]++;
				}
			})

			calcOneLegislatureRecursive(i+1);
		})

	};

	if(year) calcOneLegislatureRecursive(1991);
	else calcOneLegislatureRecursive(0);

}
// RUN IT!
var deputiesHistogram = {};
calcTheDeputyHistogramBy( true );

function printHistogram ( timestep, scale_middleOfTimestep ) {

	var histogramStack = [];
	deputiesHistogram[timestep].forEach(function(band) {
	  histogramStack.push(d3.entries(band))
	});

	histogramStack.forEach( function(band){ 
		var x0=0; 
		band.parties = band.map(function(d){ d.x0=x0;d.x1=x0+=d.value; return d }) 
		band.total =  band.parties[band.parties.length - 1].x1;
	})

	var y = d3.scale.ordinal()
		.rangeRoundBands([0, 490], .1)
		.domain(d3.range(histogramBands) );

	var x = d3.scale.linear()
		.rangeRound([0, 50])
		.domain([0, d3.max(histogramStack, function(band) { return band.total; })])

	var band = yearColumms.selectAll(".state")
	  .data(histogramStack)
		.enter().append("g")
		  .attr("class", "g")
		  .attr("transform", function(d,i) { return "translate(0," + y(i) + ")"; });

	band.selectAll("rect")
	  .data(function(d) { return d.parties; })
	.enter().append("rect")
	  .attr("height", y.rangeBand())
	  .attr("x", function(d) { return  scale_middleOfTimestep(timestep) + x(d.x0); })
	  .attr("width", function(d) { return x(d.x1) - x(d.x0); })
	  .style("fill", function(d) { return getPartyColor(d.key); });

}
// print histogram by legislatures
d3.range(6).forEach( function(i){ printHistogram( i, scale_middleOfLegislature)})
// print histogram by years
d3.range(1991,2015).forEach( function(i){ printHistogram( i, scaleX_middleOfYear)})






/// =======================================================================================
/// =======================================================================================
//
//	 FUNCTIONS TO CALC DEPUTIES history , pre-calc
//
// it should have deputies with the constant deputyID  == arrayDeputies
// it should have rollCalls with the constant RollCallID  == arrayRollCalls

function calcPreSetsHistory(type){
	function calcRecursive(i) { 
		console.log(i)

		if(type == 'year') { if(i==CONGRESS_DEFINE.endingYear+1) return; } 
		else if(type == 'legislature') 	{ if (CONGRESS_DEFINE.legislatures.length == i){ return; } }
		else if(type == 'president')  	{ if (CONGRESS_DEFINE.presidents.length == i){ return; } }

		var start,end;
		if(type == 'year') { start = new Date(i,0); 		  end = new Date(i+1,0); }
		else if(type == 'legislature') 	{ start = CONGRESS_DEFINE.legislatures[i].period[0]; end = CONGRESS_DEFINE.legislatures[i].period[1]; }
		else if(type == 'president')  	{ start = CONGRESS_DEFINE.presidents[i].period[0]; end = CONGRESS_DEFINE.presidents[i].period[1]; }


		updateDataforDateRange( [start, end] , function(){

			var filteredDeputies = filterDeputies( deputiesInTheDateRange, rollCallInTheDateRange)
			var SVDdata = calcSVD(filteredDeputies,rollCallInTheDateRange);
		
			// Deputies array
			deputyNodes = createDeputyNodes(SVDdata.deputies,filteredDeputies);
			// RollCalls array
			rollCallNodes = createRollCallNodes(SVDdata.voting,rollCallInTheDateRange);
			// Adjust the SVD result to the political spectrum
			scaleAdjustment().setGovernmentTo3rdQuadrant(deputyNodes,rollCallNodes,end);

			calcRollCallRate(rollCallNodes,null)
				
			// STORE OBJECT - TO SAVE
			var storeCalcObject = {deputyNodes:[],rollCallNodes:[]};
			
			// store deputy trace
			deputyNodes.forEach( function(deputy){ 
				deputy.scatterplot[0]= Number(deputy.scatterplot[0].toPrecision(4));
				deputy.scatterplot[1]= Number(deputy.scatterplot[1].toPrecision(4));

				var storeDeputyTrace ={
					deputyID : deputy.deputyID,
					scatterplot : deputy.scatterplot,
					party: deputy.party 
				};

				storeCalcObject.deputyNodes.push(storeDeputyTrace)	
			})
			// store roll calls
			rollCallNodes.forEach( function (rollCall) {

				rollCall.scatterplot[0]= Number(rollCall.scatterplot[0].toPrecision(4));
				rollCall.scatterplot[1]= Number(rollCall.scatterplot[1].toPrecision(4));

				var storeRollCallTrace ={
					rollCallID: rollCall.rollCallID,
					scatterplot: rollCall.scatterplot,
					rate       : (rollCall.rate == 'noVotes')? 'noVotes' : Number(rollCall.rate.toPrecision(4))
				};

				storeCalcObject.rollCallNodes.push(storeRollCallTrace)	
			})

			// SAVE!!
			if(type) console.save(storeCalcObject, type+'.'+i+'.json');
		//====================================
			calcRecursive(i+1);
		})

	};

	if(type == 'year') calcRecursive(CONGRESS_DEFINE.startingYear);
	else calcRecursive(0);
}