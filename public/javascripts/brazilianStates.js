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
	var deputies;
	var dispatch = d3.dispatch("update");

	var width;
	var height;

	function chart(container) {
		height = width;

		projection = d3.geo.albers()
		.center([-4, -15])
		.rotate([+50, 0])
		.parallels([0, -40])
		.scale(width*1.3)
		.translate([width / 2, height / 2]);

		path = d3.geo.path()
			.projection(projection);

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
				chart.selectAllStates(); 
				deputies.forEach( function (deputy) { deputy.selected = true });
				dispatch.update(); 
			})
			.on('mouseover', function(){
				d3.select('#btn-resetDeputies').classed('highlight',true);
			})
			.on('mouseout', function(){
				d3.select('#btn-resetDeputies').classed('highlight',false);
			})
			.attr("fill","white")

		//setLabelDefault();

		// path of states
		d3.json("./images/topoBRA_ADM1.json", function(error, BRA_adm1) {
			data = topojson.feature(BRA_adm1, BRA_adm1.objects.BRA_adm1).features;
			$.each( data, function(state){ state.rate = null })
			
			//setStateInfo(data);

			svg.selectAll(".states")
				.data(data)
				.enter().append("path")
				.attr("d", path)
				.attr("id", function(d) { return state[ d.properties.NAME_1 ] ; })
				.attr("class", "states selected")

				.on("mouseover", function (d) { 
					d3.select(this).classed('mouseover',true) ; 
					setStateStyle(d3.select(this));

					deputies.forEach(function (deputy) {
						deputy.hovered = (deputy.district == state[d.properties.NAME_1])? true : false;
					})

					//dispatch event of hovering state.
					dispatch.update()  

					tooltip.html(chart.renderStateTooltip(d));
					return tooltip
						.style("visibility", "visible")
						.style("opacity", 1);
				})
				.on('mousemove',function(){
					return tooltip.style("top", (event.pageY - 10)+"px").style("left",(event.pageX + 25)+"px");
				})
				.on("mouseout",  function () {
					d3.select(this).classed('mouseover',false); 
					setStateStyle(d3.select(this));

					deputies.forEach(function (deputy) {
						deputy.hovered = false;
					}) 

					//dispatch event of end of hover
					dispatch.update() 				
					return tooltip.style("visibility", "hidden");			
				})
				.on("click",function (d) {
					d3.event.preventDefault();

					if (d3.event.shiftKey){
						// using the shiftKey deselect the state					
						d3.select(this).classed('selected',false);
						setStateStyle(d3.select(this));
						deputies.forEach(function (deputy) {
							deputy.selected = (deputy.district == state[d.properties.NAME_1])? false : deputy.selected;
						})

					} else 
					if (d3.event.ctrlKey){
						// using the ctrlKey add state to selection
						d3.select(this).classed('selected',true);
						setStateStyle(d3.select(this));
						deputies.forEach(function (deputy) {
							deputy.selected = (deputy.district == state[d.properties.NAME_1])? true : deputy.selected;
						})
					}
					else {
						// a left click without any key pressed -> select only the state (deselect others)
						svg.selectAll('.states').each( function(i){ 
							if(i.properties.NAME_1 == d.properties.NAME_1) d3.select(this).classed('selected',true);
							else d3.select(this).classed('selected',false);
							setStateStyle(d3.select(this));
						
						}) 

						deputies.forEach(function (deputy) {
							deputy.selected = (deputy.district == state[d.properties.NAME_1])? true : false;
						})
					}
					
					dispatch.update()
					tooltip.html(chart.renderStateTooltip(d));	
				})
				// html tooltip
				//.append("title").text( function (d) { return d.properties.NAME_1 });	
				setStatesStyle()
		});
	}

	chart.on = dispatch.on;

	chart.deputies = function (deputyNodes){
		deputies = deputyNodes;
		return chart;
	}

	chart.getStates = 
		function getStates(){
			var c = {};
			svg.selectAll(".states").each( function(d){ c[ state[d.properties.NAME_1] ]= d;  })
			return c;
		}

	// STATE STYLES!!  (1) mouseover (2) selected (3) unselected  + (filled by the roll calls outcome - OR NOT)
	function setStateStyle( element ){
		// mouseover
		if (element.classed('mouseover')) element.transition().attr('fill','orange');
		else { 
			// selected
			if(element.classed('selected')){ element.transition().attr('fill', function(d){ 
					return (d.rate != null)?
						((d.rate == 'noVotes')? 'lightgrey' : CONGRESS_DEFINE.votingColor(d.rate) )
						:
						'steelblue'; 
				})
			} 
			// unselected
			else { 
				element.transition()
					.attr('fill', function(d){ 
						return (d.rate != null)?  
							((d.rate == 'noVotes')? 'lightgrey' : CONGRESS_DEFINE.votingColor(d.rate) )
							: 
							((d.selected/d.total) > 0)? 'steelblue':'lightgrey'; 
					})
			}   
		}
	}

	// TODO? display the distribution of the selected ( state-> unselecting all states)
	chart.selectedDeputies = function(){
		svg.selectAll('.states').classed('selected', function(d){ return ((d.selected/d.total) == 1) })
		setStatesStyle();
	}
	
	chart.highlightRollCall = function(rollCall, mouseover){
		//if(data[0].rate == null) setLabelDefault(); else setLabelGradient();
		
		svg.selectAll('.states').attr('fill',function(d){/*console.log(d.rate);*/ return 'darkgrey'})
		setStatesStyle();
	}

	chart.highlightDeputyState = function( state , mouseover ){
			if(mouseover) 
				{ svg.select(".states#"+state).classed('mouseover',true)  }
			else{ svg.select(".states#"+state).classed('mouseover',false) }
				
			setStateStyle( svg.select(".states#"+state) );		
	}

	chart.resetRollCallRates = function (){
		//setLabelDefault();
		$.each( chart.getStates(), function(){ this.rate = null; })
		setStatesStyle();
	}

	// 
	chart.setRollCallRates = function () {
			//setLabelGradient()
			setStatesStyle();
		}

	chart.selectAllStates = function(){
		svg.selectAll('.states').classed('selected',true);
		setStatesStyle();
	}

	function setStatesStyle(){
		svg.selectAll('.states').each( function(){ setStateStyle(d3.select(this)) })
	}

	function setLabelDefault(){
		d3.select('#statesSVG .stateLabel').remove()

		var rectX = 7;
		var rectY = 130;
		var g = svg.append('g').attr('class','stateLabel');

		g.append('rect')
				.attr({
					width : 88,
					height: 46,
					x: rectX,
					y:  rectY +17,
					fill: 'lightgrey',
					stroke: 'black',
					'stroke-width': '0.5px'
				})

		// g.append('text').text('State:')
		// 	.attr({
		// 		x:rectX+5,
		// 		y:rectY+14,
		// 		stroke: 'none',
		// 		'font-size':'14px',
		// 		color: 'black'
		// 	})

		g.append('rect')
				.attr({
						width : 10,
						height: 10,
						x: rectX+5,
						y:  rectY+20,
						fill: 'steelblue',
						stroke: 'black',
						'stroke-width': '0.5px'
				})
		g.append('text').text('Represented')
			.attr({
				x:rectX+19,
				y:rectY+28,
				stroke: 'none',
				'font-size':'11px',
				color: 'black'
			})

		g.append('rect')
				.attr({
						width : 10,
						height: 10,
						x: rectX+5,
						y:  rectY+35,
						fill: 'steelblue',
						opacity: 0.5,
						stroke: 'black',
						'stroke-width': '0.5px'
				})
		g.append('text').text('Partially Rep.')
			.attr({
				x:rectX+19,
				y:rectY+43,
				stroke: 'none',
				'font-size':'11px',
				color: 'black'
			})

		g.append('rect')
				.attr({
						width : 10,
						height: 10,
						x: rectX+5,
						y:  rectY+50,
						fill: 'lightgrey',
						stroke: 'black',
						'stroke-width': '0.5px'
				})
		g.append('text').text('Not Rep.')
			.attr({
				x:rectX+19,
				y:rectY+58,
				stroke: 'none',
				'font-size':'11px',
				color: 'black'
			})

	}

	function setLabelGradient(){
		d3.select('#statesSVG .stateLabel').remove()

		var initX = 8;
		var initY = 115;
		var heightS = 8;
		var g = svg.append('g').attr('class','stateLabel');

		CONGRESS_DEFINE.votingColorGradient.forEach( function(color,i){// console.log(color +' '+i) 
			g.append('rect').attr({
					width : 30,
					height: heightS,
					x: initX,
					y:  initY+i*heightS,
					fill: color,
					stroke: 'lighblue',
					'stroke-width': '0.5px'
				})
		})

		g.append('text').text('Não').attr({
					x: initX+6,
					y:  initY+7,
					fill: 'white',
					stroke: 'none',
					'font-size':'9px',
				})
		g.append('text').text('Sim').attr({
					x: initX+6,
					y:  initY-1+CONGRESS_DEFINE.votingColorGradient.length*heightS,
					fill: 'white',
					stroke: 'none',
					'font-size':'9px',
				})

		g.append('text').text('-   Agreed').attr({
					x: initX+36,
					y:  initY+9,
					fill: 'black',
					stroke: 'none',
					'font-size':'11px',
				})

		g.append('text').text('- Disagreed').attr({
					x: initX+36,
					y:  initY+3+(CONGRESS_DEFINE.votingColorGradient.length/2)*heightS,
					fill: 'black',
					stroke: 'none',
					'font-size':'11px',
				})

		g.append('text').text('-   Agreed').attr({
					x: initX+36,
					y:  initY-1+CONGRESS_DEFINE.votingColorGradient.length*heightS,
					fill: 'black',
					stroke: 'none',
					'font-size':'11px',
				})

	
	}


	// function setStateInfo(data){

	// 	data.forEach( function(d,i){ d.i = i; })

	// 	svg.selectAll(".statesInfo")
	// 			.data(data)
	// 			.enter().append("text")
	// 			.attr({ 
	// 				id: function(d) { return state[ d.properties.NAME_1 ] ; },
	// 				'class' : "statesInfo selected",
	// 				x: function(d) { return 280 },
	// 				y: function(d) { return 15+ (d.i*11) },
	// 				'font-size': 11
	// 			})
	// 			.text( function(d) { return state[ d.properties.NAME_1 ] ; } )

	// }

	chart.renderStateTooltip = function(state){
		var selectedRate =  
			(state.selected==state.total)?
				state.total + ' Deputies'
				:
				((state.selected/state.total)*100).toFixed(1) +"% selected ("+ state.selected +'/'+state.total +')';

		return state.properties.NAME_1 + '<br/>'
			+'<em>'+selectedRate+'</em>'
			+'<br/><em>'+ 'Click to select' +'</em>';
			
	}

	chart.width = function(value) {
		if(!arguments.length) return width;
		width = value;
		return chart;
	}

	return d3.rebind(chart, dispatch, "on");
}