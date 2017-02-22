
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var camara = require('./routes/camara');
var camaraClient = require('./routes/camaraClient');
var http = require('http');
var path = require('path');
var requestify = require('requestify');


// XML -> JSON parser -----------------------
var xml2js     = require('xml2js');
xml2js.defaults['0.2'].explicitArray = false;
xml2js.defaults['0.2'].mergeAttrs    = true;
// ------------------------------------------


// MongoDB interface -----------------------
var db = require('mongoskin').db('mongodb://localhost:27017/camara', {safe: true});
// ------------------------------------------


var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));

app.use(express.json({limit: '10mb'}));
app.use(express.urlencoded({limit: '10mb'}));

app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//app.get('/', routes.index);

// functions to update DB... HTTP GET from camara.gov ------------------------------------------------------------------
app.get('/obterDeputados', camara.obterDeputados(requestify,xml2js,db));
app.get('/listarProposicoesVotadasEmPlenario/:ano', camara.listarProposicoesVotadasEmPlenario(requestify,xml2js,db));
app.get('/obterVotacaoProposicao/:tipo/:numero/:ano', camara.obterVotacaoProposicao(requestify,xml2js,db));
app.get('/obterProposicao/:tipo/:numero/:ano', camara.obterProposicao(requestify,xml2js,db));
app.get('/ObterDetalhesDeputado/:ideCadastro', camara.obterDetalhesDeputado(requestify,xml2js,db));
//app.post('/addObterDeputados', user.addObterDeputados(db));
// ---------------------------------------------------------------------------------------------------------------------

// functions to query DB - CLIENT FUNCTIONS - READ ONLY ----------------------------------------------------------------
app.get('/getMotionRollCallInYear/:ano', camaraClient.getMotionRollCallInYear(db));
app.get('/getMotionDetails/:tipo/:numero/:ano', camaraClient.getMotionDetails(db));
app.get('/getMotionRollCalls/:tipo/:numero/:ano', camaraClient.getMotionRollCalls(db));
app.get('/getDeputyDetails/:ideCadastro', camaraClient.getDeputyDetails(db));

// get an array of all ocurrences(datetime) of roll calls associated with the motion id(tipo,numero,ano)
app.get('/getOcurrencesOfRollCalls', camaraClient.getOcurrencesOfRollCalls(db));

// get the motionRollCalls in a data range(start-end)
app.post('/getMotionRollCallsDate', camaraClient.getMotionRollCallsDate(db));
// ---------------------------------------------------------------------------------------------------------------------


// INTERFACE to query DB  ----------------------------------------------------------------------------------------------
app.get('/admin', camaraClient.admin);
app.get('/getAllMotionsDetails', camaraClient.getAllMotionsDetails(db))
app.get('/getAllMotionsRollCalls', camaraClient.getAllMotionsRollCalls(db))
// ---------------------------------------------------------------------------------------------------------------------

// APPLICATION  !!!  ---------------------------------------------------------------------------------------------------
app.get('/', camaraClient.chamberOfDeputies);
// ---------------------------------------------------------------------------------------------------------------------



//fs.writeFile('message.xml', chusme, function (err) { if (err) throw err;  console.log('It\'s saved!');});
//fs.readFile('message.xml', 'utf8', function (err,xml) { parseString(xml, function (err, result){ console.dir(result); }) });


// CREATE SERVER :3000
http.createServer(app).listen(app.get('port'), function(){
 console.log('Express server listening on port ' + app.get('port'));
});
