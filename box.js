var expires_by = localStorage.getItem('expires_by');
var now = new Date().getTime();
if (expires_by - now < 600) {
	location.href = 'index.html';
}

var spotifyApi = new SpotifyWebApi();
var token = localStorage.getItem('access_token');
spotifyApi.setAccessToken(token);

var Box = {
	username: '',
	nextOffset: {'offset': 0},
	total: 0,
	playlists: [],
	favourites: [],
	loadUser: function() {
		return spotifyApi.getMe()
		.then(promRes, promRej)
		.then(function(data) {
			console.log(data);
			Box.username = data['id'];
			return null;
		}).catch(function(e) {
			console.error(e);
		});
	},
	loadPlaylists: function() {
		return spotifyApi.getUserPlaylists()
		.then(promRes, promRej)
		.then(function(data){
			console.log(data);
			Box.playlists = data['items'];
			//Box.playlists.push.apply(Box.playlists, data['items']);
			Box.nextOffset['offset'] = Box.nextOffset['offset'] + data['limit'];
			Box.total = data['total'];
			console.log(Box.nextOffset);
			m.redraw();
		}).catch(function(e) {
			console.error(e);
		});
	},
	loadMore: function() {
		//return spotifyApi.getUserPlaylists(username, nextOffset)
		return spotifyApi.getUserPlaylists(Box.nextOffset)
		.then(promRes, promRej)
		.then(function(data){
			console.log(data);
			Box.playlists.push.apply(Box.playlists, data['items']);
			//Box.playlists.append(data['items']);
			//Box.loadItems(data['items']);
			Box.nextOffset['offset'] = Box.nextOffset['offset'] + data['limit'];
			console.log(Box.nextOffset);
			m.redraw();
		}).catch(function(e) {
			console.error(e);
		});
	},
	current: {},
	currentSongs: [],
	loadPlaylist: function(id) {
		return spotifyApi.getPlaylist(id)
		.then(promRes, promRej)
		.then(function(data){
			console.log(data);
			Box.current = data;
			Box.currentSongs = data.tracks.items;
			return Box.loadAllPlaylistTracks();
		}).catch(function(e) {
			console.error(e);
		});
	},
	loadMorePlaylistTracks: function() {
		var id = Box.current.id;
		var offsetNumber = Box.currentSongs.length;
		return spotifyApi.getPlaylistTracks(id, {'offset': offsetNumber})
		.then(promRes, promRej)
		.then(function(data){
			console.log(data);
			Box.currentSongs.push.apply(Box.currentSongs, data['items']);
			return null;
		});
	},
	loadAllPlaylistTracks: async function () {
		//a while loop with promises?
		var result = null;
		while (Box.currentSongs.length < Box.current.tracks.total) {
			await Box.loadMorePlaylistTracks();
		}
		m.redraw();
	}
};

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