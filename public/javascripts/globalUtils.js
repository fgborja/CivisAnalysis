
// function to check size of properties of an object
Object.size = function(obj) {
	var size = 0, key;
	for (key in obj) {
		if (obj.hasOwnProperty(key)) size++;
	}
	return size;
};

// check is the Object is an Arrayroposicoes2012
function isArray(obj) {
	return Object.prototype.toString.call(obj) === '[object Array]';
}

(function(console){

console.save = function(data, filename){

    if(!data) {
        console.error('Console.save: No data')
        return;
    }

    if(!filename) filename = 'console.json'

    if(typeof data === "object"){
        data = JSON.stringify(data, undefined, 4)
    }

    var blob = new Blob([data], {type: 'text/json'}),
        e    = document.createEvent('MouseEvents'),
        a    = document.createElement('a')

    a.download = filename
    a.href = window.URL.createObjectURL(blob)
    a.dataset.downloadurl =  ['text/json', a.download, a.href].join(':')
    e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
    a.dispatchEvent(e)
 }
})(console)


//console.save( ,"dateTimeRollCall")

function saveEachMotion(){
    var q = queue(1)

    $.each(motions,function(d){ 
        q.defer(
            function(value,key,defer){ console.save(value,key); defer(null, true); },
            this,
            d
        )
    })
}