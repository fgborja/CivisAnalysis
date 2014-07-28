// renamed parties
// PFL ==> DEM
// PPB ==> PP
// PL + PRONA ==> PR
var legislatures = [
	{name:'49ª Legislature', regimeParty:'PFL',  start: new Date(1991,1,1) ,end: new Date(1995,0,31)},
	{name:'50ª Legislature', regimeParty:'PSDB', start: new Date(1995,1,1) ,end: new Date(1999,0,31)},
	{name:'51ª Legislature', regimeParty:'PSDB', start: new Date(1999,1,1) ,end: new Date(2003,0,31)},
	{name:'52ª Legislature', regimeParty:'PT',   start: new Date(2003,1,1) ,end: new Date(2007,0,31)},
	{name:'53ª Legislature', regimeParty:'PT',   start: new Date(2007,1,1) ,end: new Date(2011,0,31)},
	{name:'54ª Legislature', regimeParty:'PT',   start: new Date(2011,1,1), end: new Date(2015,0,31)}
]

var presidents = [
  {name: 'Collor (PRN)'     , start:new Date(1991,0,1),end:new Date(1992,11,29)},
  {name: 'Itamar (PMDB)'    , start:new Date(1992,11,29),end:new Date(1995,0,1)},
  {name: 'FHC (PSDB) 1ºMan.', start:new Date(1995,0,1),end:new Date(1999,0,1)},
  {name: 'FHC (PSDB) 2ºMan.', start:new Date(1999,0,1),end:new Date(2003,0,1)},
  {name: 'Lula (PT) 1ºMan.' , start:new Date(2003,0,1),end:new Date(2007,0,1)},
  {name: 'Lula (PT) 2ºMan.' , start:new Date(2007,0,1),end:new Date(2011,0,1)},
  {name: 'Dilma (PT) 1ºMan.', start:new Date(2011,0,1),end:new Date(2015,0,1)}
]

var startingYear = 1991;
var years = $.map(Array(24), function(d,i){ return {name:i+startingYear, start: new Date(i+startingYear,0,1), end: new Date(i+startingYear+1,0,1)}   })

//- organization:
// the first alliances[0] is the elected
// the first party[0] of the alliance is the party of the elected president  
var elections = {
	49: {
		name: "1989",
		turns:2,
		dates:[new Date(1989,10,15)],
		alliances: [
			{ 
				president:"Collor (PRN)", name:"Movimento Brasil Novo", 
				parties:["PRN", "PSC", "PTR", "PST"],
				result:[0.3057,0.5304]
			}, 
			{
				president:"Lula (PT)" , name:"Frente Brasil Popular", 
				parties:["PT","PSB","PCdoB"],
				result:[0.1718,0.4696]
			},
			{
				president:"Brizola (PDT)", name:'PDT', 
				parties:["PDT"],
				result:[0.1651]
			}, 
			{
				president:"Covas (PSDB)", name:"PSDB", 
				parties:["PSDB"],
				result:[0.1151]
			} 
		]
	},
	50: {
		name: "1994",
		turns:1,
		dates:[new Date(1994,9,2)],
		alliances: [
			{ 
				president:"FHC (PSDB)", name:"União,Trabalho e Progresso", 
				parties:["PSDB","PFL","DEM","PTB"],
				result:[0.5427]
			}, 
			{
				president:"Lula (PT)" , name:"Frente Brasil Popular da Cidadania", 
				parties:["PT","PSB","PCdoB","PPS","PV","PSTU"],
				result:[0.2704]
			},
			{
				president:"Enéas (PRONA)", name:'PRONA', 
				parties:["PRONA"],
				result:[0.0738]
			}, 
			{
				president:"Orestes (PMDB)", name:"O Desenvolvimento do Brasil", 
				parties:["PMDB","PSD"],
				result:[0.0438]
			} 
		]
	},
	
	51: {
		name: "1998",
		turns:1,
		dates:[new Date(1998,9,4)],
		alliances: [
			{
				president:"FHC (PSDB)", name:"Coligação União, trabalho e progresso", 
				parties:["PSDB","DEM","PFL","PP","PPB","PTB"],
				result:[0.5306]
			}, 
			{
				president:"Lula (PT)" , name:"Coligação União do Povo - Muda Brasil", 
				parties:["PT","PDT","PSB","PCdoB","PCB"],
				result:[0.3171]
			}, 
			{
				president:"Ciro Gomes (PPS)", name:"Coligação Brasil Real e Justo", 
				parties:["PPS","PMDB","PR","PL","PAN"],
				result:[0.1097]
			}, 
			{
				president:"Enéas (PRONA)", name:'PRONA', 
				parties:["PRONA"],
				result:[0.0214]
			}
		]
	},
	52: {
		name: "2002",
		turns:2,
		dates:[new Date(2002,9,6),new Date(2002,9,27)],
		alliances: [
			{
				president:"Lula (PT)", name:"Coligação Lula Presidente", 
				parties:["PT","PL","PR","PV","PCdoB","PMN","PCB"],
			result:[0.4647,0.6128]
			},
			{
				president:"José Serra (PSDB)", name:"Coligação Grande Aliança", 
				parties:["PSDB","PMDB"],
			result:[0.2319,0.3872]
			},
			{
				president:"Anthony Garotinho (PSB)", name:"Coligação Brasil Esperança", 
				parties:["PSB","PPB","PP","PTC","PHS","PSL"],
			result:[0.1786]
			},
			{
				president:"Ciro Gomes (PPS)", name:"Coligação Frente Trabalhista", 
				parties:["PPS","PDT","PTB"],
			result:[0.1197]
			}
		]
	},
	53: {
		name: "2006",
		turns:2,
		dates:[new Date(2006,9,1),new Date(2006,9,29)],
		alliances: [
			 {
			 	president:"Lula (PT)", name:"Coligação A Força do Povo", 
			 	parties:["PT","PRB","PCdoB"],
				result:[0.4861,0.6083]
			 },
			 {
			 	president:"Geraldo Alckmin (PSDB)", name:"Coligação por um Brasil Decente", 
			 	parties:["PSDB","PFL","DEM"],
				result:[0.4164,0.3917]
			 },
			 {
			 	president:"Heloísa Helena (PSOL)", name:"Coligação Frente de Esquerda", 
			 	parties:["PSOL", "PCB", "PSTU"],
				result:[0.0685]
			 },
			 {
			 	president:"Cristovam Buarque (PDT)", name:"PDT", 
			 	parties:["PDT"],
				result:[0.0264]
			 }
		]
	},
	54:{
		name: "2010",
		turns:2,
		dates:[new Date(2010,9,3),new Date(2010,9,31)],
		alliances: [
			 { 
			 	president:"Dilma (PT)", name:"Coligação Para o Brasil Seguir Mudando", 
			 	parties:["PT", "PMDB", "PDT", "PCdoB", "PSB", "PR","PL", "PRB", "PTN", "PSC", "PTC"],
				result:[0.4691,0.5605] 
			 },
			 { 
			 	president:"José Serra (PSDB)", name:"Coligação O Brasil Pode Mais", 
				parties:["PSDB", "DEM","PFL", "PTB", "PPS", "PMN", "PTdoB"],
				result:[0.3261,0.4395]
			 },  
			 { 
			 	president:"Marina Silva (PV)", name:"PV", 
				parties:["PV"],
				result:[0.1933]
			 },
			 { 
			 	president:"Plínio de Arruda (PSOL)", name:"PSOL", 
				parties:["PSOL"],
				result:[0.0087]
			 }
		]
	},
	55:{
		name: "2014",
		turns:2,
		dates:[new Date(2014,10,3)],
		alliances: [
			 { 
			 	president:"Dilma (PT)", name:"Coligação Com a Força do Povo", 
			 	parties:["PT", "PP", "PROS", "PCdoB", "PMDB", "PSD","PR", "PDT", "PRB"],
				result:[0] 
			 },
			 { 
			 	president:"Aécio Neves (PSDB)", name:"Coligação Muda Brasil", 
				parties:["PSDB", "DEM","PFL","PTN","PTC","PTB","SDD", "PEN", "PTdoB"],
				result:[0]
			 },  
			 { 
			 	president:"Eduardo Campos (PSB)", name:"Coligação Unidos pelo Brasil", 
				parties:["PSB","PPS","PHS","PRP","PPL","PSL"],
				result:[0]
			 },
			 { 
			 	president:"Pastor Everaldo (PSC)", name:"PSC", 
				parties:["PSC"],
				result:[0]
			 }
		]
	}
}


// COLORS!

var partiesNamesColor= {"DEM":"LightCoral", "PFL":"LightCoral", // PFL ==> DEM
					  "PSDB":"#1f77b4",
					  "PP":"#008000", "PPB": "#008000", // PPB ==> PP
					  "PL":"#ffbb78", "PR":"#ffbb78",   // PL + PRONA ==> PR
					  "PMDB":"#393b79", 
					  "PT":"#d62728", 
					  "PDT":"LimeGreen", "PSB":"LightGreen",
					  "PTB":"#9467bd",
					  "PSD":"#660000",
					  "PSOL":"#FFCC00",
					  "PV":"#e377c2",
					  "PPS":"#666",
					  "PCdoB":"Brown",
					  "SDD":"DarkOrange",
					  "Solidaried":"DarkOrange ", 
					  "PROS":"Orange",
					  "PRONA": "DarkOrange",
					  "PRN": "#8c564b","PSC":"#8c564b",
}


/*var labelParties = [['PT','PT'],['PMDB','PMDB'],['PFL/DEM','DEM'],['PSDB','PSDB'],['PPB/PP','PP'],['PL/PR','PR'],['PDT','PDT'],['PSB','PSB']];

$(document).ready(function () {

	$.each(labelParties, function(d){   
		$('#labelColorDeputies').append('<div class="input-group">'+
			'<input value='+ partiesNamesColor[labelParties[d][1]]+' class="pick-a-color"></input>'+
			'<button class="btn btn-default">'+labelParties[d][0]+'</button>'+
			'</div>'
			);
	})


   $(".pick-a-color").pickAColor({ showHexInput  : false});
});*/