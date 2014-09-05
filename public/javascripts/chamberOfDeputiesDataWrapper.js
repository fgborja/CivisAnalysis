
// enviroment variables =================================
// maybe we can pass this variables inside chamberOfDeputiesDataWrapper 


// module get the "setDateRange()" and manage all the needed requests to mongoDB throught chamberOfDeputiesClient

// TODO: optimus-> POST an json array of all deputies and motions needed from the DB. The current implementation
// make an GET/POST foe each motion and deputy


(function($) {
    $.chamberOfDeputiesDataWrapper = function(motions,ideCadastroCollection,datetimeRollCall,phonebook) {
    	// module to load data from DB 
		var chamberOfDeputiesClient	= $.chamberOfDeputiesClientDB();
		//var chamberOfDeputiesClient	= $.chamberOfDeputiesClientHTTP();
		var rollCallInTheDateRange =[];
		var deputiesInTheDateRange ={};
        
		function assertDeputiesInTheDateRange(defer){

			rollCallInTheDateRange.sort(function(a,b){
			  return new Date(a.datetime) - new Date(b.datetime);
			});

			rollCallInTheDateRange.forEach( function( rollCall ){
				if(rollCall.rollCall.votos == undefined){}// console.log("NO VOTES!('secret') -"+entry.rollCall.ObjVotacao)
				else {
					rollCall.rollCall.votos.Deputado.forEach( function(deputy){

						//var phonebookID = phonebook.getPhonebookID( nameUP );
						deputiesInTheDateRange[deputy.phonebookID] = phonebook.getPhonebookOBJ(deputy.phonebookID);
						deputiesInTheDateRange[deputy.phonebookID].name 		= deputy.Nome ;
						deputiesInTheDateRange[deputy.phonebookID].phonebookID  = deputy.phonebookID;
						//deputiesInTheDateRange[phonebookID].ideCadastro = phonebook.getIdeCadastro( nameUP );
						deputiesInTheDateRange[deputy.phonebookID].details 	= ideCadastroCollection[phonebook.getIdeCadastro( deputy.Nome )];
						deputiesInTheDateRange[deputy.phonebookID].state 		= deputy.UF;
						deputiesInTheDateRange[deputy.phonebookID].party 		= deputy.Partido;
					})
				}
			})

			defer(null, true);
		} 


        var chamberOfDeputiesDataWrapper = {

        	// init getting all the occurances of Roll Calls 
        	getOcurrencesOfRollCalls	: function (defer){
        		if(datetimeRollCall.length > 0) {defer(null, true);return;}

				chamberOfDeputiesClient.getOcurrencesOfRollCalls(
					function(ocurrencesOfRollCalls){


						for (var i = ocurrencesOfRollCalls.length - 1; i >= 0; i--) {
							
							//console.log(ocurrencesOfRollCalls[i].datetime);
							var parse = ocurrencesOfRollCalls[i].datetime.match(/\d+/g)
							ocurrencesOfRollCalls[i].datetime = new Date(parse[0],parse[1]-1,parse[2],parse[3]-3,parse[4]);
							
							datetimeRollCall.push(ocurrencesOfRollCalls[i])
							//console.log(ocurrencesOfRollCalls[i].datetime);

						};

						//datetimeRollCall = ocurrencesOfRollCalls;
						defer(null, true);  // return to defer
					}
				)
			},

			loadMotion	: 	function(tipo,numero,ano,defer){
				// GET motion details
				// chamberOfDeputiesClient.getMotionDetails(tipo,numero,ano, function(details){
				// 		motions[tipo+numero+ano].details = details.proposicao; 
				// 	})

				// GET motion roll calls
				chamberOfDeputiesClient.getMotionRollCalls(tipo,numero,ano, function(motionRollCalls){

					// create Date object AND add the reference to the datetimeRollCall
					var rollCalls = motionRollCalls.proposicao.Votacoes.Votacao;
						//chamberOfDeputiesClientHTTP
						//var rollCalls = motionRollCalls.rollCalls;
					rollCalls.forEach( function(p){ 

						if(p.votos !== undefined){
							p.votos.Deputado.forEach( function(deputy){
								deputy.Voto    = deputy.Voto.trim();
								deputy.UF      = deputy.UF.trim();
								deputy.Nome    = deputy.Nome.trim().toUpperCase();
								deputy.Partido = deputy.Partido.trim();

								//TODO party manager
								if(deputy.Partido == 'Solidaried') deputy.Partido = 'SDD';
							})
						}


						// create the Date obj
						//console.log(p.datetime)
						var parse = p.datetime.match(/\d+/g);
						p.datetime = new Date(parse[0],parse[1]-1,parse[2],parse[3]-3,parse[4]);
							//chamberOfDeputiesClientHTTP
							//p.datetime = new Date(p.datetime);
						//console.log(p.datetime)

						// find the datetimeRollCall
						var dtRollCall = datetimeRollCall.filter(function(d){ return (d.datetime >= p.datetime) && (d.datetime <= p.datetime)} )
						
						// set rollCall to the datetimeRollCall entry
						dtRollCall[0].rollCall = p;

					})

					motions[tipo+numero+ano].rollCalls = rollCalls;

					defer(null, true); // return to loadMotionsInDateRange()
				})
			},

			// laod the motions, roll calls and deputies in the date range
			loadMotionsInDateRange	: function (start,end,defer){
				// get the motions with roll calls in the date range
				rollCallInTheDateRange = datetimeRollCall.filter( function(rollCallDate){  
					return (start <= rollCallDate.datetime) && (rollCallDate.datetime <= end)
				})

				// check if the motion is already loaded AND reduce repeated motions(with the map{})
				var motionsToLoad = {};
				rollCallInTheDateRange.forEach( function(d){ 
					if(motions[d.tipo+d.numero+d.ano] == undefined){
						motionsToLoad[d.tipo+d.numero+d.ano] = d;
					}		
				})

				//console.log(motionsToLoad)
				var loadMotionsQueue = queue(20); 

				$.each(motionsToLoad, function(motion) {
					motions[motion]={}
					loadMotionsQueue.defer(
						chamberOfDeputiesDataWrapper.loadMotion,
						motionsToLoad[motion].tipo,
						motionsToLoad[motion].numero,
						motionsToLoad[motion].ano
					)
					
				})

				loadMotionsQueue.awaitAll(function(){ defer(null, true);} ) // return to setDateRange()
				
			},

			// get all deputies who voted in the roll call
			loadDeputies 	: 	function (defer){

				var laodDeputiesQueue = queue(20);

				// for each rollCallInTheDateRange get/add the deputies to the set/map deputiesInTheDateRange
				rollCallInTheDateRange.forEach( function( entry ){
					if(entry.rollCall.votos == undefined){}// console.log("NO VOTES!('secret') -"+entry.rollCall.ObjVotacao)
					else {
						// for each vote
						entry.rollCall.votos.Deputado.forEach( function(deputy){

							phonebook.insertNameIdeCadastro(deputy.Nome ,deputy.ideCadastro); 
							deputy.phonebookID = phonebook.getPhonebookID(deputy.Nome);

							// LOAD the deputyDetails with 'ideCadastro' and add it to ideCadastroCollection
							// some deputies have the same ideCadastro -> so we have to load
							// if (deputy.ideCadastro != ""){

							// 	if(ideCadastroCollection[deputy.ideCadastro] == undefined ) {
							// 		ideCadastroCollection[deputy.ideCadastro] = {};

							// 		laodDeputiesQueue.defer(
							// 			function(ideCadastro, deferCallback ){
							// 				chamberOfDeputiesClient.getDeputyDetails(ideCadastro, function(deputyDetails){

							// 					if(isArray(deputyDetails.Deputados.Deputado) )
							// 						 {ideCadastroCollection[deputy.ideCadastro] = deputyDetails.Deputados.Deputado;}
							// 					else {ideCadastroCollection[deputy.ideCadastro] = [ deputyDetails.Deputados.Deputado ] ;}

							// 					deferCallback(null, true);// return to loadDeputies
							// 				})
							// 			}
							// 			,
							// 			deputy.ideCadastro
							// 		)
							// 	}
							// } 


						})
					}
				})

				laodDeputiesQueue.awaitAll(function(){ defer(null, true);} )  // return to setDateRange()
			},

			// LOAD from DB all data we need to reproduce the date range
			setDateRange	: 	function (start,end, callback){

				rollCallInTheDateRange =[];
				deputiesInTheDateRange ={};

				var q = queue(1)
				q.defer(chamberOfDeputiesDataWrapper.getOcurrencesOfRollCalls)
				 .defer(chamberOfDeputiesDataWrapper.loadMotionsInDateRange,start,end) // new queue(20) of load motions
				 .defer(chamberOfDeputiesDataWrapper.loadDeputies)					  // new queue(20) of load deputies
				 .defer(assertDeputiesInTheDateRange)
				 //.defer(deputiesDataWrapper.loadDeputies,start,end)

				// wait for all loading and call the app function
				q.awaitAll(function(){  
				
					// console.log(rollCallInTheDateRange);
					 // console.log(deputiesInTheDateRange);
					// console.log(motions);
					//console.log(datetimeRollCall)


					// console.log(Object.size(deputies));
					//console.log(Object.size(motions) );
					// console.log(datetimeRollCall.length)



					callback(rollCallInTheDateRange,deputiesInTheDateRange)  

				} );
			}

        };
        return {
        	getOcurrencesOfRollCalls	: 	chamberOfDeputiesDataWrapper.getOcurrencesOfRollCalls,
        	loadMotionsInDateRange 		:   chamberOfDeputiesDataWrapper.loadMotionsInDateRange,
        	loadMotion					: 	chamberOfDeputiesDataWrapper.loadMotion,
        	loadDeputies				:   chamberOfDeputiesDataWrapper.loadDeputies,

        	setDateRange				: 	chamberOfDeputiesDataWrapper.setDateRange,
        };
    };
})(jQuery);




(function($) {
    $.chamberOfDeputiesDataWrapperMin = function(motions,datetimeRollCall,phonebook) {
    	// module to load data
		var chamberOfDeputiesClient	= $.chamberOfDeputiesClientHTTPMin();

		datetimeRollCall = [];
		motions 		 = {};
		var deputiesArray = [];

        function init(defer){
    		// get the occurance of rollCalls
    		chamberOfDeputiesClient.getDatetimeRollCall( function(a_datetimeRollCall){
    			datetimeRollCall = 
    				$.map(a_datetimeRollCall, function(dtRollCall){ 
    					var parse = dtRollCall.datetime.match(/\d+/g)
						dtRollCall.datetime = new Date(parse[0],parse[1]-1,parse[2],parse[3]-3,parse[4]);
    					return dtRollCall 
    				});


    			// get the array of deputies
    			chamberOfDeputiesClient.getDeputiesArray( function(a_deputiesArray){
    				deputiesArray = a_deputiesArray;

    				//console.log(datetimeRollCall,deputiesArray)
    				defer(null, true)
    			})
    		})
        }

        function loadMotion(type,number,year,defer){
        	chamberOfDeputiesClient.getMotion(type,number,year, function(motion){
        		motions[type+number+year] = motion;

        		motion.rollCalls.forEach( function(rollCall){ 

					if(rollCall.votes !== undefined){
						rollCall.votes.forEach( function(vote){
							vote.name = deputiesArray[vote.deputyID].name;
							vote.district = deputiesArray[vote.deputyID].district;
							if(vote.party == 'Solidaried') vote.party = 'SDD';
						})
					}

					// create the Date obj
					var parse = rollCall.datetime.match(/\d+/g);
					rollCall.datetime = new Date(parse[0],parse[1]-1,parse[2],parse[3]-3,parse[4]);

					// find the datetimeRollCall
					var dtRollCall = datetimeRollCall.filter(function(d){ return (d.datetime >= rollCall.datetime) && (d.datetime <= rollCall.datetime)} )
					
					// set rollCall to the datetimeRollCall entry
					dtRollCall[0].rollCall = rollCall;
				})

				defer(null, true)
        	})
        }

        function loadMotionsInDateRange(start,end,defer){
        	// get the motions with roll calls in the date range
			rollCallsInTheDateRange = datetimeRollCall.filter( function(rollCall){  
				return (start <= rollCall.datetime) && (rollCall.datetime <= end)
			})
			//console.log("rollCallsInTheDateRange",rollCallsInTheDateRange)

			// check if the motion is already loaded AND reduce repeated motions(with the map{})
			var motionsToLoad = {};
			rollCallsInTheDateRange.forEach( function(d){ 
				if(motions[d.tipo+d.numero+d.ano] == undefined){
					motionsToLoad[d.tipo+d.numero+d.ano] = d;
				}		
			})

			//console.log("motionsToLoad",motionsToLoad)
			var loadMotionsQueue = queue(20); 

			$.each(motionsToLoad, function(motion) {
				motions[motion]={}
				loadMotionsQueue.defer(
					loadMotion,
					motionsToLoad[motion].tipo,
					motionsToLoad[motion].numero,
					motionsToLoad[motion].ano
				)
				
			})

			loadMotionsQueue.awaitAll(function(){ defer(null, true);} ) // return to setDateRange()
        }

        function assertDateRangeObjects(defer){

			rollCallsInTheDateRange.sort(function(a,b){
			  return new Date(a.datetime) - new Date(b.datetime);
			});

			rollCallsInTheDateRange.forEach( function( rollCall ){
				if(rollCall.rollCall.votes == undefined){}// console.log("NO VOTES!('secret') -"+entry.rollCall.ObjVotacao)
				else {
					rollCall.rollCall.votes.forEach( function(vote){

						//var phonebookID = phonebook.getPhonebookID( nameUP );
						deputiesInTheDateRange[vote.deputyID] = deputiesArray[vote.deputyID];
						deputiesInTheDateRange[vote.deputyID].party 		= vote.party; // refresh party
					})
				}
			})

			defer(null, true);
		} 

    	// LOAD from DB all data we need to reproduce the date range
		function setDateRange(start,end, callback){

			rollCallsInTheDateRange =[];
			deputiesInTheDateRange ={};

			var q = queue(1)
			q.defer(init)
			 .defer(loadMotionsInDateRange,start,end) // new queue(20) of load motions
			 .defer(assertDateRangeObjects) // new queue(20) of load motions

			// wait for all loading and call the app function
			q.awaitAll(function(){  
			
				// console.log(rollCallInTheDateRange);
				 // console.log(deputiesInTheDateRange);
				 //console.log("motions",motions);
				 //console.log('datetimeRollCall',datetimeRollCall)


				// console.log(Object.size(deputies));
				//console.log(Object.size(motions) );
				// console.log(datetimeRollCall.length)

				callback(rollCallsInTheDateRange,deputiesInTheDateRange)  

			});
		}

        return {
        	setDateRange : setDateRange,
        };
    };
})(jQuery);
