
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