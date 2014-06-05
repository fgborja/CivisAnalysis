// <script src="../../d3/d3.v3.min.js"></script>
// <script src="../../d3/d3js.org/topojson.v0.min.js"></script>
// <meta charset=utf-8" >

var state = [];
 state["Distrito Federal"]="DF";
 state["Acre"]="AC";
 state["Alagoas"]="AL";
 state["Amapá"]="AP";
 state["Amazonas"]="AM";
 state["Bahia"]="BA";
 state["Ceará"]="CE";
 state["Espírito Santo"]="ES";
 state["Goiás"]="GO";
 state["Maranhão"]="MA";
 state["Mato Grosso"]="MT";
 state["Mato Grosso do Sul"]="MS";
 state["Minas Gerais"]="MG";
 state["Pará"]="PA";
 state["Paraíba"]="PB";
 state["Paraná"]="PR";
 state["Pernambuco"]="PE";
 state["Piauí"]="PI";
 state["Rio de Janeiro"]="RJ";
 state["Rio Grande do Norte"]="RN";
 state["Rio Grande do Sul"]="RS";
 state["Rondônia"]="RO";
 state["Roraima"]="RR";
 state["Santa Catarina"]="SC";
 state["São Paulo"]="SP";
 state["Sergipe"]="SE";
 state["Tocantins"]="TO";

if(!d3.chart) d3.chart = {};

d3.chart.brazilianStates = function() {

	var svg;
	var data;
	var dispatch = d3.dispatch("hover","selected");

	var width = 280,
		height = 280;

	var projection = d3.geo.albers()
		.center([-4, -15])
		.rotate([+50, 0])
		.parallels([0, -40])
		.scale(350)
		.translate([width / 2, height / 2]);

	var path = d3.geo.path()
		.projection(projection);

	function chart(container) {

		svg = container.append("svg")
			.attr("width", width)
			.attr("height", height)
			.attr("id", "statesSVG");


		// background rectangle to recieve onclick to desselect all states
		var rectangle = svg.append("rect")
			.attr("x", 0)
			.attr("y", 0)
			.attr("width", width)
			.attr("height", height)
			.on("click", function(){ 
				resetStatesLayout(); 
				dispatch.selected( null ); 
			})
 			.attr("fill","white")

		// path of states
		d3.json("./images/topoBRA_ADM1.json", function(error, BRA_adm1) {
			data = topojson.feature(BRA_adm1, BRA_adm1.objects.BRA_adm1).features;
			$.each( data, function(state){ state.rate = null })
			
		
		    svg.selectAll(".states")
				.data(data)
				.enter().append("path")
				.attr("d", path)
				.attr("id", function(d) { return state[ d.properties.NAME_1 ] ; })
				.attr("class", "states selected")
				.on("mouseover", function () { 
					d3.select(this).classed('mouseover',true) ; 
					setStateStyle(d3.select(this));

					//dispatch event of hovering state.
					dispatch.hover( d3.select(this).attr('id'))  	
				})
				.on("mouseout",  function () {
					d3.select(this).classed('mouseover',false); 
					setStateStyle(d3.select(this));

					//dispatch event of end of hover
					dispatch.hover( null ) 							
				})
				.on("click",function (d) {
					d3.event.preventDefault();

					if (d3.event.shiftKey){
						// using the shiftKey deselect the state					
						d3.select(this).classed('selected',false);
						setStateStyle(d3.select(this));

						//dispatch event of selected states
						dispatch.selected( state[d.properties.NAME_1],'EXCLUDE')

					} else 
					if (d3.event.ctrlKey){
						// using the ctrlKey add state to selection
						d3.select(this).classed('selected',true);
						setStateStyle(d3.select(this));

						//dispatch event of selected states
						dispatch.selected( state[d.properties.NAME_1],'ADD')

					}
					else {
						// a left click without any key pressed -> select only the state (deselect others)
						svg.selectAll('.states').each( function(i){ 
							if(i.properties.NAME_1 == d.properties.NAME_1) d3.select(this).classed('selected',true);
							else d3.select(this).classed('selected',false);

							setStateStyle(d3.select(this));
						}) 

						//dispatch event of selected states
						dispatch.selected( state[d.properties.NAME_1],'SET')
					}

					 				
				})
				// html tooltip
				.append("title").text( function (d) { return d.properties.NAME_1 });	


				svg.selectAll('.states').each( function(i){ setStateStyle(d3.select(this)); } )
		});
	}

	chart.on = dispatch.on;

	// recieve an map with the 
	chart.setStatesColor = 
		function setStatesColor (  ) {

			svg.selectAll(".states").each( function(d){ setStateStyle( d3.select(this) ) })
		}

	// return an object-map of selected states 
	// getSelectedStates = 
	// 	function getSelectedStates(){
	// 		var c = {};
	// 		svg.selectAll(".states.selected").each( function(d){ c[ state[d.properties.NAME_1] ]= d;  })
	// 		return c;
	// 	}

	chart.getStates = 
		function getStates(){
			var c = {};
			svg.selectAll(".states").each( function(d){ c[ state[d.properties.NAME_1] ]= d;  })
			return c;
		}

	chart.highlightDeputyState = 
		function highlightDeputyState( state , mouseover ){
			if(mouseover) 
				{ svg.select(".states#"+state).classed('mouseover',true)  }
			else{ svg.select(".states#"+state).classed('mouseover',false) }
				
			setStateStyle( svg.select(".states#"+state) );		
		}

	// STATE STYLES!!  (1) mouseover (2) selected (3) unselected  + (filled by the roll calls outcome - OR NOT)
	function setStateStyle( element ){
		// mouseover
		if (element.classed('mouseover')) element.transition().attr('fill','orange');
		else { 
			// selected
			if(element.classed('selected')){ element.transition().attr('fill', function(d){ 
					return (d.rate != null)? votingColor(d.rate) : 'steelblue'; 
				})
			} 
			// unselected
			else { 
				element.transition()
					.attr('fill', function(d){ 
						return (d.rate != null)? votingColor(d.rate) : ((d.selected/d.total) > 0)? 'steelblue':'lightgrey'; 
					})
			}   
		}
	}

	// TODO? display the distribution of the selected ( state-> unselecting all states)
	chart.selectedDeputies = function(){
		//console.log(deputyPerState)

		svg.selectAll('.states').classed('selected', function(d){ return ((d.selected/d.total) == 1) })

		svg.selectAll('.states').each( function(i){ setStateStyle(d3.select(this)); } )
	}
	
	chart.highlightRollCall = function(rollCall, mouseover){

	}

	chart.resetRollCallRates = function (){
		$.each( chart.getStates(), function(){ this.rate = null; })
		svg.selectAll('.states').each( function(i){ setStateStyle(d3.select(this)); } )
	}

	function resetStatesLayout(){

		svg.selectAll('.states').classed('selected',true);

		// for (var i = 0; i < data.length; i++) {
		// 	data[i].rate = null;
		// };

		svg.selectAll('.states').each( function(i){ setStateStyle(d3.select(this)); } )
	}


	return d3.rebind(chart, dispatch, "on");
}