var xhr = new XMLHttpRequest();
xhr.addEventListener('progress', updateProgress);


function updateProgress (e) {
	if (e.lengthComputable) {
		var complete = e.loaded / e.total;
		console.log(complete);
	}
};



var progbar = document.getElementById('progbar');