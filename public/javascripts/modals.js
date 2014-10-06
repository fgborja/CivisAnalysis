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
	//setRollCallModal_Click();
}

function setRollCallModal_ListSelected(){
	setRollCallModal_Init()
	setRollCallModal_setTable( rollCallsScatterplot.getSelected())
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
	// TODO gmail un/select all button 
	var selectAll = $('.modal-body table .btn#selectAll');
	selectAll.css('text-align','left');
	selectAll.click( function () {
		console.log(this)
		rollCallsScatterplot.reset();
		$('.modal-body td span').removeClass('glyphicon-unchecked')
		$('.modal-body td span').addClass('glyphicon-check')
	});

	var selectNone = $('.modal-body table .btn#selectNone')
	selectNone.css('text-align','left');
	selectNone.click( function () {
		rollCallsScatterplot.unselectAll();
		$('.modal-body td span').removeClass('glyphicon-check')
		$('.modal-body td span').addClass('glyphicon-unchecked')
	});
}

function setRollCallModal_setTable(data){
	var table = $('#table').DataTable({
		data: data,
		columns: [
			{
                'class':          'details-control',
                orderable:      false,
                data:           null,
                defaultContent: ''
            },
			{ data: function(d){ return d.tipo +' '+d.numero +' '+d.ano}, },
			{ data: function(d){ return d.datetime.toString() }, },
			{
				//'class'	  : 	'checkbox',	
                data:           null,
                orderable:      false,
                defaultContent: ''
            },	
			{ data: function(d){ return motions[d.tipo+d.numero+d.ano].tags }, visible: false, orderable: false }
        ],
		createdRow: function ( row, data, index ) {
			var btn;
            if ( rollCallsScatterplot.isSelected( data.i ) ) {
            	btn = $('td', row).eq(3).append(' <span class="btn glyphicon glyphicon-check"></span>');
            } else{ btn = $('td', row).eq(3).append(' <span class="btn glyphicon glyphicon-unchecked"></span>'); }

            btn = btn.children('span');
            btn.click(function(d) {
					btn.toggleClass('glyphicon-check')
					btn.toggleClass('glyphicon-unchecked')

					if (btn.hasClass('glyphicon-check')) {
						rollCallsScatterplot.selectRollCall(data.i);
					} else {
						rollCallsScatterplot.unselectRollCall(data.i);
					}
			});

            
        }
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
    // `d` is the original data object for the row
    return '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">'+
        '<tr>'+
            '<td>Roll Call Summary:</td>'+
            '<td>'+d.rollCall.summary+'</td>'+
        '</tr>'+
        '<tr>'+
            '<td>Amendment:</td>'+
            '<td>'+motions[d.tipo+d.numero+d.ano].amendment+'</td>'+
        '</tr>'+
         '<tr>'+
            '<td>Tags:</td>'+
            '<td>'+motions[d.tipo+d.numero+d.ano].tags+'</td>'+
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