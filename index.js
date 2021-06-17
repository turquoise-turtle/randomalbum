var loggedin = localStorage.getItem('loggedin');
if (loggedin != 'true') {
	var uuid = uuidv4();
	localStorage.setItem('uuid', uuid);

	var url = 'https://accounts.spotify.com/authorize?client_id=e82efc65eeec4c17933bc87fa8d1e375&response_type=token&redirect_uri=';
	url = url + encodeURIComponent('https://turquoise-turtle.github.io/randomalbum/callback');
	url = url + '&scope=' + encodeURIComponent('playlist-read-private user-modify-playback-state');
	url = url + '&state=' + uuid;

	document.querySelector('button').addEventListener('click', function(e){
		window.location.href = url;
	});
	document.querySelector('button').style.display = 'inline-block';

}

function uuidv4() {
	return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
		(c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
	);
}