var progbar = document.getElementById('progbar');
var progval = document.getElementById('progval');
document.getElementById('submitBtn').addEventListener('click', uploadFile);
function uploadFile (event) {
	var xhr = new XMLHttpRequest();
	var progbar = document.getElementById('progbar');
	xhr.upload.addEventListener('progress', function (e) {
		if (e.lengthComputable) {
			var prg = parseInt(e.loaded / e.total * 100);
			progval.innerHTML = prg;
			progbar.style.width = prg+'%';
		}
	}, false);
	xhr.onreadystatechange = function (e) {
		if (xhr.readyState === 4) {
			if (xhr.status === 200) {
				console.log('success');
			} else {
				console.log('failure');
			}
		}
	};
	xhr.open('POST', document.getElementById('upform').action, true);
	xhr.setRequestHeader('X-FILENAME', document.getElementById('filein').files[0].name);
	xhr.send(document.getElementById('filein').files[0]);
};