//=============================================================================
// Deputies - Modal
function setDeputyModal_SearchAll(){
	setDeputyModal_Init();
	setDeputyModal_setTable(deputyNodes);
	setDeputyModal_Click();
}

function setDeputyModal_ListSelected(){
	setDeputyModal_Init();
	setDeputyModal_setTable(deputiesScatterplot.getSelected());
	setDeputyModal_Click();
}

function setDeputyModal_Init(){
	d3.select('.modal-title').text('Deputies - search & select')
	$('.modal-body').children().remove();
	$('.modal-body').append('<table id="table" calss="display"><thead><tr><th>Name</th><th>Party</th><th>State</th></tr><thead/></table>')
}

function setDeputyModal_setTable(data){
	$('#table').DataTable( {
		data 	: data,
		columns : [
			{ data: 'name' },
			{ data: 'party'},
			{ data: 'district'}
		],
		createdRow: function ( row, data, index ) {
            if ( deputiesScatterplot.isSelected( data.deputyID ) ) {
                 $(row).addClass('selected');
            }
        }
	});
}

function setDeputyModal_Click(){
	$('#table tbody').on("click", "tr", function(){
		$(this).toggleClass('selected');
		
		var name = $('td', this).eq(0).text();
		var party = $('td', this).eq(1).text();
		var state = $('td', this).eq(2).text();
		alert( 'You clicked on '+name+'\'s row' );
	});
}
//=============================================================================


//=============================================================================
// RollCall - Modal

function setRollCallModal_SearchAll(){
	setRollCallModal_Init()
	setRollCallModal_setTable(rollCallNodes)
	setRollCallModal_Click();
}

function setRollCallModal_ListSelected(){
	setRollCallModal_Init()
	setRollCallModal_setTable( rollCallsScatterplot.getSelected())
	setRollCallModal_Click();
}

function setRollCallModal_Init(){
	d3.select('.modal-title').text('Roll Calls - search & select')
	$('.modal-body').children().remove();
	$('.modal-body').append('<table id="table" calss="display"><thead><tr><th></th><th>Type</th><th>Number</th><th>Year</th></tr><thead/></table>')
}
function setRollCallModal_setTable(data){
	var table = $('#table').DataTable({
		data: data,
		columns: [
			{
                "class":          'details-control',
                "orderable":      false,
                "data":           null,
                "defaultContent": ''
            },
			{ data: 'tipo', },
			{ data: 'numero' },
			{ data: 'ano' }
		],
		// // createdRow: function ( row, data, index ) {
  // //           if ( rollCallsScatterplot.isSelected( data.i ) ) {
  // //                $(row).addClass('selected');
  // //           }
  // //       }
	});

	// Add event listener for opening and closing details
    $('#table tbody').on('click', 'td.details-control', function () {
        var tr = $(this).closest('tr');
        var row = table.row( tr );
 
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
	console.log(d)
    // `d` is the original data object for the row
    return '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">'+
        '<tr>'+
            '<td>Summary:</td>'+
            '<td>'+d.rollCall.summary+'</td>'+
        '</tr>'+
        '<tr>'+
            '<td>Amendment:</td>'+
            '<td>'+motions[d.tipo+d.numero+d.ano].amendment+'</td>'+
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