//=============================================================================
// Deputies - Modal
function setDeputyModal_SearchAll(){
	setDeputyModal_Init();
	setDeputyModal_setTable(deputyNodes);
}

function setDeputyModal_ListSelected(){
	setDeputyModal_Init();
	var selectedDeputies = [];
	deputyNodes.forEach( function (deputy) { if(deputy.selected) selectedDeputies.push(deputy) });
	setDeputyModal_setTable(selectedDeputies);
}

function setDeputyModal_Init(){
	d3.select('.modal-title').text('Deputies - search & select')
	$('.modal-body').children().remove();
	$('.modal-body').append('<table id="table" calss="display"><thead><tr><th>Name</th><th>Party</th><th>State</th><th id="select"></th></tr><thead/></table>')

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
	);

	$('.modal').on('hidden.bs.modal', function () {
		updateDeputies();
	})
}


function setDeputyModal_setTable(data){
	var oTable  = $('#table').DataTable( {
		data 	: data,
		columns : [
			{ data: 'name' },
			{ data: 'party'},
			{ data: 'district'},
			{
				//'class'	  : 	'checkbox',	
                data:           null,
                orderable:      false,
                defaultContent: ''
            }
		],
		createdRow: function ( row, deputy, index ) {
			// create the checkbox button
            var btn;
            if ( deputy.selected ) {
            	btn = $('td', row).eq(3).append(' <span class="btn glyphicon glyphicon-check"></span>');
            } else{ btn = $('td', row).eq(3).append(' <span class="btn glyphicon glyphicon-unchecked"></span>'); }

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