//var legislatura = [54:[2011,2012,2013,2014],53:[2010,2009,2008,2007],52:[2006,2005,2004,2002]] ;//51:[2001,2000,1999,1998]

// motionRollCalls <==> obterVotacaoProposicao  ... all roll calls of one motion

// MODULE to manage the db-camara in MongoDB. 
// update and insert values in DB from camara.gov 
(function($) {
	$.chamberOfDeputiesManager = function() {
		var chamberOfDeputiesManager = {

			getObterDetalhesDeputado	: function (idecadastro){
				if(idecadastro=="")console.log("should not have null idecadastro :(");
				$.getJSON( './obterDetalhesDeputado/'+idecadastro, function( data ) {
					return data;
				})
			},
			getObterVotacaoProposicao	: function (tipo,numero,ano){
				$.getJSON( './obterVotacaoProposicao/'+tipo+'/'+numero+'/'+ano, function( data ) {
					return data;
				})
			},
			getObterProposicao 	: function (tipo,numero,ano){
				$.getJSON( './obterProposicao/'+tipo+'/'+numero+'/'+ano, function( data ) {
					return data;
				})
			},
			getlistarProposicoesVotadasEmPlenario 	: function (year){
				$.getJSON( './listarProposicoesVotadasEmPlenario/'+year, function( data ) {
					return data;
				})
			}

        };

        return {
        	obterDetalhesDeputado	: 	chamberOfDeputiesManager.getObterDetalhesDeputado,
        	obterVotacaoProposicao	: 	chamberOfDeputiesManager.getObterVotacaoProposicao,
        	obterProposicao			: 	chamberOfDeputiesManager.getObterProposicao,
        	listarProposicoesVotadasEmPlenario : chamberOfDeputiesManager.getlistarProposicoesVotadasEmPlenario
        };
    };
})(jQuery);

// module to extract and interact with the chamberOfDeputies information on BD

(function($) {
	$.chamberOfDeputiesClientDB = function() {
		var chamberOfDeputiesClient = {

			// Object to identify the Motion==Proposicao
			motionIdObj		: function (tipo,numero,ano){ return {tipo:tipo,numero:numero,ano:ano}  }, 
			
			//Object to identify the RollCall==Votacao
			rollCallIdObj	: function (tipo,numero,ano,votingNum){ 
				
				var rollCallId = this.motionIdObj(tipo,numero,ano);
				rollCallId.votingNum = votingNum;

				return rollCallId;
			}, 

			getMotionRollCallInYear	: 	function (year,callback){
				$.getJSON( '/getMotionRollCallInYear/'+year, function( motionRollCallInYear ) {
					callback(motionRollCallInYear);
				})
			},

			getMotionRollCalls	:	function (tipo,numero,ano,callback){
				$.getJSON( '/getMotionRollCalls/'+tipo+'/'+numero+'/'+ano, function( motionRollCalls ) {
					if(motionRollCalls === null) console.log('Could not load DB getMotionRollCalls/'+tipo+'/'+numero+'/'+ano);
					callback(motionRollCalls,tipo,numero,ano);
				})
			},

			getMotionDetails	: 	function (tipo,numero,ano,callback){
				$.getJSON( '/getMotionDetails/'+tipo+'/'+numero+'/'+ano, function( motionDetails ) {
					if(motionDetails === null) console.log('Could not load getMotionDetails/'+tipo+'/'+numero+'/'+ano);
					callback(motionDetails,tipo,numero,ano);
				})
			},

			getDeputyDetails	: 	function (idecadastro,callback){
				$.getJSON( '/getDeputyDetails/'+idecadastro, function( deputyDetails ) {
					callback(deputyDetails);
				})
			},

			getOcurrencesOfRollCalls	: 	function (callback){
				$.getJSON( '/getOcurrencesOfRollCalls', function( ocurrencesOfRollCalls ) {
					callback(ocurrencesOfRollCalls);
				})
			},

			// getMotionRollCallsDate return the motions (and respective roll calls) that have roll calls voted in the date range
			//  Note: some motion have multiple roll calls, some of them are not in the date range.
			getMotionRollCallsDate	: 	function (startDate,endDate,callback){
				// If it is, compile all user info into one object
				//var start = new Date(2013, 0, 1,0,0,0,0);
				//var end   = new Date(2013, 4, 1,0,0,0,0);

				// Use AJAX to post the object to our adduser service
				$.ajax({
				  type: 'POST',
				  data: { 'start': startDate.toISOString(), 'end':  endDate.toISOString() },
				  url: '/getMotionRollCallsDate',
				  dataType: 'JSON'
				}).done(function( motionRollCallsArray ) {
					callback(motionRollCallsArray);
				});
			},


			// get a motionRollCalls list and iterate each roll call calling iterateRollCallVotes()
			iterateMotionRollCallsVotes: function (motionRollCalls,callbackForEachVote){
				if(motionRollCalls===null) return {};
				if(isArray(motionRollCalls.proposicao.Votacoes.Votacao)){
					//(only way to reference 'this' inside .each??)
					var that = this; 
					// this motion have many* roll calls - iterate.each
					$.each(motionRollCalls.proposicao.Votacoes.Votacao, 
						function(votingNum,rollCall){
							// create the rollCallID object with the 'votingNum' iterator
							var rollCallId = that.rollCallIdObj(motionRollCalls.proposicao.tipo, motionRollCalls.proposicao.Numero, motionRollCalls.proposicao.Ano, votingNum);
							// call the iteration on each vote
							that.iterateRollCallVotes(rollCall,rollCallId,callbackForEachVote);
						}
					)
				}
				else{
					// create the rollCallID object with the votingNum=0 (there is only one rollCall in this motion)
					var rollCallId = this.rollCallIdObj(motionRollCalls.proposicao.tipo, motionRollCalls.proposicao.Numero, motionRollCalls.proposicao.Ano, 0);
					// call the iteration on each vote
					this.iterateRollCallVotes(motionRollCalls.proposicao.Votacoes.Votacao,rollCallId,callbackForEachVote);
				}		        
			},
		
			// get a rollCall and iterate for each deputy vote -> calling callbackForEachVote(deputyVote,rollCallId)
			iterateRollCallVotes 	: function (rollCall,rollCallId,callbackForEachVote){
				if(rollCall===null) return {};
				if(rollCall.votos == undefined) {console.log('Probably a SECRET rollCall: ' + JSON.stringify(rollCallId)); return {}};

				rollCall.votos.Deputado.forEach(
					function(deputyVote){
						callbackForEachVote(deputyVote,rollCallId)
					}	
				)	
			}
		};

		return {  // INTERFACE
			rollCallIdObj 				:   chamberOfDeputiesClient.rollCallIdObj,
			motionIdObj					: 	chamberOfDeputiesClient.motionIdObj,

			getMotionRollCallInYear		: 	chamberOfDeputiesClient.getMotionRollCallInYear,
			getMotionRollCalls			: 	chamberOfDeputiesClient.getMotionRollCalls,
			getMotionDetails			: 	chamberOfDeputiesClient.getMotionDetails,
			getDeputyDetails			: 	chamberOfDeputiesClient.getDeputyDetails,

			iterateMotionRollCallsVotes	: 	chamberOfDeputiesClient.iterateMotionRollCallsVotes,
			iterateRollCallVotes 		: 	chamberOfDeputiesClient.iterateRollCallVotes,

			getOcurrencesOfRollCalls	:   chamberOfDeputiesClient.getOcurrencesOfRollCalls,
			getMotionRollCallsDate		:   chamberOfDeputiesClient.getMotionRollCallsDate
		};
	};
})(jQuery);


(function($) {
	$.chamberOfDeputiesClientHTTP = function() {
		var chamberOfDeputiesHTTP = {

			getMotionRollCalls	:	function (tipo,numero,ano,callback){
				d3.json('./data/motionRollCalls/'+tipo+''+numero+''+ano, function(motionRollCalls) {
					if(motionRollCalls === null) console.log('Could not load DB getMotionRollCalls/'+tipo+'/'+numero+'/'+ano);
					callback(motionRollCalls,tipo,numero,ano);
				})
			},

			getOcurrencesOfRollCalls	: 	function (callback){
				d3.json('./data/datetimeRollCall.json', function( ocurrencesOfRollCalls ) {
					callback(ocurrencesOfRollCalls);
				})
			}
		};

		return {  // INTERFACE
			getMotionRollCalls			: 	chamberOfDeputiesHTTP.getMotionRollCalls,
			getOcurrencesOfRollCalls	:   chamberOfDeputiesHTTP.getOcurrencesOfRollCalls,
		
		};
	};
})(jQuery);


(function($) {
	$.chamberOfDeputiesClientHTTPMin = function() {
		var chamberOfDeputiesClientHTTPMin = {

			// get the object of motion and roll calls
			getMotion	:	function (type,number,year,callback){
				d3.json('./data/motions.min/'+type+''+number+''+year, function(motion) {
					if(motion === null) console.log('Could not load DB getMotion/'+type+'/'+number+'/'+year);
					callback(motion);
				})
			},

			// return a list of rollCalls sorted by date
			getDatetimeRollCall	: 	function (callback){
				d3.json('./data/datetimeRollCall.json', function( datetimeRollCall ) {
					callback(datetimeRollCall);
				})
			},

			// return a list of all deputies
			getDeputiesArray	: 	function (callback){
				d3.json('./data/deputies.json', function( deputiesArray ) {
					callback(deputiesArray);
				})
			}
		};

		return {  // INTERFACE

			getMotion					: 	chamberOfDeputiesClientHTTPMin.getMotion,
			getDatetimeRollCall			:   chamberOfDeputiesClientHTTPMin.getDatetimeRollCall,
			getDeputiesArray			:   chamberOfDeputiesClientHTTPMin.getDeputiesArray,
		
		};
	};
})(jQuery);