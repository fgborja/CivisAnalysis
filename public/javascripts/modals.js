//=============================================================================
// Deputies - Modal
function setDeputyModal_SELECT(){
	setDeputyModal_SelectInit();
}

function setDeputyModal_LIST_SELECTED(){
	setDeputyModal_LIST_Init();
	var selectedDeputies = [];
	deputyNodes.forEach( function (deputy) { if(deputy.selected) selectedDeputies.push(deputy) });
	setDeputyModal_setTable(selectedDeputies);
}

function setDeputyModal_SelectInit(){
	d3.select('.modal-title').text('Deputies - search & select')
	$('.modal-body').children().remove();

	$('.modal-body').append('<select id="select-to" class="selectized" placeholder="Pick Deputies..." multiple="multiple" tabindex="-1" style="display: none;"></select>')

	var $select = $('#select-to').selectize({
	    persist: false,
	    maxItems: null,
	    valueField: 'deputyID',
	    labelField: 'name',
	    searchField: ['name', 'party', 'district'],
	    options: deputyNodes,
	    render: {
	        item: function(item, escape) {
	            return '<div>' +
	                (item.name ? '<span class="name">' + escape(item.name) + '</span>' : '') +
	                (item.party ? '<span class="party"> - ' + escape(item.party) + '</span>' : '') +
	                (item.district ? '<span class="party"> - ' + escape(item.district) + '</span>' : '') +
	            '</div>';
	        },
	        option: function(item, escape) {
	            return '<div>' +
	                '<span class="">' + escape(item.name) + '</span>' +
	                '<span class="caption"> - ' +  escape(item.party) +' - '+ escape(item.district) +'</span>' +
	            '</div>';
	        }
	    },
	    createFilter: function(input) {
	        var match, regex;
	        console.log()
	        // name
	        regex = new RegExp('^([^<]*)$', 'i');
	        match = input.match(regex);
	        if (match) return !this.options.hasOwnProperty(match[2]);

	        return false;
	    }
	});
	// add button to confirm selection
	$('.modal-body').append('<button id="selectBtn" class="btn btn-default">Select Deputies</button>')
	// when select buttton is clicked
	$('#selectBtn').on('click', function(){ 
		var selectedDeputiesIDs = $select[0].selectize.getValue();

		if( selectedDeputiesIDs.length != 0 ){
			modals.unselectAllDeputies();
			selectedDeputiesIDs.forEach(function(deputyID){
				phonebook.getDeputyObj(deputyID).selected = true;
			})
		}
		// update selected
		updateDeputies();
		// close modal
		$('.modal').modal('toggle');
	})
}

function setDeputyModal_LIST_Init(){
	d3.select('.modal-title').text('Deputies - search & select')
	$('.modal-body').children().remove();
	$('.modal-body').append('<table id="table" calss="display"><thead><tr><th id="select"></th><th>Name</th><th>Party</th><th>State</th></tr><thead/></table>')

	// $('.modal-body th#select').append(
	// 	'<div class="dropdown">' 
	// 		+'<span class="btn dropdown-toggle" type="button" id="selectMenu" data-toggle="dropdown">'
	// 		+	'Select ' 
	// 		+	'<span class="caret"></span>'
	// 		+'</span>'
	// 	  	+'<ul class="dropdown-menu" role="menu" aria-labelledby="selectMenu">'
	// 	    	+'<li role="presentation"><a id="selectAll" class="btn glyphicon glyphicon-check" role="menuitem" tabindex="-1"> All </a></li>'
	// 	    	+'<li role="presentation"><a id="selectNone" class="btn glyphicon glyphicon-unchecked"  role="menuitem" tabindex="-1"> None</a></li>'
	// 	 	+'</ul>'
	//  	+'</div>'
	// );

	$('.modal').on('hidden.bs.modal', function () {
		updateDeputies();
	})
}


function setDeputyModal_setTable(data){
	var oTable  = $('#table').DataTable( {
		data 	: data,
		columns : [
			{
				//'class'	  : 	'checkbox',	
                data:           null,
                orderable:      false,
                defaultContent: ''
            },
			{ data: 'name' },
			{ data: 'party'},
			{ data: 'district'}
		],
		createdRow: function ( row, deputy, index ) {
			// create the checkbox button
            var btn;
            if ( deputy.selected ) {
            	btn = $('td', row).eq(0).append(' <span class="btn glyphicon glyphicon-check"></span>');
            } else{ btn = $('td', row).eq(0).append(' <span class="btn glyphicon glyphicon-unchecked"></span>'); }

            btn = btn.children('span');
            btn.click(function(d) {
					btn.toggleClass('glyphicon-check')
					btn.toggleClass('glyphicon-unchecked')

					if (btn.hasClass('glyphicon-check')) {
						deputy.selected = true;
					} else {
						deputy.selected = false;
					}
			});
        }
	});

	var rows = oTable.rows();

	// TODO gmail un/select all button 
	// SELECT ALL BUTTON
	var selectAll = $('.modal-body table .btn#selectAll');
	selectAll.css('text-align','left');
	selectAll.click( function () {
		// select all deputies
		modals.selectAllDeputies();
		rows.$('span').removeClass('glyphicon-unchecked')
		rows.$('span').addClass('glyphicon-check')
	});
	// SELECT NONE BUTTON
	var selectNone = $('.modal-body table .btn#selectNone')
	selectNone.css('text-align','left');
	selectNone.click( function () {
		// unselect all deputies
		modals.unselectAllDeputies();
		rows.$('span').removeClass('glyphicon-check')
		rows.$('span').addClass('glyphicon-unchecked')
	});

}
//=============================================================================
//=============================================================================
var modals = {

	unselectAllDeputies	: function(){
		deputyNodes.forEach( function (deputy) { deputy.selected = false; });
		updateDeputies();
	}
	,
	selectAllDeputies	: function(){
		deputyNodes.forEach( function (deputy) { deputy.selected = true; });
		updateDeputies();
	}
	,
	unselectAllRollCalls	: function(){
		rollCallNodes.forEach( function (rollCall) { rollCall.selected = false; });
		updateRollCalls();
	}
	,
	selectAllRollCalls		: function(){
		rollCallNodes.forEach( function (rollCall) { rollCall.selected = true; });
		updateRollCalls();
	}
}

//=============================================================================
// RollCall - Modal

function setRollCallModal_SearchAll(){
	setRollCallModal_Init()
	setRollCallModal_setTable(rollCallNodes)
	//setRollCallModal_Click();
}

function setRollCallModal_ListSelected(){
	setRollCallModal_Init()
	var selectedRollCalls = [];
	rollCallNodes.forEach( function (rollCall) { if(rollCall.selected) selectedRollCalls.push(rollCall) })
	setRollCallModal_setTable( selectedRollCalls )
	//setRollCallModal_Click();
}

function setRollCallModal_Init(){
	d3.select('.modal-title').text('Roll Calls - search & select')
	$('.modal-body').children().remove();
	$('.modal-body').append('<table id="table" calss="display"><thead><tr><th></th><th>Motion ID</th><th>Roll Call Date</th><th id="select"></th><th>Tags</th></tr><thead/></table>')

	$('.modal-body th#select').append(
		'<div class="dropdown">' 
			+'<span class="btn dropdown-toggle" type="button" id="selectMenu" data-toggle="dropdown">'
			+	'Select ' 
			+	'<span class="caret"></span>'
			+'</span>'
		  	+'<ul class="dropdown-menu" role="menu" aria-labelledby="selectMenu">'
		    	+'<li role="presentation"><a id="selectAll" class="btn glyphicon glyphicon-check" role="menuitem" tabindex="-1"> All </a></li>'
		    	+'<li role="presentation"><a id="selectNone" class="btn glyphicon glyphicon-unchecked"  role="menuitem" tabindex="-1"> None</a></li>'
		 	+'</ul>'
	 	+'</div>'
	)

	$('.modal').on('hidden.bs.modal', function () {
		updateRollCalls();
	})
}

function setRollCallModal_setTable(data){
	var oTable = $('#table').DataTable({
		data: data,
		columns: [
			{
                'class':          'details-control',
                orderable:      false,
                data:           null,
                defaultContent: ''
            },
			{ data: function(d){ return d.type +' '+d.number +' '+d.year}, },
			{ data: function(d){ return d.datetime.toString() }, },
			{
				//'class'	  : 	'checkbox',	
                data:           null,
                orderable:      false,
                defaultContent: ''
            },	
			{ data: function(d){ return motions[d.type+d.number+d.year].tags }, visible: false, orderable: false }
        ],
		createdRow: function ( row, rollCall, index ) {
			var btn;
            if ( rollCall.selected ) {
            	btn = $('td', row).eq(3).append(' <span class="btn glyphicon glyphicon-check"></span>');
            } else{ btn = $('td', row).eq(3).append(' <span class="btn glyphicon glyphicon-unchecked"></span>'); }

            btn = btn.children('span');
            btn.click(function(d) {
					btn.toggleClass('glyphicon-check')
					btn.toggleClass('glyphicon-unchecked')

					if (btn.hasClass('glyphicon-check')) {
						rollCall.selected = true;
					} else {
						rollCall.selected = false;
					}
			});
        }
	});

	var rows = oTable.rows();

	// TODO gmail un/select all button 
	// SELECT ALL BUTTON
	var selectAll = $('.modal-body table .btn#selectAll');
	selectAll.css('text-align','left');
	selectAll.click( function () {
		modals.selectAllRollCalls();
		rows.$('span').removeClass('glyphicon-unchecked')
		rows.$('span').addClass('glyphicon-check')
	});
	// SELECT NONE BUTTON
	var selectNone = $('.modal-body table .btn#selectNone')
	selectNone.css('text-align','left');
	selectNone.click( function () {
		modals.unselectAllRollCalls();
		rows.$('span').removeClass('glyphicon-check')
		rows.$('span').addClass('glyphicon-unchecked')
	});

	// Add event listener for opening and closing details
    $('#table tbody').on('click', 'td.details-control', function () {
        var tr = $(this).closest('tr');
        var row = oTable.row( tr );
 
        if ( row.child.isShown() ) {
            // This row is already open - close it
            row.child.hide();
            tr.removeClass('shown');
        }
        else {
            // Open this row
            row.child( formatRollCallDetails(row.data()) ).show();
            tr.addClass('shown');
        }
    });
}

function formatRollCallDetails ( d ) {
    // `d` is the original data object for the row
    return '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">'+
        '<tr>'+
            '<td>Roll Call Summary:</td>'+
            '<td>'+d.summary+'</td>'+
        '</tr>'+
        '<tr>'+
            '<td>Amendment:</td>'+
            '<td>'+motions[d.type+d.number+d.year].amendment+'</td>'+
        '</tr>'+
         '<tr>'+
            '<td>Tags:</td>'+
            '<td>'+motions[d.type+d.number+d.year].tags+'</td>'+
        '</tr>'+
    '</table>';
}

// function setRollCallModal_Click(){
// 	$('#table tbody').on("click", "tr", function(){
// 		var name = $('td', this).eq(0).text();
// 		var party = $('td', this).eq(1).text();
// 		var state = $('td', this).eq(2).text();
// 		alert( 'You clicked on '+name+'\'s row' );
// 	});
// }
//=============================================================================
function setTSNEModal(){
	d3.select('.modal-title').text('Generate t-SNE Political Spectrums')
	$('.modal-body').children().remove();
	
	$('.modal-body').append('<div class="form-horizontal" ></div>')
	var form = $('.modal-body div')
	form.append('<div class="form-group"> <label class="control-label col-sm-2" for="learningRate">Learning Rate:</label><div class="col-sm-10"><input type="number" class="form-control" id="learningRate" value="10"></div></div>')
	form.append('<div class="form-group"><label class="control-label col-sm-2" for="perplexity">Perplexity:</label><div class="col-sm-10"> <input type="number" class="form-control" id="perplexity" value="30"> </div></div>')
	form.append('<div class="form-group"><label class="control-label col-sm-2" for="iterationSec">Iter. Seconds:</label><div class="col-sm-10"> <input type="number" class="form-control" id="iterationSec" value="10"> </div></div>')
	form.append('<div class=" col-sm-10"><button class="btn btn-default">Calc t-SNE</button></div>')
	    
	
	$('.modal-body div .btn').on('click', function(){
		dimRedTechnique= 'tsne'; 
		tsneOpt = {perplexity:$('#perplexity').val(),learningRate:$('#learningRate').val(),iterationSec:$('#iterationSec').val()}
		$('.modal').modal('toggle');
		timeline.dispatchDatesToCalc();
	})
}