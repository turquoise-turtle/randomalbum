
var localid = localStorage.getItem('uuid');
if (window.location.hash == '') {
	//error logging in
	document.querySelector('#error').style.display = 'block';
	var params = new URLSearchParams(window.location.search);
	if (params.has('error')) {
		var a = document.createElement('p');
		a.innerText = 'Authorisation failed because of ' + params.get('error');
		document.querySelector('#error').appendChild(a);
	}
} else {
	var hash = window.location.hash.substring(1);
	var params = {}
	hash.split('&').map(hk => { 
	let temp = hk.split('='); 
		params[temp[0]] = temp[1] 
	});
	console.log(params);
	console.log(params['state'] == localid)

	if (params['state'] == localid) {
		var end = new Date().getTime() + params['expires_in'] * 1000;
		localStorage.setItem('access_token', params['access_token']);
		localStorage.setItem('expires_by', end);
		localStorage.setItem('loggedin', 'true');

		window.location.replace('main.html');
	} else {
		//some login error or hack?
		document.querySelector('#error').style.display = 'block';
	}

}
