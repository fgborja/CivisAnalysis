(function() {
	function selectionModule() {
		
		var selectedDeputies = {};
		var selectedRollCalls= {};

		function selectDeputy (deputyID){
			selectedDeputies[deputyID]=true;
		}
		function deselectDeputy (deputyID){
			selectedDeputies[deputyID]=false;		
		}
		function queryIfDeputySelected (deputyID){
			return selectedDeputies[deputyID];
		}

		function selectRollCall (key){
			selectedRollCalls[key]=true;
		}
		function deselectRollCall (key){
			selectedRollCalls[key]=false;
		}
		function queryIfRollCallSelected (key){
			return selectedRollCalls[key];
		}

		return selectionMod = {
				selectDeputy			:   selectDeputy,
				deselectDeputy			:  	deselectDeputy,
				selectRollCall 			: 	selectRollCall,
				deselectRollCall		:   deselectRollCall,
				queryIfDeputySelected 	: 	queryIfDeputySelected,
				queryIfRollCallSelected : 	queryIfRollCallSelected
		};
	}

	if (typeof define === "function" && define.amd) define(function() { return selectionModule; });
	else if (typeof module === "object" && module.exports) module.exports = selectionModule;
	else this.selectionModule = selectionModule;
})();



/// selectors TOOLS TO MANAGE THE SELECTION OF NODES
// '.main' '.selectorRect'
function selectors( class_selector,dispatchSelected){
	var main = d3.select('.chart'+'.'+class_selector);
	//var jqSelectorRect = $('.'+class_selector+' .selectorRect');
	var selectorRect = d3.select('.'+class_selector+' .selectorRect');

	var selectingIndex = 0;
	var selecting = [false,true,true];
	var selectingType	  = [null,'rect'/*,'circle'*/]

	var selectorElement,
		selectorScreen;

	//jqSelectorRect.on("mousedown", rightClickSelectionMode);
	selectorRect.on("mousedown", function(){
		setSelectionMode();
		setSelectionElement( d3.mouse(this) ); 
	});
			
	function setSelectionMode(mouse){
		//hidde the tooltip
		selectorScreen =  main.append('rect')
			.attr({
				id     :'selectorScreen',
				width  : main.attr('width'),
				height : main.attr('height'),
				fill: 'transparent',
				cursor:'crosshair',
				stroke: 'grey',
				'stroke-width': 4
			})
			
		d3.select('body').on("keydown", function() { 
			if (d3.event.shiftKey) selectorElement.classed('shiftKey',true)  
			if (d3.event.ctrlKey) selectorElement.classed('ctrlKey',true)   
		})
		.on("keyup", function() {  
			if (!d3.event.shiftKey) selectorElement.classed('shiftKey',false)  
			if (!d3.event.ctrlKey) selectorElement.classed('ctrlKey',false)  
		})

		main.on('mouseleave', function(){selectingIndex=0; setDefaultMode() })
	
	}

	function setDefaultMode(){
		if(selectorScreen !== undefined) selectorScreen.remove();
		if(selectorElement !== undefined) selectorElement.remove();
	}

	function setSelectionElement(mouse){

		selectorElement = main.insert("circle",'#selectorScreen')
			.attr({
				r:10,
				cx:mouse[0]+10,
				cy:mouse[1]+10,
				'class' : "selection"
			})	

		selectorScreen
			.on('mousemove', function(){  
				var p = d3.mouse( this),

				cx = parseInt( selectorElement.attr( "cx"));
				cy = parseInt( selectorElement.attr( "cy"));
				
				r = Math.sqrt(Math.pow(p[0]-cx,2)+Math.pow(p[1]-cy,2)) +10;	

				selectorElement.attr('r',r);			 

			})
			.on('mouseup', function(){
				var circle = {
					x       : parseInt( selectorElement.attr( "cx")),
					y       : parseInt( selectorElement.attr( "cy")),
					r   	: parseInt( selectorElement.attr( "r")),
					isPointInside  : function(cx,cy){
						return ( ( Math.pow( this.x-10-cx ,2) + Math.pow( this.y-10-cy ,2) ) <= Math.pow(this.r,2) ) 
					}
				};
				
				selectionNodesInsideElement(class_selector,circle);
				setDefaultMode()
			})
		
	}

	// function rightClickSelectionMode(event) {
		
	// 	selectingIndex = (selectingIndex>=2)? 0 : selectingIndex+1; 
		
	// 	//handle right click

	// 	if(selectingType[selectingIndex] =='circle'){ //-------------------------------------------------------------------
	// 		setDefaultMode(false); // reset

	// 		selectorElement = main.append("circle")
	// 			.attr({
	// 				r:0,
	// 				x:0,
	// 				y:0,
	// 				visibility : 'hidden',
	// 				'class' : "selection"
	// 			})

	// 		setSelectionMode();
	// 		selectorScreen
	// 		.on( "mousedown", function() { 

	// 			var p = d3.mouse( this);
				 
	// 				selectorElement.attr({
	// 						class   : "selection",
	// 						cx       : p[0],
	// 						cy       : p[1],
	// 						r: 10,
	// 						visibility : 'visible',
	// 						stroke     : 'gray'
	// 					})
	// 		})
	// 		.on('mousemove', function(event){  
	// 			if( !(selectorElement.attr('visibility') == 'hidden') ) {
	// 				var p = d3.mouse( this),
			 
	// 					d = {
	// 						cx       : parseInt( selectorElement.attr( "cx"), 10),
	// 						cy       : parseInt( selectorElement.attr( "cy"), 10),
	// 						r 		 : 0
	// 					};
	// 					// calc new R
					
	// 				d.r = Math.sqrt(Math.pow(p[0]-d.cx,2)+Math.pow(p[1]-d.cy,2)) +10;	

	// 				selectorElement.attr( d);			 

	// 			}
				
	// 		})
	// 		.on('mouseup', function(){
	// 			if(selectorElement.attr('visibility') == 'visible'){

	// 				var circle = {
	// 					x       : parseInt( selectorElement.attr( "cx"), 10),
	// 					y       : parseInt( selectorElement.attr( "cy"), 10),
	// 					r   	: parseInt( selectorElement.attr( "r"), 10),
	// 					isPointInside  : function(cx,cy){
	// 						return ( ( Math.pow( this.x-30-cx ,2) + Math.pow( this.y-30-cy ,2) ) <= Math.pow(this.r,2) ) 
	// 					}
	// 				};
					
	// 				var selectedNodes = selectionNodesInsideElement(class_selector,circle);
					
					
	// 			}	
	// 			selectorElement.attr('visibility','hidden');
	// 		})

	// 	} else if (selectingType[selectingIndex] =='rect'){ //--------------------------------------------------------------
	// 		setDefaultMode(false);
	// 		selectorElement = main.append("rect")
	// 				.attr({
	// 					'width':0,
	// 					'height':0,
	// 					'class' : "selection",
	// 					'visibility' : 'hidden'
	// 				})	
	
	// 		setSelectionMode();
	// 		selectorScreen
	// 			.on( "mousedown", function() {
	// 				var p = d3.mouse( this);
				 
	// 				selectorElement.attr({
	// 						rx      : 6,
	// 						ry      : 6,
	// 						class   : "selection",
	// 						x       : p[0],
	// 						y       : p[1],
	// 						width   : 0,
	// 						height  : 0,
	// 						visibility : 'visible',
	// 						stroke     : 'gray'
	// 					})
	// 			})
	// 			.on( "mousemove", function() {
	// 				if( !(selectorElement.attr('visibility') == 'hidden') ) {
	// 					var p = d3.mouse( this),
				 
	// 						d = {
	// 							x       : parseInt( selectorElement.attr( "x"), 10),
	// 							y       : parseInt( selectorElement.attr( "y"), 10),
	// 							width   : parseInt( selectorElement.attr( "width"), 10),
	// 							height  : parseInt( selectorElement.attr( "height"), 10)
	// 						},
	// 						move = {
	// 							x : Math.floor(p[0]) - d.x,   //why? - works O.o
	// 							y : p[1] - d.y
	// 						}
	// 					;	
		 
	// 					if( move.x < 1 || (move.x*2<d.width)) {
	// 						d.x = p[0];
	// 						d.width -= move.x;
	// 					} else {
	// 						d.width = move.x;       
	// 					}
				 
	// 					if( move.y < 1 || (move.y*2<d.height)) {
	// 						d.y = p[1];
	// 						d.height -= move.y;
	// 					} else {
	// 						d.height = move.y;       
	// 					}
					   
	// 					selectorElement.attr( d);
	// 				}
	// 			})
	// 			.on( "mouseup", function(event) {
					
	// 				if(selectorElement.attr('visibility') == 'visible'){

	// 					var rect = {
	// 							x       : parseInt( selectorElement.attr( "x"), 10),
	// 							y       : parseInt( selectorElement.attr( "y"), 10),
	// 							width   : parseInt( selectorElement.attr( "width"), 10),
	// 							height  : parseInt( selectorElement.attr( "height"), 10),
	// 							isPointInside  : function(cx,cy){
	// 								return ( ((cx)>=(this.x-pxMargin)) && cx<=this.x+this.width-pxMargin && 
	// 								((cy)>=(this.y-pxMargin)) && cy<=this.y+this.height-pxMargin );
	// 							}
	// 					};
	// 					selectionNodesInsideElement(class_selector,rect);

	// 				}	
	// 				selectorElement.attr('visibility','hidden');
	// 			});
						
	// 	} else{ // do not select! //-----------------------------------------------------------------------------------------
	// 		setDefaultMode(true);
	// 	}

	// 	//stop showing browser menu
	// 	event.preventDefault();
	// }


	// function to check if the nodes are in the SelectorElement => selectorElement.isPointInside(cx,cy)
	function selectInElement(selectClass, selectorElement, trueReturn, falseReturn){
		d3.selectAll(selectClass).classed('selected', function(d){
				var cy = d3.select(this).attr('cy'),
					cx = d3.select(this).attr('cx');
				if( 
					selectorElement.isPointInside(cx,cy)
				){ 	   	return trueReturn(this) ;}
				else{   return falseReturn(this); }
		})
	}

	function selectionNodesInsideElement(class_selector,selectionElement){
		var selectClass = '.'+class_selector+' .node';

		if (d3.event.shiftKey) { // EXCLUDE selected nodes from selection
			//deselect 
			selectInElement(selectClass,selectionElement,function(){return false}, function(d){ return d3.select(d).classed('selected');})

		} else if (d3.event.ctrlKey){ // INCLUDE selected nodes in selection
			//select 
			selectInElement(selectClass,selectionElement,function(){return true},function(d){ return d3.select(d).classed('selected');})	

		} else { // SELECT only the selected nodes
			// deselect all
			d3.selectAll( selectClass).classed( "selected", false);
			//select 
			selectInElement(selectClass,selectionElement,function(d){return true},function(){return false})							
		}

		var selectedNodes = d3.selectAll('.chart'+selectClass+".selected");
		if(selectedNodes[0].length == 0) {
			d3.selectAll(selectClass).classed( "selected", true);

			var data = d3.selectAll(selectClass).data();
			data.forEach( function(d){ d.selected = true; })
		} else{
			var data = d3.selectAll('.chart'+selectClass).data();
			data.forEach( function(d){ d.selected = false; })
			data = d3.selectAll('.chart'+selectClass+".selected").data();
			data.forEach( function(d){ d.selected = true; })
		}

		dispatchSelected()
	}
}


(function() {
	function Phonebook() {
		var dict= { // found with Levenshtein Distance levDist() - misspelling deputies names
			'ANDRE VARGAS':'ANDRÉ VARGAS',
			'JOSE STÉDILE':'JOSÉ STÉDILE', 
			'DUDIMAR PAXIUBA':'DUDIMAR PAXIÚBA', 
			'MARCIO REINALDO MOREIRA':'MÁRCIO REINALDO MOREIRA', 
			'FELIX MENDONÇA JÚNIOR':'FÉLIX MENDONÇA JÚNIOR', 
			'FABIO TRAD':'FÁBIO TRAD', 
			'JOÃO PAULO  LIMA':'JOÃO PAULO LIMA', 
			'JERONIMO GOERGEN':'JERÔNIMO GOERGEN', 
			'JAIRO ATAIDE':'JAIRO ATAÍDE',
			'OSMAR  TERRA':'OSMAR TERRA', 
			'MARCIO MARINHO':'MÁRCIO MARINHO',
			'LAERCIO OLIVEIRA':'LAÉRCIO OLIVEIRA',
			'EMILIA FERNANDES':'EMÍLIA FERNANDES',
			'SIBA MACHADO':'SIBÁ MACHADO', 
			'JOAO ANANIAS':'JOÃO ANANIAS',
			'PADRE JOAO':'PADRE JOÃO',
			'JOSE HUMBERTO':'JOSÉ HUMBERTO',
			'ROGERIO CARVALHO':'ROGÉRIO CARVALHO',
			'JOSÉ  C. STANGARLINI':'JOSÉ C. STANGARLINI',
			'JOSÉ C STANGARLINI':'JOSÉ C. STANGARLINI', 
			'MANUELA DÁVILA':'MANUELA D`ÁVILA', 
			'CHICO DANGELO':'CHICO D`ANGELO', 
			'VANESSA  GRAZZIOTIN':'VANESSA GRAZZIOTIN', 
			'FRANCISCO TENORIO':'FRANCISCO TENÓRIO', 
			'CLAUDIO DIAZ':'CLÁUDIO DIAZ',
			'DR. PAULO CESAR':'DR. PAULO CÉSAR', 
			'ANDRE ZACHAROW':'ANDRÉ ZACHAROW',
			'ISAIAS SILVESTRE':'ISAÍAS SILVESTRE', 
			'LEO ALCÂNTARA':'LÉO ALCÂNTARA', 
			'CARLOS  MELLES':'CARLOS MELLES', 
			'DAVI ALVES SILVA JUNIOR':'DAVI ALVES SILVA JÚNIOR', 
			'WELINTON FAGUNDES':'WELLINGTON FAGUNDES',
			'WELLINTON FAGUNDES':'WELLINGTON FAGUNDES',
			'SERGIO CAIADO':'SÉRGIO CAIADO', 
			'TARCISIO ZIMMERMANN':'TARCÍSIO ZIMMERMANN',
			'CLAUDIO RORATO':'CLÁUDIO RORATO', 
			'MARCIO BITTAR':'MÁRCIO BITTAR', 

		}
		
		var names = {}; // possible more than 1 name for each deputy
		var deputyIDcount=0;
		var deputyIDs ={};
		var phonebookOBJs = {};

		function getDeputyObj(deputyID){
			if( phonebookOBJs[deputyID] === undefined) phonebookOBJs[deputyID]={};

			return phonebookOBJs[deputyID];
		}

		function getDeputyID(name){
			// correct misspelled 
			if( dict[name] != undefined) name = dict[name];

			if(deputyIDs[name] == undefined) {deputyIDs[name] = deputyIDcount++; }
			return deputyIDs[name];
		}

		function insertNameIdeCadastro(name,ideCadastro){
			if( dict[name] != undefined) name = dict[name];
			names[name]=ideCadastro;
		}

		function getIdeCadastro(name){
			if( dict[name] != undefined) name = dict[name];

			return names[name];
		}

		function getIndexedName(name){
			if( dict[name] != undefined) name = dict[name];
			return name;
		}

		function getNames(){
			return names;
		}

		return {
				getDeputyObj			:   getDeputyObj,
				getDeputyID				:   getDeputyID,
				insertNameIdeCadastro	: 	insertNameIdeCadastro,
				getNames 				: 	getNames,
				getIdeCadastro 			: 	getIdeCadastro,
				getIndexedName 			: 	getIndexedName
		};
	}

	//	Levenshtein Distance
	// var ar = phonebook.getNames()
	// $.each(ar, function(i){ $.each(ar, function(j){ if(i!=j){ var d = levDist(i,j); if(d<3)console.log("'"+i+"':'"+j+"',")   } })})
	//http://www.merriampark.com/ld.htm, http://www.mgilleland.com/ld/ldjavascript.htm, Damerau–Levenshtein distance (Wikipedia)
	var levDist = function(s, t) {
	    var d = []; //2d matrix

	    // Step 1
	    var n = s.length;
	    var m = t.length;

	    if (n == 0) return m;
	    if (m == 0) return n;

	    //Create an array of arrays in javascript (a descending loop is quicker)
	    for (var i = n; i >= 0; i--) d[i] = [];

	    // Step 2
	    for (var i = n; i >= 0; i--) d[i][0] = i;
	    for (var j = m; j >= 0; j--) d[0][j] = j;

	    // Step 3
	    for (var i = 1; i <= n; i++) {
	        var s_i = s.charAt(i - 1);

	        // Step 4
	        for (var j = 1; j <= m; j++) {

	            //Check the jagged ld total so far
	            if (i == j && d[i][j] > 4) return n;

	            var t_j = t.charAt(j - 1);
	            var cost = (s_i == t_j) ? 0 : 1; // Step 5

	            //Calculate the minimum
	            var mi = d[i - 1][j] + 1;
	            var b = d[i][j - 1] + 1;
	            var c = d[i - 1][j - 1] + cost;

	            if (b < mi) mi = b;
	            if (c < mi) mi = c;

	            d[i][j] = mi; // Step 6

	            //Damerau transposition
	            if (i > 1 && j > 1 && s_i == t.charAt(j - 2) && s.charAt(i - 2) == t_j) {
	                d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost);
	            }
	        }
	    }

	    // Step 7
	    return d[n][m];
	}

	if (typeof define === "function" && define.amd) define(function() { return Phonebook; });
	else if (typeof module === "object" && module.exports) module.exports = Phonebook;
	else this.Phonebook = Phonebook;
})();
