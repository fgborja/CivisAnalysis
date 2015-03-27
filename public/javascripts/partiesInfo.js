var partiesInfo = {
	init: function() {
		var parties = d3.select('#partiesInfo')
				.selectAll('.partyInfo')
				.data(d3.entries(CONGRESS_DEFINE.parties))
				.enter()
					.append('div')

		parties.attr({'class':'col-md-1 partyInfo no-padding',title:function(d){ return d.value.name} })

		parties.append('input')
			.attr({
				type:"color",
				value:function(d){return $(this).val(tinycolor(CONGRESS_DEFINE.getConstantPartyColor(d.key)).toHexString())},
				id:function(d){return d.key;},
				onchange:function(d){ 
					return 'javascript:CONGRESS_DEFINE.setConstantPartyColor("'+d.key+'",$("input#'+d.key+'").val());colorsReDraw()';

				}
			})
		parties.append('span')
			.text(function(d){ return d.key; })
			.attr('class','')
		parties.append('a')
			.attr({
				href:function(d){return d.value.wiki},
				target:"blank",
				'class':'glyphicon glyphicon-link',
				style:'font-size:x-small'
			})
	},
	refreshInputColors : function() {
		d3.selectAll('#partiesInfo .partyInfo input')
			.attr('value',function(d){return $(this).val(tinycolor(CONGRESS_DEFINE.getConstantPartyColor(d.key)).toHexString())})
	},
	setIdeologyParties: function () {
		CONGRESS_DEFINE.setIdeologyColors();

		d3.select('#paletteParties text').text('Ideology Color Palette: ')

		var divs = d3.select('#paletteParties')
				.selectAll('div')
				.data(d3.entries(CONGRESS_DEFINE.partiesIdeologyColor), function(d){ return d.key;})
				
		divs.exit().remove();

		var ideology = divs.enter()
					.append('div')

		ideology.attr({'class':'col-md-2 no-padding'})

		ideology.append('input')
			.attr({
				type:"color",
				value:function(d){return $(this).val(tinycolor(d.value).toHexString())},
			})
		ideology.append('span')
			.text(function(d){ return d.key; })
			.attr('class','')

		colorsReDraw();
	},
	setArbitraryParties: function () {
		CONGRESS_DEFINE.setArbitraryColors();

		d3.selectAll('#paletteParties div').remove();
		d3.select('#paletteParties text').text('Parties Color Palette');
		colorsReDraw();
	},
	setMilitaryParties: function () {
		CONGRESS_DEFINE.setMilitaryColors();

		d3.select('#paletteParties text').text('Military Regime Heritage Color Palette: ');

		var divs = d3.select('#paletteParties')
				.selectAll('div')
				.data(d3.entries(CONGRESS_DEFINE.partiesMilitaryColor), function(d){ return d.key;});

		divs.exit().remove();
		var military = divs.enter().append('div');

		military.attr({'class':'col-md-2 no-padding','style':'display:flex',title:function(d){ return d.value.title} })

		military.append('input')
			.attr({
				type:"color",
				value:function(d){return $(this).val(tinycolor(d.value.color).toHexString())},
			})
		military.append('span')
			.text(function(d){ return d.value.name; })
			.attr('class','')
			.append('a')
			.attr({
				href:function(d){return d.value.wiki},
				style:function(d){ return (d.value.wiki=='')?'display:none':'font-size:x-small';},
				target:"blank",
				'class':'glyphicon glyphicon-link',
			})

		colorsReDraw();
	}
};