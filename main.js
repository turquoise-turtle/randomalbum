var spotifyApi = new SpotifyWebApi();
var token = localStorage.getItem('access_token');
spotifyApi.setAccessToken(token);

var username = '';
var nextOffset = {'offset': 0};

spotifyApi.getMe()
.then(promRes, promRej)
.then(function(data) {
	console.log(data);
	username = data['id'];
})




spotifyApi.getUserPlaylists()
.then(promRes, promRej)
.then(function(data){
	console.log(data);
	loadLists(data['items']);
	nextOffset['offset'] = nextOffset['offset'] + data['limit'];
	console.log(nextOffset);
});

function loadMorePlaylists() {
	return spotifyApi.getUserPlaylists(username, nextOffset)
	.then(promRes, promRej)
	.then(function(data){
		console.log(data);
		loadLists(data['items']);
		nextOffset['offset'] = nextOffset['offset'] + data['limit'];
		console.log(nextOffset);
	});
}


function loadLists(lists) {
	for (var list of lists) {
		var a = document.createElement('li');
		a.innerText = list['name'];
		document.querySelector('ul').appendChild(a);
	}
}

function promRes(data) {
	return new Promise((resolve,reject) => {
		resolve(data);
	});
}
function promRej(error) {
	return new Promise((resolve,reject) => {
		reject(error);
	}).catch(function(e) {
		console.error(e);
	});
}