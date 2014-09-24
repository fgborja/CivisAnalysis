
var CONGRESS_DEFINE = {
	votoToInteger : {"Sim":0,"Não":1,"Abstenção":2,"Obstrução":3,"Art. 17":4,"Branco":5},
	integerToVote : ["Sim","Não","Abstenção","Obstrução","Art. 17","Branco"],
	//var integerToVote = {'0':"Sim",'1':"Não",'2':"Abstenção",'3':"Obstrução",'4':"Art. 17",'5':"Branco"};

	startingYear : 1991,
	endingYear : 2014,

	// renamed parties
	// PFL ==> DEM
	// PPB ==> PP
	// PL + PRONA ==> PR
	legislatures : [
		{name:'49ª Legislature', regimeParty:'PFL',  start: new Date(1991,1,1) ,end: new Date(1995,0,31)},
		{name:'50ª Legislature', regimeParty:'PSDB', start: new Date(1995,1,1) ,end: new Date(1999,0,31)},
		{name:'51ª Legislature', regimeParty:'PSDB', start: new Date(1999,1,1) ,end: new Date(2003,0,31)},
		{name:'52ª Legislature', regimeParty:'PT',   start: new Date(2003,1,1) ,end: new Date(2007,0,31)},
		{name:'53ª Legislature', regimeParty:'PT',   start: new Date(2007,1,1) ,end: new Date(2011,0,31)},
		{name:'54ª Legislature', regimeParty:'PT',   start: new Date(2011,1,1), end: new Date(2015,0,31)}
	],

	presidents : [
	  {name: 'Collor (PRN)'     , start:new Date(1991,0,1),end:new Date(1992,11,29)},
	  {name: 'Itamar (PMDB)'    , start:new Date(1992,11,29),end:new Date(1995,0,1)},
	  {name: 'FHC (PSDB) 1ºMan.', start:new Date(1995,0,1),end:new Date(1999,0,1)},
	  {name: 'FHC (PSDB) 2ºMan.', start:new Date(1999,0,1),end:new Date(2003,0,1)},
	  {name: 'Lula (PT) 1ºMan.' , start:new Date(2003,0,1),end:new Date(2007,0,1)},
	  {name: 'Lula (PT) 2ºMan.' , start:new Date(2007,0,1),end:new Date(2011,0,1)},
	  {name: 'Dilma (PT) 1ºMan.', start:new Date(2011,0,1),end:new Date(2015,0,1)}
	],

	//- organization:
	// the first alliances[0] is the elected
	// the first party[0] of the alliance is the party of the elected president  
	elections : {
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
				 	president:"Dilma Rousseff (PT)", name:"Coligação Para o Brasil Seguir Mudando", 
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
				 	president:"Dilma Rousseff (PT)", name:"Coligação Com a Força do Povo", 
				 	parties:["PT", "PP", "PROS", "PCdoB", "PMDB", "PSD","PR", "PDT", "PRB"],
					result:[0] 
				 }, 
				 { 
				 	president:"Marina Silva (PSB)", name:"Coligação Unidos pelo Brasil", 
					parties:["PSB","PPS","PHS","PRP","PPL","PSL"],
					result:[0]
				 },
				 { 
				 	president:"Aécio Neves (PSDB)", name:"Coligação Muda Brasil", 
					parties:["PSDB", "DEM","PFL","PTN","PTC","PTB","SDD", "PEN", "PTdoB"],
					result:[0]
				 }, 
				 { 
				 	president:"Pastor Everaldo (PSC)", name:"PSC", 
					parties:["PSC"],
					result:[0]
				 }
			]
		}
	},

	// COLORS!
	// ===============================================================================================================
	// colors representing the single vote value
	votoStringToColor : {"Sim":"green","Não":"red","Abstenção":"purple","Obstrução":"blue","Art. 17":"yellow","null":'grey'},

	// ===============================================================================================================
	votingColorGradient : ["rgb(165,0,38)","rgb(215,48,39)","rgb(244,109,67)","rgb(253,174,97)",
	 "rgb(254,224,139)","rgb(255,255,191)","rgb(217,239,139)","rgb(166,217,106)",
	 "rgb(102,189,99)","rgb(26,152,80)","rgb(0,104,55)"],

	// ================================================================================================================
	partiesNamesColor : {"DEM":"LightCoral", "PFL":"LightCoral", // PFL ==> DEM
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
	},
	// PARTY COLORS =================================================================================================
	getConstantPartyColor : function(party){ 
		if(CONGRESS_DEFINE.partiesNamesColor[party] !== undefined ) 
			{return CONGRESS_DEFINE.partiesNamesColor[party];}
		else{ /*console.log(party);*/ return "#AAA" }
	},
}

CONGRESS_DEFINE.years = $.map( d3.range(CONGRESS_DEFINE.startingYear, CONGRESS_DEFINE.endingYear+1), function(d){ return {name:d, start: new Date(d,0,1), end: new Date(d+1,0,1)}   });

CONGRESS_DEFINE.votingColor = d3.scale.quantize()
			.domain([-1.0, 1.0])
			.range(d3.range(11).map(function(d) {  return CONGRESS_DEFINE.votingColorGradient[d] ; }));

// getPartyColor changes as the paties goes to an electoral alliance
CONGRESS_DEFINE.getPartyColor = CONGRESS_DEFINE.getConstantPartyColor;


CONGRESS_DEFINE.partiesTrace = {"PSB":{"1991":{"center":[0.16964261653508086,0.5802559131389444],"size":10},"1993":{"center":[-0.3385071455437164,0.45672392773541365],"size":9},"1995":{"center":[0.4258539337914652,0.5858466591785814],"size":13},"1997":{"center":[0.35138020983591434,0.6329274948574738],"size":13},"1999":{"center":[0.07700068810071287,0.9519985997859103],"size":12},"2001":{"center":[-0.0026099446037498473,0.7542896138488077],"size":16},"2003":{"center":[0.6435469381723778,0.016477434132099844],"size":20},"2005":{"center":[0.6229250329667084,0.09051009976932194],"size":26},"2007":{"center":[0.720546609497799,-0.07822765936413466],"size":30},"2009":{"center":[0.6491779583904,-0.016366171695794438],"size":26},"2011":{"center":[0.6281240907179422,0.023206455858589787],"size":29},"2013":{"center":[0.49901190924753325,-0.07845851030914877],"size":25}},"PSDB":{"1991":{"center":[-0.16998806717977255,0.46921220492013604],"size":40},"1993":{"center":[-0.4724077650719251,0.15188501784389766],"size":48},"1995":{"center":[-0.6479376883483883,0.2607242840335941],"size":85},"1997":{"center":[-0.6860175236409386,0.22148283368712465],"size":96},"1999":{"center":[-0.8060236236145437,0.01722833140817882],"size":105},"2001":{"center":[-0.6493033708674742,-0.09102417620689236],"size":91},"2003":{"center":[0.06771715555115022,-0.7527787403461842],"size":47},"2005":{"center":[0.2773348705722476,-0.668024758079444],"size":48},"2007":{"center":[-0.14960022591771013,-0.9175463053694548],"size":57},"2009":{"center":[0.18632067612722975,-0.7854880365832211],"size":55},"2011":{"center":[-0.03234896939460721,-0.7504664887679403],"size":46},"2013":{"center":[0.35839262737612954,-0.5572571840799989],"size":44}},"PDT":{"1991":{"center":[-0.0003110189122022784,0.493716779829027],"size":40},"1993":{"center":[-0.28321179077769637,0.3399704258579433],"size":28},"1995":{"center":[0.47428862563903923,0.7478051940130218],"size":24},"1997":{"center":[0.531326416758163,0.8120064393514729],"size":22},"1999":{"center":[0.09819493734992493,0.8973063165753137],"size":20},"2001":{"center":[-0.05047628688688408,0.8297131164912976],"size":18},"2003":{"center":[0.5781582189434735,-0.0941397197887137],"size":13},"2005":{"center":[0.4589195175352361,-0.3923924066013813],"size":18},"2007":{"center":[0.8434773103002152,-0.028732450063642483],"size":24},"2009":{"center":[0.667515904282225,-0.030189343102950433],"size":23},"2011":{"center":[0.5619757012276797,-0.13785241387057132],"size":25},"2013":{"center":[0.5400820918831043,-0.005756561756423524],"size":18}},"PMDB":{"1991":{"center":[-0.4341518944355016,0.309026717866335],"size":101},"1993":{"center":[-0.46629367635655783,-0.011320489760824243],"size":92},"1995":{"center":[-0.4955168150754249,0.2620216253942334],"size":98},"1997":{"center":[-0.47794884130756116,0.3248552032172134],"size":86},"1999":{"center":[-0.6508446474189208,0.13749170265401425],"size":95},"2001":{"center":[-0.5480777951717651,0.06619098670148763],"size":84},"2003":{"center":[0.6240213987909362,-0.11698320691047853],"size":72},"2005":{"center":[0.5236135406141207,-0.06421240082413035],"size":75},"2007":{"center":[0.7518356538851853,-0.09986210624459055],"size":90},"2009":{"center":[0.6533843080571484,0.04869304324377705],"size":85},"2011":{"center":[0.6000876247105713,-0.04931233828092215],"size":78},"2013":{"center":[0.551016653480802,-0.07227107529176657],"size":71}},"PT":{"1991":{"center":[0.22465723295003928,0.6157446184438035],"size":35},"1993":{"center":[-0.2964696921395428,0.6282095091888101],"size":35},"1995":{"center":[0.6135338652555378,0.8498444641148939],"size":50},"1997":{"center":[0.5960225279316532,0.8072926864224101],"size":50},"1999":{"center":[0.09394344045085613,1.0990468953707198],"size":59},"2001":{"center":[-0.13718113362076137,0.8724618278743048],"size":59},"2003":{"center":[0.8214803589645954,0.08820992523969408],"size":92},"2005":{"center":[0.6956042030137788,0.33213885382131225],"size":82},"2007":{"center":[0.8718541441112573,0.04463939621439809],"size":80},"2009":{"center":[0.7286675124458499,0.2167021291933164],"size":75},"2011":{"center":[0.6747139571912477,0.22997854221596567],"size":87},"2013":{"center":[0.5737996575128373,0.5789748373958804],"size":85}},"PP":{"1991":{"center":[-0.4582700740853469,-0.013091700302272252],"size":25},"1993":{"center":[-0.4113857090334677,-0.07474194478340325],"size":41},"1995":{"center":[-0.6014260204237882,0.14095868853580976],"size":88},"1997":{"center":[-0.4638960957833008,0.29462619254941197],"size":80},"1999":{"center":[-0.714986050081707,-0.02727558969121583],"size":45},"2001":{"center":[-0.6026142836378506,-0.08096205907684881],"size":50},"2003":{"center":[0.5195446268746791,-0.17075179527465298],"size":53},"2005":{"center":[0.5547079604515609,-0.03545480023480865],"size":49},"2007":{"center":[0.7605858847784607,-0.15834565595201552],"size":40},"2009":{"center":[0.6222133726336945,0.014562066940677713],"size":38},"2011":{"center":[0.5982036661960253,-0.017264023583345472],"size":34},"2013":{"center":[0.5252557530454848,-0.05820708638685665],"size":35}},"PTB":{"1991":{"center":[-0.5053442682385817,-0.04314185649379514],"size":21},"1993":{"center":[-0.36966851430099595,-0.09949936334044317],"size":27},"1995":{"center":[-0.6424115167058807,0.2050673128853689],"size":26},"1997":{"center":[-0.6126710338816528,0.23767889811853818],"size":23},"1999":{"center":[-0.6564568228068578,0.21531926713507127],"size":25},"2001":{"center":[-0.5753041555587322,0.02254610048763072],"size":33},"2003":{"center":[0.6510038605654773,-0.004349458218525643],"size":50},"2005":{"center":[0.5713785629493932,0.03023185617619717],"size":42},"2007":{"center":[0.7219850636471185,-0.08357292616814888],"size":20},"2009":{"center":[0.6136355294647775,0.04127572826671983],"size":22},"2011":{"center":[0.579508548892115,-0.09521383257282384],"size":20},"2013":{"center":[0.48913783068200856,-0.08815106011349372],"size":16}},"PDS":{"1991":{"center":[-0.46295526703915446,-0.051435010326060404],"size":40}},"PR":{"1991":{"center":[-0.46924802205802,-0.07128815540521459],"size":18},"1993":{"center":[-0.388404340594314,-0.08791949795629485],"size":15},"1995":{"center":[-0.5058679339562215,0.1838601412659417],"size":9},"1997":{"center":[-0.30752243841641114,0.37945628590800334],"size":10},"1999":{"center":[-0.38443708406592764,0.5034332678138141],"size":11},"2001":{"center":[-0.36512541467120013,0.24476531784213928],"size":24},"2003":{"center":[0.6663900089440941,-0.026199346959614747],"size":41},"2005":{"center":[0.603874007298881,0.10454040317720391],"size":35},"2007":{"center":[0.7441807028500632,-0.07952412096536512],"size":41},"2009":{"center":[0.6395491293359966,0.05957091472066935],"size":41},"2011":{"center":[0.5019214498128576,-0.13830074190363323],"size":34},"2013":{"center":[0.577757678902808,-0.05879976232542283],"size":29}},"DEM":{"1991":{"center":[-0.5579493792143662,-0.11727281652581761],"size":65},"1993":{"center":[-0.40506659192965205,-0.23525381719116056],"size":82},"1995":{"center":[-0.6959636719611335,0.13985232006080825],"size":101},"1997":{"center":[-0.7127516670680563,0.13199688801133685],"size":113},"1999":{"center":[-0.7759561452659296,-0.018123398358219737],"size":105},"2001":{"center":[-0.6116106651058333,-0.07664836703569214],"size":91},"2003":{"center":[0.044311657129663874,-0.7272285954874019],"size":60},"2005":{"center":[0.21737137901165074,-0.6493856897076141],"size":56},"2007":{"center":[-0.085080392265196,-0.6911753151719867],"size":53},"2009":{"center":[0.2188435999193861,-0.715924397241372],"size":50},"2011":{"center":[0.02525401248530356,-0.7459385696102148],"size":27},"2013":{"center":[0.3986143138329658,-0.5322460300362515],"size":24}}};
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