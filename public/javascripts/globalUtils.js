
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

// save/download javascript object to json object into filemanme
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

function saveArray(array, getName){
    var q = queue(1)

    array.forEach(function(d){ 
        q.defer(
            function(value,key,defer){ console.save(value,key); defer(null, true); },
            d,
            getName(d)
        )
    })
}

function sleep(millis, callback){
    setTimeout(
        function (){ callback() }
        , millis
    );
}

// function saveArrayWithDelay( array, getName, index){
//     console.log(index)

//     saveArray( array.slice(index,index+100), getName, index)

//     if(index<array.length){
//         sleep( 20000, function(){ 
//             saveArrayWithDelay(array, getName, index+100)
//         });  
//     }
    
// }

function saveEntriesOfArray( array, getName, index){
    console.log(index)
    console.save(array[index],getName(array[index]))
    if(index<array.length){
        sleep( 1000, function(){ 
            saveEntriesOfArray(array, getName, index+1)
        });  
    }
    
}

// function saveMotionsWithDelay(){
//     saveArrayWithDelay(arrayMotions,function(motion){ return motion.type + motion.number + motion.year; },0)
// }
function saveMotionsWithDelay(){
    saveEntriesOfArray(arrayMotions,function(motion){ return motion.type + motion.number + motion.year; },0)
}
function saveDeputiesToFILE(){
    JSON.stringify(arrayDeputies)
}

// function saveRollCallsWithDelay(){
//     saveArrayWithDelay(arrayRollCalls,function(rollCall){ return rollCall.type + rollCall.number + rollCall.year + rollCall.datetime; },0)
// }