
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
		{name:'49ª Legislature', regimeParty:'PFL',  period:[new Date(1991,1,1) ,new Date(1995,0,31)]},
		{name:'50ª Legislature', regimeParty:'PFL', period:[new Date(1995,1,1) ,new Date(1999,0,31)]},
		{name:'51ª Legislature', regimeParty:'PSDB', period:[new Date(1999,1,1) ,new Date(2003,0,31)]},
		{name:'52ª Legislature', regimeParty:'PT',   period:[new Date(2003,1,1) ,new Date(2007,0,31)]},
		{name:'53ª Legislature', regimeParty:'PT',   period:[new Date(2007,1,1) ,new Date(2011,0,31)]},
		{name:'54ª Legislature', regimeParty:'PT',   period:[new Date(2011,1,1) ,new Date(2015,0,31)]}
	],

	presidents : [
	  {name: 'Collor (PRN)'     , party:'PRN', period:[new Date(1991,0,1),  new Date(1992,11,29)]},
	  {name: 'Itamar (PMDB)'    , party:'PMDB', period:[new Date(1992,11,29),new Date(1995,0,1)]},
	  {name: 'FHC (PSDB) 1ºMan.', party:'PSDB', period:[new Date(1995,0,1),  new Date(1999,0,1)]},
	  {name: 'FHC (PSDB) 2ºMan.', party:'PSDB', period:[new Date(1999,0,1),  new Date(2003,0,1)]},
	  {name: 'Lula (PT) 1ºMan.' , party:'PT', period:[new Date(2003,0,1),  new Date(2007,0,1)]},
	  {name: 'Lula (PT) 2ºMan.' , party:'PT', period:[new Date(2007,0,1),  new Date(2011,0,1)]},
	  {name: 'Dilma (PT) 1ºMan.', party:'PT', period:[new Date(2011,0,1),  new Date(2015,0,1)]}
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
				 	president:"Dilma Rousseff (PT)", vice:"Michel Temer (PMDB)", name:"Coligação Com a Força do Povo", 
				 	parties:["PT", "PP", "PROS", "PCdoB", "PMDB", "PSD","PR", "PDT", "PRB"],
					result:[0.4159,0.5164] 
				 }, 
				 { 
				 	president:"Aécio Neves (PSDB)", vice:"Aloysio Nunes (PSDB)", name:"Coligação Muda Brasil", 
					parties:["PSDB", "DEM","PFL","PTN","PTC","PTB","SDD", "PEN", "PTdoB","PMN"],
					result:[0.3355,0.4836]
				 }, 
				 { 
				 	president:"Marina Silva (PSB)", vice:"Beto Albuquerque (PSB)", name:"Coligação Unidos pelo Brasil", 
					parties:["PSB","PPS","PHS","PRP","PPL","PSL"],
					result:[0.2132]
				 },
				 { 
				 	president:"Luciana Genro (PSOL)",vice:"Jorge Paz (PSOL)", name:"PSOL", 
					parties:["PSOL"],
					result:[0.0155]
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
	partiesArbitraryColor : {"DEM":"LightCoral", "PFL":"LightCoral", // PFL ==> DEM
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
	partiesIdeologyColor : {
			DEM: "rgb(79, 46, 157)",	PFL: "rgb(79, 46, 157)",
			PCdoB: "Brown",
			PDT: "#c74635",
			PL: "#395eb3",PR: "#395eb3",
			PMDB: "#39793b",
			PP: "#1c769f",PPB: "#1c769f",
			PPS: "#ed3b3b",
			PL:"#395eb3",
			PRN: "rgb(45, 132, 137)",
			PRONA: "#3b3397",
			PROS: "#ff1e00",
			PSB: "#dc4444",
			PSC: "#5779b1",
			PSD: "#5d5ec4",
			PSDB: "rgb(147, 165, 37)",
			PSOL: "#ff4400",
			PT: "#d62728",
			PTB: "#4f72a6",
			PV: "#e27e83",
			SDD: "#5316c1",
			Solidaried: "5316c1 ",
	},
	partiesColors:{},

	setIdeologyColors: function() {
		for (var party in CONGRESS_DEFINE.partiesIdeologyColor) {
				CONGRESS_DEFINE.partiesColors[party] = CONGRESS_DEFINE.partiesIdeologyColor[party];
			}	
	},
	setArbitraryColors: function() {
		for (var party in CONGRESS_DEFINE.partiesArbitraryColor) {
				CONGRESS_DEFINE.partiesColors[party] = CONGRESS_DEFINE.partiesArbitraryColor[party];
			}	
	},
	// PARTY COLORS =================================================================================================
	getConstantPartyColor : function(party){ 	
		if(CONGRESS_DEFINE.partiesColors[party] !== undefined ) 
			{return CONGRESS_DEFINE.partiesColors[party];}
		else{ /*console.log(party);*/ return "#AAA" }
	},
	setConstantPartyColor : function(party,color){
		CONGRESS_DEFINE.partiesColors[party] = color;
	}
}

CONGRESS_DEFINE.years = $.map( d3.range(CONGRESS_DEFINE.startingYear, CONGRESS_DEFINE.endingYear+1), function(d){ return {name:d, period:[new Date(d,0,1), new Date(d+1,0,1)] }   });

CONGRESS_DEFINE.votingColor = d3.scale.quantize()
			.domain([-1.0, 1.0])
			.range(d3.range(11).map(function(d) {  return CONGRESS_DEFINE.votingColorGradient[d] ; }));

// getPartyColor changes as the paties goes to an electoral alliance
CONGRESS_DEFINE.getPartyColor = CONGRESS_DEFINE.getConstantPartyColor;


CONGRESS_DEFINE.partiesTraces = {
	"extents":{"1991":[-0.6922823259959033,0.10602628627406574],"1993":[-0.6157612415654101,0.3116254155133558],"1995":[-0.8506187499286397,-0.00496064707978518],"1997":[-0.8227645506206337,-0.09943386326587421],"1999":[-1.106496481653531,0.02727558969121603],"2001":[-0.8721814612932582,0.09077687739793754],"2003":[-0.7406999093998435,0.08804363196269059],"2005":[-0.6269562885065636,0.3306536321949007],"2007":[-0.8986298800396415,0.05718960995177959],"2009":[-0.7664864487810462,0.21451617582546076],"2011":[-0.7446965990245483,0.22272496646126103],"2013":[-0.5634592317473482,0.6164647234235546]},
	"traces":{"PMDB":{"1991":{"center":[-0.4161249535867153,-0.306246775728173],"size":105},"1993":{"center":[-0.43563474194503304,0.015066987326552784],"size":101},"1995":{"center":[-0.4955932147955732,-0.2618379451873184],"size":98},"1997":{"center":[-0.47802248116561075,-0.3248397260870609],"size":86},"1999":{"center":[-0.6508446474189209,-0.13749170265401411],"size":95},"2001":{"center":[-0.5440456916356495,-0.06631019707465498],"size":85},"2003":{"center":[-0.6116789366912853,-0.11648758879273574],"size":75},"2005":{"center":[-0.5054384946688567,-0.05742650931248881],"size":81},"2007":{"center":[-0.740396822851219,-0.09975260809235031],"size":92},"2009":{"center":[-0.6477877871765011,0.051893788411934906],"size":86},"2011":{"center":[-0.5960650061968317,-0.04893506289979042],"size":79},"2013":{"center":[-0.5900681244230959,-0.06208622473276942],"size":73}},"PDS":{"1991":{"center":[-0.43314779082024085,0.03847360374893271],"size":46}},"PCB":{"1991":{"center":[0.11025453489190377,-0.6922823259959033],"size":3}},"PDC":{"1991":{"center":[-0.3687212811271143,0.011129540630065035],"size":20}},"PT":{"1991":{"center":[0.22615901516063647,-0.607725903982743],"size":35},"1993":{"center":[-0.2876263825136947,-0.6110682263628513],"size":36},"1995":{"center":[0.6134308784393819,-0.8506187499286397],"size":50},"1997":{"center":[0.5959034481601484,-0.8077814509532603],"size":50},"1999":{"center":[0.09394344045085627,-1.0990468953707189],"size":59},"2001":{"center":[-0.13595009220148196,-0.8721814612932582],"size":59},"2003":{"center":[-0.8204592586534595,0.08804363196269059],"size":92},"2005":{"center":[-0.6821362482467561,0.3306536321949007],"size":84},"2007":{"center":[-0.8644921977445803,0.0423832681720924],"size":81},"2009":{"center":[-0.7155549270291207,0.21451617582546076],"size":77},"2011":{"center":[-0.6594782701845788,0.22272496646126103],"size":90},"2013":{"center":[-0.5646415809361803,0.6164647234235546],"size":90}},"PP":{"1991":{"center":[-0.44415187943171786,0.016359593588994966],"size":27},"1993":{"center":[-0.39348587785638894,0.0587037123150755],"size":46},"1995":{"center":[-0.6014824308342983,-0.14074726871911133],"size":88},"1997":{"center":[-0.46396118361877925,-0.2946243772875581],"size":80},"1999":{"center":[-0.714986050081707,0.02727558969121603],"size":45},"2001":{"center":[-0.6019090187713327,0.07976795182004462],"size":50},"2003":{"center":[-0.5140325433443442,-0.1687463196492301],"size":54},"2005":{"center":[-0.5444780933333165,-0.03137845630162019],"size":51},"2007":{"center":[-0.7602069833270926,-0.15807611169736727],"size":40},"2009":{"center":[-0.5971276883583605,0.010060828965135004],"size":41},"2011":{"center":[-0.5730433249702639,-0.02248443566420121],"size":37},"2013":{"center":[-0.5274847842118248,-0.06186861903224294],"size":39}},"PSC":{"1991":{"center":[-0.3972444562696888,-0.014172487014027553],"size":6},"1993":{"center":[-0.35149580318262597,0.04209466025190789],"size":7},"1995":{"center":[-0.7264596896337093,-0.1634266903320208],"size":1},"1999":{"center":[-0.4610306122627332,-0.2611365808300998],"size":1},"2003":{"center":[-0.7139841391440198,0.0011138607903838306],"size":7},"2005":{"center":[-0.5669247352620487,0.02282430425181149],"size":6},"2007":{"center":[-0.7849462675116476,-0.118283501537289],"size":11},"2009":{"center":[-0.5738843063288348,-0.04635747922083941],"size":17},"2011":{"center":[-0.5222799400096231,-0.18112994665812526],"size":16},"2013":{"center":[-0.5439226217095257,-0.18405770549367081],"size":14}},"PPR":{"1991":{"center":[-0.5006493394766276,0.06097495112321912],"size":14},"1993":{"center":[-0.28411052953196914,0.3116254155133558],"size":66},"1995":{"center":[-0.4545170248747873,-0.014036671684281124],"size":1}},"PSDB":{"1991":{"center":[-0.16504804150338626,-0.4631420661086509],"size":41},"1993":{"center":[-0.4466925383723546,-0.14335767848998285],"size":51},"1995":{"center":[-0.6480046053680857,-0.26067705410608677],"size":85},"1997":{"center":[-0.6860991694617945,-0.2212183537462162],"size":96},"1999":{"center":[-0.8060236236145439,-0.01722833140817877],"size":105},"2001":{"center":[-0.6294362535979781,0.09077687739793754],"size":96},"2003":{"center":[-0.06405216353780764,-0.7406999093998435],"size":49},"2005":{"center":[-0.2559226467675789,-0.614267910763599],"size":56},"2007":{"center":[0.14564431893003157,-0.8986298800396415],"size":59},"2009":{"center":[-0.18543917543817334,-0.7664864487810462],"size":57},"2011":{"center":[0.028821852159599936,-0.7351543620902121],"size":48},"2013":{"center":[-0.4165288458361599,-0.5634592317473482],"size":45}},"PTB":{"1991":{"center":[-0.45812536855089614,0.04461195159758015],"size":26},"1993":{"center":[-0.35542544720855435,0.09901039042125125],"size":29},"1995":{"center":[-0.642484339769452,-0.2048079385583302],"size":26},"1997":{"center":[-0.6127471455766669,-0.2374902736080106],"size":23},"1999":{"center":[-0.6564568228068579,-0.2153192671350712],"size":25},"2001":{"center":[-0.57432440523214,-0.023554704282349237],"size":33},"2003":{"center":[-0.644622519748542,-0.0013611461198913771],"size":51},"2005":{"center":[-0.562800649006078,0.03562948434997411],"size":43},"2007":{"center":[-0.7215579020618563,-0.08342158037059308],"size":20},"2009":{"center":[-0.5865341805512304,0.03706099661538063],"size":24},"2011":{"center":[-0.578445391035863,-0.09499749125751904],"size":20},"2013":{"center":[-0.49533820535784645,-0.07335610222737862],"size":17}},"PDT":{"1991":{"center":[0.00734966568862535,-0.4696728037126352],"size":44},"1993":{"center":[-0.26307652047313007,-0.3218412637573775],"size":32},"1995":{"center":[0.4860191967526135,-0.7648350076487701],"size":23},"1997":{"center":[0.5311640199055877,-0.8121848486021672],"size":22},"1999":{"center":[0.09819493734992507,-0.8973063165753133],"size":20},"2001":{"center":[-0.04931399568315996,-0.8293288349034696],"size":18},"2003":{"center":[-0.5774052941327185,-0.09346148017119126],"size":13},"2005":{"center":[-0.421059757271574,-0.3574322681329005],"size":21},"2007":{"center":[-0.8430921268454638,-0.02877262853834274],"size":24},"2009":{"center":[-0.6660062244569896,-0.02827315826926515],"size":23},"2011":{"center":[-0.5519829034320245,-0.12849837590100266],"size":26},"2013":{"center":[-0.596170640197662,-0.02114710928931038],"size":18}},"PSB":{"1991":{"center":[0.16614274243936125,-0.5462929801447208],"size":11},"1993":{"center":[-0.3094066110992823,-0.42136463086583004],"size":10},"1995":{"center":[0.4257396577493991,-0.5858969530669591],"size":13},"1997":{"center":[0.3637584191035592,-0.6589772261266119],"size":12},"1999":{"center":[0.07700068810071291,-0.951998599785909],"size":12},"2001":{"center":[-0.0017873246434538595,-0.7538163792731267],"size":16},"2003":{"center":[-0.6291044991839186,0.01853107756442194],"size":21},"2005":{"center":[-0.6211324473748221,0.09376826340195477],"size":26},"2007":{"center":[-0.7202178626932872,-0.07809256537944945],"size":30},"2009":{"center":[-0.6308666226690448,-0.012092312965874655],"size":27},"2011":{"center":[-0.6169175333271207,0.021909851263353743],"size":30},"2013":{"center":[-0.5399262526173889,-0.14362120118414576],"size":25}},"PRS":{"1991":{"center":[-0.5622267204544632,0.016233511850729705],"size":3}},"NoParty":{"1991":{"center":[-0.2419577380154929,-0.03521168399539142],"size":7},"1993":{"center":[-0.2902307661910757,0.017439763437865435],"size":2},"1999":{"center":[0.05749550633284099,-1.0864940901364972],"size":2},"2001":{"center":[-0.078378029886462,-0.6846946735909345],"size":1},"2003":{"center":[-0.43946138872599433,-0.24873505083593675],"size":6},"2005":{"center":[-0.5127587452171875,-0.1323322823551744],"size":5}},"PTR":{"1991":{"center":[-0.3990242634952798,0.10602628627406574],"size":6}},"PCdoB":{"1991":{"center":[0.19857970915938009,-0.5768152218362941],"size":5},"1993":{"center":[-0.28455551135373264,-0.6157612415654101],"size":6},"1995":{"center":[0.5792759763582247,-0.7807244765310271],"size":10},"1997":{"center":[0.6010804879150407,-0.8227645506206337],"size":9},"1999":{"center":[0.09726962997402579,-1.106496481653531],"size":7},"2001":{"center":[0.012663136156337327,-0.8491026416491954],"size":10},"2003":{"center":[-0.8342985539206602,0.05512080422536764],"size":10},"2005":{"center":[-0.6532573382753711,0.12282053588407697],"size":10},"2007":{"center":[-0.9199225804347707,0.05718960995177959],"size":13},"2009":{"center":[-0.7051267874899821,0.0937685881320447],"size":12},"2011":{"center":[-0.6797594631099468,0.07378558376058564],"size":13},"2013":{"center":[-0.5941789553390575,0.467844784830241],"size":15}},"PV":{"1991":{"center":[0.04793844890084032,-0.5114503524095725],"size":1},"1993":{"center":[-0.31397690638794795,-0.59012018212217],"size":1},"1995":{"center":[0.2165698895213923,-0.6854319825524328],"size":1},"1997":{"center":[0.24647246988530858,-0.680679798762606],"size":1},"1999":{"center":[-0.0720320398814093,-0.9651166187042527],"size":1},"2001":{"center":[-0.5839721751914009,0.02997483848249043],"size":1},"2003":{"center":[-0.534654075098204,-0.14824755516912733],"size":6},"2005":{"center":[-0.31719693768130525,-0.34395584262877393],"size":8},"2007":{"center":[-0.6728910722086285,-0.16500256954146977],"size":14},"2009":{"center":[-0.5672949620869896,-0.07655155457209789],"size":15},"2011":{"center":[-0.41993803338478186,-0.14565957597012108],"size":11},"2013":{"center":[-0.5507930327900024,0.03437243952440952],"size":9}},"PTN":{"1991":{"center":[-0.5126354551188762,0.04727651678009881],"size":1},"1999":{"center":[-0.5094373743767074,-0.02895617159768726],"size":1},"2001":{"center":[-0.22035101472470975,-0.24167006757445908],"size":1}},"PST":{"1991":{"center":[-0.1510280852326794,-0.15255327246220116],"size":3},"1999":{"center":[-0.44544652882218133,-0.1975532606188876],"size":6},"2001":{"center":[-0.41506691107475485,-0.11724354008174853],"size":5}},"PMN":{"1991":{"center":[-0.38947527478404154,0.018181394495993396],"size":2},"1993":{"center":[-0.3603055513012927,0.15590423622163144],"size":2},"2007":{"center":[-0.7753806992325023,0.03659156159385367],"size":5},"2009":{"center":[-0.6788259788830228,-0.014099838402865647],"size":3},"2011":{"center":[-0.5356944246895383,-0.21060437145236588],"size":2},"2013":{"center":[-0.5144750569471953,-0.28044395309775894],"size":3}},"PRN":{"1991":{"center":[-0.41315642978935346,0.0791805832828461],"size":4},"1993":{"center":[-0.43342509898636256,0.08109032935183866],"size":3}},"PSD":{"1991":{"center":[-0.30233228365813736,0.0795150750039713],"size":6},"1993":{"center":[-0.2259022988629311,0.06745227131603308],"size":14},"1995":{"center":[-0.6196588754342081,-0.00496064707978518],"size":3},"1997":{"center":[-0.4970111938044694,-0.09943386326587421],"size":2},"2011":{"center":[-0.5000930012821047,-0.3156637385222767],"size":47},"2013":{"center":[-0.5484313753828928,-0.28403540515420894],"size":41}},"PRONA":{"1991":{"center":[-0.01630263381928111,-0.2342766440470335],"size":1},"1997":{"center":[-0.8195009603841563,-0.31591089731947036],"size":1},"2003":{"center":[0.20816337700201198,-0.62972724891561],"size":2},"2005":{"center":[-0.19152409221335334,-0.5480644385110356],"size":2}},"PPS":{"1993":{"center":[-0.5264823094171405,-0.3039319813072246],"size":3},"1995":{"center":[0.42151365420870324,-0.7785040616522108],"size":2},"1997":{"center":[0.1711748689602386,-0.7272926451023396],"size":7},"1999":{"center":[-0.1747076246847754,-0.8119639182205712],"size":12},"2001":{"center":[-0.26209570342345745,-0.6491532046965085],"size":13},"2003":{"center":[-0.6592173017367692,-0.07546089347121614],"size":23},"2005":{"center":[-0.4114620282823891,-0.4848566997811702],"size":16},"2007":{"center":[0.07267918974280922,-0.7453961163185521],"size":12},"2009":{"center":[-0.24304221078721036,-0.5909247104249334],"size":14},"2011":{"center":[-0.043624599704966335,-0.6273699742460567],"size":10},"2013":{"center":[-0.3736698701572032,-0.5551019008256888],"size":8}},"PSTU":{"1993":{"center":[-0.023068931273751814,-0.38003178342247224],"size":3},"1997":{"center":[0.5124681638312424,-0.7990822186010367],"size":1}},"PSL":{"1995":{"center":[-0.6870722515580525,-0.10515411452781721],"size":2},"1999":{"center":[-0.27251674841814627,-0.5419287074259856],"size":5},"2001":{"center":[-0.216903017759467,-0.44775210899073137],"size":5},"2003":{"center":[-0.9043564334899106,0.04209029286928894],"size":1},"2011":{"center":[-0.6674819329091146,-0.031571881204100906],"size":1}},"PHS":{"1999":{"center":[-0.8069502099130597,-0.10257752515865862],"size":1},"2001":{"center":[-0.36492820257937203,0.061300698912802376],"size":1},"2007":{"center":[-0.8529847134027582,-0.11307966482849449],"size":2},"2009":{"center":[-0.5857304507129267,0.011726167510793972],"size":3},"2011":{"center":[-0.731485774634472,-0.13908587856218668],"size":1}},"PSOL":{"2005":{"center":[-0.4283104045339763,-0.20888869586703432],"size":7},"2007":{"center":[-0.062059556970626595,-0.6278686115731918],"size":3},"2009":{"center":[-0.256058174595865,-0.2826121791455617],"size":4},"2011":{"center":[0.04699440677199453,-0.5329888570265647],"size":3},"2013":{"center":[-0.3497044724592362,0.020705869440749706],"size":3}},"PTC":{"2005":{"center":[-0.3783382036857783,-0.03631178568692427],"size":1},"2007":{"center":[-0.6747623806237136,0.034433329231318754],"size":1},"2009":{"center":[-0.2583108425543607,-0.34933288624506975],"size":3},"2011":{"center":[-0.46551181469158387,0.005922106340659126],"size":1}},"PR":{"1991":{"center":[-0.43618756255080615,0.05994879671204001],"size":20},"1993":{"center":[-0.37205484389113946,0.088255334755861],"size":16},"1995":{"center":[-0.5059019120068231,-0.18398131384176328],"size":9},"1997":{"center":[-0.30761525677080026,-0.37939815614812955],"size":10},"1999":{"center":[-0.3844370840659277,-0.5034332678138135],"size":11},"2001":{"center":[-0.3642551259879428,-0.24557959240057906],"size":24},"2003":{"center":[-0.6506591519919986,-0.022673414832944036],"size":43},"2005":{"center":[-0.5925562672052703,0.10336175928140162],"size":36},"2007":{"center":[-0.7438443163678442,-0.07931698069781605],"size":41},"2009":{"center":[-0.6003352662345356,0.05465679226769221],"size":46},"2011":{"center":[-0.5010780102160987,-0.137147908563924],"size":34},"2013":{"center":[-0.5951718965350029,-0.0336272336433019],"size":32}},"PTdoB":{"2007":{"center":[-0.9615716503613394,-0.18925623511958867],"size":1},"2009":{"center":[-0.6522493279811855,0.06090861913211234],"size":1},"2011":{"center":[-0.5096642307334988,-0.13178816527157072],"size":3},"2013":{"center":[-0.5079216094398311,-0.10755341659794278],"size":3}},"PRB":{"2007":{"center":[-0.6592526814887227,0.00978042923168035],"size":4},"2009":{"center":[-0.7256761635822025,0.09207948874159988],"size":7},"2011":{"center":[-0.6800659716439803,-0.13786430992111184],"size":10},"2013":{"center":[-0.5268097838905782,-0.030671513442753894],"size":11}},"DEM":{"1991":{"center":[-0.5153077178307119,0.10417340779319949],"size":76},"1993":{"center":[-0.3956741015122466,0.2282146878181598],"size":85},"1995":{"center":[-0.6960270409660408,-0.13956685940574545],"size":101},"1997":{"center":[-0.7128234069562038,-0.13165246782635756],"size":113},"1999":{"center":[-0.7759561452659295,0.018123398358219803],"size":105},"2001":{"center":[-0.595950550343923,0.07229149002974199],"size":95},"2003":{"center":[-0.04427936671191911,-0.7251481097798482],"size":60},"2005":{"center":[-0.213559521108103,-0.6269562885065636],"size":60},"2007":{"center":[0.0860892839191191,-0.6610895395257785],"size":58},"2009":{"center":[-0.2131362766716704,-0.695356412507196],"size":53},"2011":{"center":[-0.025406736301515773,-0.7446965990245483],"size":27},"2013":{"center":[-0.4553653142441952,-0.545241938072474],"size":26}},"PRTB":{"2007":{"center":[-0.343367981951587,-0.1025068238715557],"size":2},"2011":{"center":[-0.5778192249201304,0.1117686917746181],"size":1}},"PEN":{"2011":{"center":[0.10110154922339162,-0.7206882824435092],"size":2},"2013":{"center":[-0.38800546615367165,0.04429968818160924],"size":1}},"PRP":{"2011":{"center":[-0.42050446918983014,-0.08159881420868642],"size":1},"2013":{"center":[-0.6569806075512834,0.007614289507346023],"size":2}},"SDD":{"2013":{"center":[-0.503151873717643,-0.2637107173119717],"size":20}},"PROS":{"2013":{"center":[-0.5499944527115378,0.018786100381097758],"size":18}}}
}



CONGRESS_DEFINE.parties = {
	DEM:{name:'Democratas',wiki:'http://pt.wikipedia.org/wiki/Democratas_(Brasil)'}, 
	NoParty: {name:'No Party'}, 
	PCB:{name:'Partido Comunista Brasileiro',wiki:'http://pt.wikipedia.org/wiki/Partido_Comunista_Brasileiro'}, 
	PCdoB:{name:'Partido Comunista do Brasil',wiki:'http://pt.wikipedia.org/wiki/Partido_Comunista_do_Brasil'}, 
	PDC:{name:'Partido Democrata Cristão', wiki:'http://pt.wikipedia.org/wiki/Partido_Democrata_Crist%C3%A3o_(1985-1993)'}, 
	PDS:{name:'Partido Democrático Social',wiki:'http://pt.wikipedia.org/wiki/Partido_Democr%C3%A1tico_Social'}, 
	PDT:{name:'Parido Democrático Trabalhista',wiki:'http://pt.wikipedia.org/wiki/Partido_Democr%C3%A1tico_Trabalhista'}, 
	PEN:{name:'Partido Ecológico Nacional',wiki:'http://pt.wikipedia.org/wiki/Partido_Ecol%C3%B3gico_Nacional'}, 
	PHS:{name:'Partido Humanista da Solidariedade',wiki:'http://pt.wikipedia.org/wiki/Partido_Humanista_da_Solidariedade'}, 
	PMDB:{name:'Partido do Movimento Democrático Brasileiro',wiki:'http://pt.wikipedia.org/wiki/Partido_do_Movimento_Democr%C3%A1tico_Brasileiro'}, 
	PMN:{name:'Partido da Mobilização Nacional',wiki:'http://pt.wikipedia.org/wiki/Partido_da_Mobiliza%C3%A7%C3%A3o_Nacional'}, 
	PP: {name:'Partido Progressista',wiki:'http://pt.wikipedia.org/wiki/Partido_Progressista_(Brasil)'},
	PPR:{name:'Partido Progressista Renovador', wiki:'http://pt.wikipedia.org/wiki/Partido_Progressista_Renovador'}, 
	PPS:{name:'Partido Popular Socialista', wiki:'http://pt.wikipedia.org/wiki/Partido_Popular_Socialista'}, 
	PR: {name:'Partido da República',wiki:'http://pt.wikipedia.org/wiki/Partido_da_Rep%C3%BAblica'},
	PRB:{name:'Partido Republicano Brasileiro',wiki:'http://pt.wikipedia.org/wiki/Partido_Republicano_Brasileiro'}, 
	PRN:{name:'Partido da Renovação Nacional', wiki:'http://pt.wikipedia.org/wiki/Partido_Trabalhista_Crist%C3%A3o'}, 
	PRONA:{name:'Partido da Reedificação da Ordem Nacional',wiki:'http://pt.wikipedia.org/wiki/Partido_de_Reedifica%C3%A7%C3%A3o_da_Ordem_Nacional'}, 
	PROS:{name:'Partido Republicano da Ordem Social',wiki:'http://pt.wikipedia.org/wiki/Partido_Republicano_da_Ordem_Social'}, 
	PRP:{name:'Partido Republicano Progressista',wiki:'http://pt.wikipedia.org/wiki/Partido_Republicano_Progressista'}, 
	PRS:{name:'Partido da Renovação Social',wiki:'http://pt.wikipedia.org/wiki/Partido_de_Renova%C3%A7%C3%A3o_Social'}, 
	PRTB:{name:'Partido Renovador Trabalhista Brasileiro',wiki:'http://pt.wikipedia.org/wiki/Partido_Renovador_Trabalhista_Brasileiro'}, 
	PSB:{name:'Partido Socialista Brasileiro',wiki:'http://pt.wikipedia.org/wiki/Partido_Socialista_Brasileiro'}, 
	PSC:{name:'Partido Social Cristão', wiki:'http://pt.wikipedia.org/wiki/Partido_Social_Crist%C3%A3o'}, 
	PSD:{name:'Partido Social Democrático',wiki:'http://pt.wikipedia.org/wiki/Partido_Social_Democr%C3%A1tico_(2011)'}, 
	PSDB:{name:'Partido da Social Democracia Brasileira',wiki:'http://pt.wikipedia.org/wiki/Partido_da_Social_Democracia_Brasileira'}, 
	PSL:{name:'Partido Social Liberal', wiki:'http://pt.wikipedia.org/wiki/Partido_Social_Liberal'}, 
	PSOL:{name:'Partido Socialismo e Liberdade',wiki:'http://pt.wikipedia.org/wiki/Partido_Socialismo_e_Liberdade'}, 
	PST:{name:'Partido Social Trabalhista',wiki:'http://pt.wikipedia.org/wiki/Partido_Social_Trabalhista'}, 
	PSTU:{name:'Partido Socialista dos Trabalhadores Unificado',wiki:'http://pt.wikipedia.org/wiki/Partido_Socialista_dos_Trabalhadores_Unificado'}, 
	PT: {name:'Partido dos Trabalhadores',wiki:'http://pt.wikipedia.org/wiki/Partido_dos_Trabalhadores'},
	PTB:{name:'Partido Trabalhista Brasileiro',wiki:'http://pt.wikipedia.org/wiki/Partido_Trabalhista_Brasileiro'}, 
	PTC:{name:'Partido Trabalhista Cristão',wiki:'http://pt.wikipedia.org/wiki/Partido_Trabalhista_Crist%C3%A3o'}, 
	PTN:{name:'Partido Trabalhista Nacional',wiki:'http://pt.wikipedia.org/wiki/Partido_Trabalhista_Nacional'}, 
	PTR:{name:'Partido Trabalhista Reformador', wiki:'http://pt.wikipedia.org/wiki/Partido_Trabalhista_Reformador'}, 
	PTdoB:{name:'Partido Trabalhista do Brasil',wiki:'http://pt.wikipedia.org/wiki/Partido_Trabalhista_do_Brasil'}, 
	PV: {name:'Partido Verde',wiki:'http://pt.wikipedia.org/wiki/Partido_Verde_(Brasil)'},
	SDD: {name:'Solidariedade',wiki:'http://pt.wikipedia.org/wiki/Solidariedade_(partido_pol%C3%ADtico)'}
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

CONGRESS_DEFINE.setIdeologyColors();