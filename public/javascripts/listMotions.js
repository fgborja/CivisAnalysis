
// GetRollCall from camara
function getRollCall(event) {
	
	// Prevent Link from Firing
	event.preventDefault();

	$('#jsonProp').text("");

	// Retrieve data from link rel attribute
	var thisName = $(this).attr('rel');

	var arr = thisName.match(/\w+/g);

	$.getJSON( '/ObterVotacaoProposicao/'+arr[0]+'/'+arr[1]+'/'+arr[2], function( data ) {
		//$('#jsonProp').text( JSON.stringify(data))
		console.log(data)
	})


};

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