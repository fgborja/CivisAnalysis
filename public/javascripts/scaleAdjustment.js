(function() {
	function scaleAdjustment() {
		var numSamples =100;
		var samples = [];	
		function getSamples(){ return samples};

		function setSampling (OLDdeputiesInTheDateRange){
			numSamples = (numSamples > Object.size(OLDdeputiesInTheDateRange) )? Object.size(OLDdeputiesInTheDateRange) : 100;
			samples = [];
			if((OLDdeputiesInTheDateRange === null) || (Object.size(OLDdeputiesInTheDateRange) ==0) ){

			} else{ 
				var deputiesArray = $.map(OLDdeputiesInTheDateRange, function(d){ return d})
				
				var scale0 = d3.extent(deputiesArray, function(d){ return d.scatterplot[0]}),
					scale1 = d3.extent(deputiesArray, function(d){ return d.scatterplot[1]});

				var bisector0 =  scale0[0]+ (scale0[1] - scale0[0])/2 ,
					bisector1 =  scale1[0]+ (scale1[1] - scale1[0])/2 ;

				function sector(value,bisector){ return (value > bisector)? 1 : -1;  }


				for (var i = 0; i < numSamples; i++) { 
					var deputy = deputiesArray[Math.floor(Math.random() * deputiesArray.length)];

					samples.push({
						ideCadastro: deputy.ideCadastro,
						sector: [ 
							sector(deputy.scatterplot[0],bisector0),
							sector(deputy.scatterplot[1],bisector1),
						]
					})
				};
			}
		}

		function testSampling (newDeputiesInTheDateRange){
			if(samples.length == 0){
				setSampling(newDeputiesInTheDateRange);
			} else{
				var deputiesArray = $.map(newDeputiesInTheDateRange, function(d){ return d})
				
				var scale0 = d3.extent(deputiesArray, function(d){ return d.scatterplot[0]}),
					scale1 = d3.extent(deputiesArray, function(d){ return d.scatterplot[1]});

				var bisector0 =  scale0[0]+ (scale0[1] - scale0[0])/2 ,
					bisector1 =  scale1[0]+ (scale1[1] - scale1[0])/2 ;

				function sector(value,bisector){ return (value > bisector)? 1 : -1;  }

				var change = {x:0,y:0};

				samples.forEach( function(sample){
					if(newDeputiesInTheDateRange[sample.ideCadastro] != undefined){
						var deputy = newDeputiesInTheDateRange[sample.ideCadastro];

						if(sample.sector[0] != sector(deputy.scatterplot[0],bisector0))
							change.x++;

						if(sample.sector[1] != sector(deputy.scatterplot[1],bisector1))
							change.y++
					}
				})

				console.log('detected '+change.x+' in X ---- '+change.y+' in Y')

				change.x = (change.x >= numSamples/3)? -1 : 1;
				change.y = (change.y >= numSamples/3)? -1 : 1;

				$.each(deputiesInTheDateRange, function(d){
					deputiesInTheDateRange[d].scatterplot[0] *= change.x;
					deputiesInTheDateRange[d].scatterplot[1] *= change.y;
				})
			}
		}

		return scAdj = {
				setSampling :    setSampling,
				testSampling:    testSampling
				//getSamples     :    getSamples
		};
	}
	if (typeof define === "function" && define.amd) define(function() { return scaleAdjustment; });
	else if (typeof module === "object" && module.exports) module.exports = scaleAdjustment;
	else this.scaleAdjustment = scaleAdjustment;
})();