var chamberOfDeputiesManager= $.chamberOfDeputiesManager();
var chamberOfDeputies = $.chamberOfDeputiesClientDB();

angular
  .module('adminApp', ['ngMaterial'])
  .config(function($mdIconProvider) {
    $mdIconProvider
      .defaultIconSet('images/mdi.svg')
  })
  .controller('AppCtrl', function ($scope, $timeout, $mdSidenav, $log, CivisAnalysisAdmin) {
    $scope.toggleLeft = buildDelayedToggler('left');
    $scope.selectedRollCall = null;
    $scope.selectedView = 'year';    

    $scope.years = CONGRESS_DEFINE.years;
    $scope.motions = [];
    $scope.getByYear = CivisAnalysisAdmin.getByYear;
    $scope.saveMotionsWithDelay = saveMotionsWithDelay;
    $scope.saveDeputiesToFILE = saveDeputiesToFILE;
    $scope.saveRollCallsArray = saveRollCallsArray;
    $scope.LOAD_ALL_STUFF = LOAD_ALL_STUFF;

    $scope.calcPreSetsHistory = calcPreSetsHistory;

    $scope.logger = new (function Logger($scope) {
          this.logs = '';
          this.log = function(text) {
            var that = this;
            $timeout(function() {
              that.logs = text+'\n' + that.logs;
            },0)
          };
          this.clear = function() {
            this.logs = '';
          };
        })($scope);

    $scope.queryYear = function(year) {
      CivisAnalysisAdmin.getMotionsOfYear(year, function(listaDoAno) {
        if(listaDoAno.data.proposicoes.proposicao){
          var motions = listaDoAno.data.proposicoes.proposicao;
          $scope.motions = motions.reduce(function(mapMotions,motion){
            mapMotions[motion.nomeProposicao] = mapMotions[motion.nomeProposicao] || {codProposicao:motion.codProposicao,dates:[]}; 
            mapMotions[motion.nomeProposicao].dates.push(motion.dataVotacao)

            // 'REQ 2974/2015 => PL 2648/2015' // c.match(/\w+ \d+\/\d+/g)
            var arr = motion.nomeProposicao.match(/\w+/g); 
            mapMotions[motion.nomeProposicao].type   = arr[0];
            mapMotions[motion.nomeProposicao].number = arr[1];
            mapMotions[motion.nomeProposicao].year   = arr[2];
            return mapMotions;
          },{})
          
        }
        $scope.$apply();
      })
    }

    /**
     * Supplies a function that will continue to operate until the
     * time is up.
     */
    function debounce(func, wait, context) {
      var timer;
      return function debounced() {
        var context = $scope,
            args = Array.prototype.slice.call(arguments);
        $timeout.cancel(timer);
        timer = $timeout(function() {
          timer = undefined;
          func.apply(context, args);
        }, wait || 10);
      };
    }
    /**
     * Build handler to open/close a SideNav; when animation finishes
     * report completion in console
     */
    function buildDelayedToggler(navID) {
      return debounce(function() {
        $mdSidenav(navID)
          .toggle()
          .then(function () {
            $log.debug("toggle " + navID + " is done");
          });
      }, 200);
    }
  })
  .factory('CivisAnalysisAdmin', function ($q,$timeout) {
      
    var CivisAnalysisAdmin = {};

    CivisAnalysisAdmin.getMotionsOfYear = chamberOfDeputiesManager.listarProposicoesVotadasEmPlenario;
    CivisAnalysisAdmin.getByYear = updateMotionsByYear;

    return CivisAnalysisAdmin;


    // call the callback function(tipo,numero,ano) for each
    function forEachMotionRollCallinYear( logger, year, callbackForEachMotionRollCalls ){
      // Use AJAX to get the voted motions...
      chamberOfDeputies.getMotionRollCallInYear( year, function( motionRollCallInYear ) {
        
        if(motionRollCallInYear != null ){ 
          motionRollCallInYear.data.proposicoes.proposicao.forEach( proposicao => {
            var arr = proposicao.nomeProposicao.match(/\w+/g);
            
            var tipo  = arr[0];
            var numero  = arr[1];
            var ano   = arr[2];

            chamberOfDeputies.getMotionRollCalls(tipo,numero,ano,callbackForEachMotionRollCalls)
          });
        } 
        else { logger.log("No data for "+year+" year!!"); }

      })
    }

    // Check if all motions voted in the @param:year are loaded in the DB
    // else call the manager to update/download this motion
    function updateMotionsByYear(year, logger, force) {
      // Use AJAX to get the voted motions...
      forEachMotionRollCallinYear(logger, year, 
        function(motionRollCalls,tipo,numero,ano){

          // IF WE DID NOT FIND IN THE DB Load from CAMARA
          if(force || motionRollCalls === null){ 
            logger.log('REST GET MOTION ROLL CALLS - '+tipo+' '+numero+' '+ano);
            chamberOfDeputiesManager.obterVotacaoProposicao(tipo,numero,ano);
          }

          //check MotionDetails
          chamberOfDeputies.getMotionDetails(tipo,numero,ano, 
            function(motionDetails,tipo,numero,ano){
              // IF WE DID NOT FIND IN THE DB Load from CAMARA
              if(force || motionDetails === null){
                logger.log('REST GET MOTION DETAILS - '+tipo+' '+numero+' '+ano);
                chamberOfDeputiesManager.obterProposicao(tipo,numero,ano);
                return true;
              } 
            }
          )
          return false;
        }
      )
    }

  })