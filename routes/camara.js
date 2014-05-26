
/*
 * GET camara resources and save to DB
 * NOTE: this functions will make a GET to camara.gov and update the mongo db. For regular queries use camaramongo.js 
 */

exports.obterDeputados = function(requestify,xml2js,db){
	return function(req, res){
		requestify.post('http://www.camara.gov.br/SitCamaraWS/Deputados.asmx/ObterDeputados?').then(function(response) { 
            xml2js.parseString(response.body, function(err,json){ 

              db.collection('obterDeputados').insert(json, function(err, result){
                res.json(
                  (err === null) ? json : { msg: err }
                );
              });
            })	
	    });
    };	
};

// Get the list of all 'articles' voted in plenary (representatives chamber = camara dos deputados)
exports.listarProposicoesVotadasEmPlenario = function(requestify,xml2js,db){
  return function(req, res){
    var ano = req.params.ano; // get the list of roll calls in the year(==ano)
    // GET from camara the response
    requestify.get('http://www.camara.gov.br/SitCamaraWS/Proposicoes.asmx/ListarProposicoesVotadasEmPlenario?ano='+ano+'&tipo=').then(function(response) { 
            // parse the recieved xml to JSON
            xml2js.parseString(response.body, function(err,json){ 
              // update/insert the collection: if there is already one list with {ano} then update {json} else insert {ano,json}.  
              db.collection('listarProposicoesVotadasEmPlenario').update({ano:ano},{ano:ano,data:json},{upsert:true}, function(err, result){
                res.json(
                  (err === null) ? {ano:ano, data:json} : { msg: err }
                );
              });
            })   
      });
    };  
};

//
// INSERT in the new entries => datetime = new Date(year, month, day, hours, minutes, seconds, milliseconds);
//http://www.camara.gov.br/SitCamaraWS/Proposicoes.asmx/ObterVotacaoProposicao?tipo=PL&numero=1992&ano=2007
//
exports.obterVotacaoProposicao = function(requestify,xml2js,db){
  return function(req, res){
    var ano = req.params.ano;
    var tipo = req.params.tipo;
    var numero = req.params.numero;
    
    requestify.get('http://www.camara.gov.br/SitCamaraWS/Proposicoes.asmx/ObterVotacaoProposicao?tipo='+tipo+'&numero='+numero+'&ano='+ano).then(function(response) { 
            xml2js.parseString(response.body, function(err,json){ 

              // fix and add variables
              json = fixFormatObterVotacaoProposicao(json);

              // add the datetimeRollCallsMotion entry reference to the motion 
              for (var i = 0; i < json.proposicao.Votacoes.Votacao.length; i++) {
                db.collection('datetimeRollCallsMotion')
                  .update({'datetime':json.proposicao.Votacoes.Votacao[i].datetime,'tipo':tipo,'numero':numero,'ano':ano}, //query
                          {'datetime':json.proposicao.Votacoes.Votacao[i].datetime,'tipo':tipo,'numero':numero,'ano':ano}, //insert/update
                          {upsert:true},                                                                                   // param
                          function(err, result){ if(err != null){console.log(err)} }                                      // callback
                  ); 
                
              };           

              // add to the collection of motionRollCalls and return the json;
              db.collection('obterVotacaoProposicao')
                .update({'proposicao.Sigla':tipo,'proposicao.Numero':numero,'proposicao.Ano':ano},      //query
                         json,                                                                          //insert/update
                         {upsert:true},                                                                 // param
                         function(err, result){  res.json(  (err === null) ? json : { msg: err }  )  }  // callback
                ); 
          })          
    }) // requestify
  };  
};

exports.obterProposicao = function(requestify,xml2js,db){
  return function(req, res){
    var ano = req.params.ano;
    var tipo = req.params.tipo;
    var numero = req.params.numero;
    requestify.get('http://www.camara.gov.br/SitCamaraWS/Proposicoes.asmx/ObterProposicao?tipo='+tipo+'&numero='+numero+'&ano='+ano).then(function(response) { 
            xml2js.parseString(response.body, function(err,json){ 

              //FIX the proposicao.tipo => sometimes with whitespaces++
              //console.log(json.proposicao.tipo);
              json.proposicao.tipo = json.proposicao.tipo.trim();

              db.collection('obterProposicao')
                .update({'proposicao.tipo':tipo,'proposicao.numero':numero,'proposicao.ano':ano}, json,{upsert:true}, function(err, result){
                  res.json(
                    (err === null) ? json : { msg: err }
                  );
              });
            })
      });
    };  
};


exports.obterDetalhesDeputado = function(requestify,xml2js,db){
  return function(req, res){
    var ideCadastro = req.params.ideCadastro;
    requestify.get('http://www.camara.gov.br/SitCamaraWS/Deputados.asmx/ObterDetalhesDeputado?ideCadastro='+ideCadastro+'&numLegislatura=').then(function(response) { 
            xml2js.parseString(response.body, function(err,json){ 
              json.ideCadastro = ideCadastro;

              db.collection('obterDetalhesDeputado')
                .update({ideCadastro:ideCadastro}, json,{upsert:true}, function(err, result){
                  res.json(
                    (err === null) ? json : { msg: err }
                  );
              });
            })    
      });
    };  
};

        
function fixFormatObterVotacaoProposicao(json){

  //FIX the proposicao.tipo => sometimes with whitespaces++
  json.proposicao.Sigla = json.proposicao.Sigla.trim(); 

  // fix the object/array to array
  if(!isArray(json.proposicao.Votacoes.Votacao)){
    json.proposicao.Votacoes.Votacao = [ json.proposicao.Votacoes.Votacao ];
  }

  // ADD datetime Date()
  for (var i = 0; i < json.proposicao.Votacoes.Votacao.length; i++) {
    var day_month_year = json.proposicao.Votacoes.Votacao[i].Data.match(/\d+/g);
    var hour_minutes = json.proposicao.Votacoes.Votacao[i].Hora.match(/\d+/g);
    json.proposicao.Votacoes.Votacao[i].datetime = 
      new Date(day_month_year[2], day_month_year[1]-1, day_month_year[0], hour_minutes[0], hour_minutes[1], 0, 0);
  };
  return json;
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
