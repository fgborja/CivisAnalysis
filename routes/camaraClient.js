
/*
 * GET resources from mongodb - CLIENT FUNCTIONS! READ ONLY!
 * NOTE: this functions will return queries in mongodb (data saved from camara.gov), for updates in the DB use camara.js.  
 */

// PROPOSITION =~> !MOTION! <~= PROPOSAL

// View to check the motions... listMotions.jade + listMotions.js
exports.listMotions = function(req, res){
	res.render('listMotions');
};

exports.getAllMotionsDetails = function(db){
	return function(req, res){
		db.collection('obterProposicao').find().toArray(function(err,d){
	    		res.json(d)
		})
	}
}
exports.getAllMotionsRollCalls = function(db){
	return function(req, res){
		db.collection('obterVotacaoProposicao').find().toArray(function(err,d){
	    		res.json(d)
		})
	}
}


// View to check the chamberOfDeputies... chamberOfDeputies.jade
exports.chamberOfDeputies = function(req, res){
	res.render('chamberOfDeputies');
};

// return the array of all MOTIONS voted in plenary in the @param:year
exports.getMotionRollCallInYear = function(db){
  return function(req, res){
	    var ano = req.params.ano; 
	    //console.log(ano);
	    // get the list of roll calls in the year(==ano)
	    db.collection('listarProposicoesVotadasEmPlenario').findOne({ano:ano}, 
	    	function (err,d){
	    		res.json(d)
	    	}
	    )
	}
};


exports.getMotionDetails = function(db){
	return function(req, res){
	    var ano = req.params.ano;
	    var tipo = req.params.tipo;
	    var numero = req.params.numero;

	    db.collection('obterProposicao').findOne({'proposicao.tipo':tipo,'proposicao.numero':numero,'proposicao.ano':ano},
	    	function (err,d){
	    		res.json(d)
	    	}
	    )
	}
};


exports.getMotionRollCalls = function(db){
	return function(req, res){
	    var ano = req.params.ano;
	    var tipo = req.params.tipo;
	    var numero = req.params.numero;

	    db.collection('obterVotacaoProposicao').findOne({'proposicao.Sigla':tipo,'proposicao.Numero':numero,'proposicao.Ano':ano},
	    	function (err,d){
	    		res.json(d)
	    	}
	    )
	}
};

// return the array of all motions voted in plenary 
exports.getDeputyDetails = function(db){
  return function(req, res){
	    var ideCadastro = req.params.ideCadastro; 
	    db.collection('obterDetalhesDeputado').findOne({'Deputados.Deputado.ideCadastro':ideCadastro}, 
	    	function (err,d){
	    		res.json(d)
	    	}
	    )
	}
};

exports.getOcurrencesOfRollCalls = function(db){
	return function(req, res){

	    db.collection('datetimeRollCallsMotion').find({}).toArray(
	    	function (err,d){
	    		res.json(d)
	    	}
	    )
	}
};


// get the motionRollCalls in a data range(start-end)
//start = datetime(2013, 4, 1)
//end = datetime(2013, 5, 1)
//db.motionRollCalls.find({'proposicao.Votacoes.Votacao':{$elemMatch:{datetime:{$gte: start, $lt: end} }}}).length()
///////////////////////////////////////
exports.getMotionRollCallsDate = function(db){
	return function(req, res){
		//console.log(req.body)
		var start = new Date(req.body.start);
		var end   = new Date(req.body.end);

	    db.collection('obterVotacaoProposicao').find(
	    		{'proposicao.Votacoes.Votacao':
	    			{ $elemMatch:
	    				{ datetime: {$gte: start, $lt: end} }
	    			}
	    		}).toArray(
	    	function (err,d){
	    		res.json(d)
	    	}
	    )
	}
};
