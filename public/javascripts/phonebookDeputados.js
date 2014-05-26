
// Abstenção e Obstrução contados como uma abstenção real.(?)
var votoStringToInteger = {"Sim":1,"Não":-1,"Abstenção":0,"Obstrução":0,"Art. 17":0}

// table associating each deputy with erach ("law")proposition
var tableDepXProp = [];

function loadData(phonebook,votingSessions,proposicoes,callbackAfterLoadAllData){

	var phonebookIDcount=0;
	var phonebookID ={};
		function getPhonebookID(name){
			if(phonebookID[name] == undefined) {phonebookID[name] = phonebookIDcount++; }
			return phonebookID[name];
		}

	var votingSessionIDcount=0;
	var	votingSessionID = {};
		function getVotingSessionID(name){
			if(votingSessionID[name] == undefined) {votingSessionID[name] = votingSessionIDcount++; }
			return votingSessionID[name];
		}	

	var vot2012 =["MPV.549.2011","MPV.550.2011","MPV.551.2011","MPV.554.2011","MPV.558.2012","MPV.559.2012","MPV.563.2012","MPV.566.2012","MPV.567.2012","MPV.570.2012","MPV.571.2012","MPV.574.2012","MPV.575.2012","MPV.576.2012","MPV.579.2012","PDC.514.2011","PEC.153.2003","PEC.270.2008","PEC.416.2005","PEC.438.2001","PEC.445.2009","PEC.471.2005","PEC.478.2010","PL.301.2007","PL.643.2011","PL.865.2011","PL.1876.1999","PL.1992.2007","PL.2330.2011","PL.2565.2011","PL.2793.2011","PL.3839.2012","PL.5279.2009","PL.5403.2001","PLP.114.2011","PLP.230.2004","PLP.362.2006","PLP.579.2010","REQ.1134.2011","REQ.2130.2011","REQ.4504.2012","REQ.4636.2012","REQ.6062.2012","REQ.6135.2012","REQ.6460.2012","REQ.6461.2012"]
	

		// add to phonebook the (phonebbok) ObterDeputados.xml from Camara
		var obterDeputadosToPhoonebook = function(obterDeputadosFilePath,phonebook,callback)
		{
			d3.xml(obterDeputadosFilePath, "application/xml", function(xml) {
				var jsonDeputados = x2js.xml2json( xml );

				$.each(jsonDeputados.deputados.deputado, function(i, v) {
					// important (otherwise conflict with the counting of votes)
					if(phonebook[getPhonebookID(v.nomeParlamentar)]==undefined) 
						phonebook[getPhonebookID(v.nomeParlamentar)]={numVotes:0,'contact':v,'voting':{}};
					else phonebook[getPhonebookID(v.nomeParlamentar)].contact = v; 
				})
				callback(null, true);  // return to defer
			})
		}	
	
		var loadProposicoes = function (proposicoes,proposicoesFilenames,callback){
			$.map(proposicoesFilenames, 
				function(proposicao){
					d3.xml("./projects/vote-studies/data/2012/"+proposicao+".xml", "application/xml", function(xml) {
						proposicao = x2js.xml2json( xml );
						proposicoes[proposicao.proposicao.sigla+"."+proposicao.proposicao.numero
						+"."+proposicao.proposicao.ano] = proposicao.proposicao;				
						
							// check if all propostion files are loaded							
							if(proposicoesFilenames.length == Object.size(proposicoes)){
								// do something useful						
								proposicoesIterateVote(proposicoes,addVoteToPhonebook);	
								callback(null, true);  // return to defer
							}			
						});	
				})
		}

		var finished = function(error, results) {
		
			tableDepXProp = numeric.rep([phonebookIDcount,votingSessionIDcount],0)
	
			proposicoesIterateVote(proposicoes, function(propName,session,sessionID,voteDeputado){
				var depID = getPhonebookID(voteDeputado._Nome.toUpperCase());

				tableDepXProp[depID][sessionID]=votoStringToInteger[voteDeputado._Voto];

			});	

			callbackAfterLoadAllData()	
		}

//====================== !!!!!!!!!!!!!!!!!!!
	var q = queue(10);
	q.defer(obterDeputadosToPhoonebook, "./projects/vote-studies/data/ObterDeputadosPre.xml",phonebook)
	 .defer(obterDeputadosToPhoonebook, "./projects/vote-studies/data/ObterDeputados14.11.2013.xml",phonebook)
	 .defer(loadProposicoes,proposicoes,vot2012)
	 .awaitAll(finished);
//====================== !!!!!!!!!!!!!!!!!!!

		
		
		// for each vote Add to phonebook and votingSessions
		function addVoteToPhonebook(propName,session,sessionID,voteDeputado){
			var depName = voteDeputado._Nome.toUpperCase();
			var depID = getPhonebookID(depName);
			// PHONEBOOK
				// if undefined -> instantiate
				if(phonebook[depID] == undefined) phonebook[depID]=
								{'numVotes':0,
								 'contact':
		  	           				{'partido':voteDeputado._Partido,'uf':voteDeputado._UF,'nomeParlamentar':depName },
								 'voting':{}  
								};
				// add a vote to phonebook
				phonebook[depID].numVotes++;
				// if the proposicao Object is undefined instatiate
				phonebook[depID].voting[sessionID] = voteDeputado._Voto;

			//VOTINGSESSIONS
				// if undefined -> instantiate
				if(votingSessions[sessionID] == undefined) votingSessions[sessionID]= {'votes':{}};	
				// add the vote to the votingSession
				votingSessions[sessionID].votes[depID]=voteDeputado._Voto;
					
		}



		// get a proposition list and iterate the votes calling votacaoIterateVote()
		function proposicoesIterateVote(proposicoes,callbackForEachVote){
			$.each(proposicoes, function(i, prop) {
			    if(isArray(prop.votacoes.votacao)){
					$.each(prop.votacoes.votacao, 
						function(j,votacao){votacaoIterateVote(votacao,i,j,callbackForEachVote);}
					)}
				else{votacaoIterateVote(prop.votacoes.votacao,i,0,callbackForEachVote);}		        
			})
		}
		
		// get a voting and iterate for each deputado vote -> calling callbackForEachDeputadoVote(voteDeputado)
		function votacaoIterateVote(votacao,propName,session,callbackForEachDeputadoVote){
			sessionID = getVotingSessionID(propName+"."+session);
			
			votacao.votos.deputado.forEach(
				function(voteDeputado){
					callbackForEachDeputadoVote(propName,session,sessionID,voteDeputado)
				}	
			)	
		} 
}


// function to check size of properties of an object
		Object.size = function(obj) {
			var size = 0, key;
			for (key in obj) {
				if (obj.hasOwnProperty(key)) size++;
			}
			return size;
		};
	
		// check is the Object is an Arrayroposicoes2012
		function isArray(obj) {
			return Object.prototype.toString.call(obj) === '[object Array]';
		}

