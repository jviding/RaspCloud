var progbar = document.getElementById('progbar');
    var xhr = new XMLHttpRequest();
    xhr.addEventListener('progress', function (e) {
    	var p = parseInt(100 - (e.loaded / e.total * 100));
    	console.log(p);
    	console.log('hey!');
}, false);