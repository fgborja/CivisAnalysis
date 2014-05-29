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

		var svg = container.append("svg")
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
				d3.selectAll('.states').classed('unselected',false);
				d3.selectAll('.states').classed('selected',true);
				dispatch.selected( getSelectedStates() ); 			//dispatch!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
			})
			.attr("fill","white")

		// path of states
		d3.json("./images/topoBRA_ADM1.json", function(error, BRA_adm1) {

		    svg.selectAll(".states")
				.data(topojson.feature(BRA_adm1, BRA_adm1.objects.BRA_adm1).features)
				.enter().append("path")
				.attr("d", path)
				.attr("id", function(d) { return state[ d.properties.NAME_1 ] ; })
				.attr("class", "states selected")
				.on("mouseover", function () { 
					d3.select(this).classed('mouseover',true) ; 

					//dispatch event of hovering state.
					dispatch.hover( d3.select(this).attr('id'))  	
				})
				.on("mouseout",  function () {
					d3.select(this).classed('mouseover',false); 
					//dispatch event of end of hover
					dispatch.hover( null ) 							
				})
				.on("click",function (d) {
					if (d3.event.shiftKey){
						// using the shiftKey deselect the state					
						d3.select(this).classed('selected',false);
					} else 
					if (d3.event.ctrlKey){
						// using the ctrlKey add state to selection
						d3.select(this).classed('selected',true);
					}
					else {
						// a left click without any key pressed -> select only the state (deselect others)
						d3.selectAll('.states').each( function(i){ 
							if(i.properties.NAME_1 == d.properties.NAME_1) d3.select(this).classed('selected',true);
							else d3.select(this).classed('selected',false);
						}) 
					}

					//dispatch event of selected states
					dispatch.selected( getSelectedStates() ) 				
				})
				// html tooltip
				.append("title").text( function (d) { return d.properties.NAME_1 });			
					
		});

		return dispatch;
	}

	// return an object-map of selected states 
	function getSelectedStates(){
		var c = {};
		d3.selectAll(".states.selected").each( function(d){ c[ state[d.properties.NAME_1] ]=true;  })
		return c;
	}

	return d3.rebind(chart, dispatch, "on");
}