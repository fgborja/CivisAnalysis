////  ===================================================================================
////  ===================================================================================


var chamberOfDeputiesManager= $.chamberOfDeputiesManager();
var chamberOfDeputies	= $.chamberOfDeputiesClient();

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
				return true;
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
		var chusme = chamberOfDeputiesManager.obterDetalhesDeputado(ideCadastro)
		if(chusme === null) console.log( ideCadastro +" é chusme!")
	
	})
}




/// =======================================================================================
/// =======================================================================================


	var arrayMotions = [];
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
	var arrayDeputies  = [];
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

	//var arrayRollCalls = [];
	// var rollCallsMAP	 = {};
	// var rollCallsCount = 0;
	var votoToInteger = {"Sim":0,"Não":1,"Abstenção":2,"Obstrução":3,"Art. 17":4,"Branco":5}
	function setRollCall(motion, motionRollCalls){

		if (motionRollCalls.Votacoes != null) {
			if (motionRollCalls.Votacoes.Votacao != null) {
				motionRollCalls.Votacoes.Votacao.forEach( function(votacao){

					var newRollCall = {}
					// newRollCall.type = motionRollCalls.Sigla.trim();
					// newRollCall.year = motionRollCalls.Ano.trim();
					// newRollCall.number = motionRollCalls.Numero.trim();
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
							vote.vote     = votoToInteger[deputado.Voto.trim()];
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

	function stringify_ALL_DATA(){
		console.log(JSON.stringify(arrayMotions))
		console.log(JSON.stringify(arrayDeputies))
		console.log(JSON.stringify(arrayRollCalls))
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