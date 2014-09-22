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
	$('.modal-body').append('<table id="table" calss="display"><thead><tr><th>Type</th><th>Number</th><th>Year</th></tr><thead/></table>')
}
function setRollCallModal_setTable(data){
	$('#table').DataTable({
		data: data,
		columns: [
			{ data: 'tipo', },
			{ data: 'numero' },
			{ data: 'ano' }
		],
		createdRow: function ( row, data, index ) {
            if ( rollCallsScatterplot.isSelected( data.i ) ) {
                 $(row).addClass('selected');
            }
        }
	});
}
function setRollCallModal_Click(){
	$('#table tbody').on("click", "tr", function(){
		var name = $('td', this).eq(0).text();
		var party = $('td', this).eq(1).text();
		var state = $('td', this).eq(2).text();
		alert( 'You clicked on '+name+'\'s row' );
	});
}
//=============================================================================