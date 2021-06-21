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
		if (Box.username != '') {
			return Promise.resolve();
		}
		return spotifyApi.getMe()
		.then(function(data) {
			console.log(data);
			Box.username = data['id'];
			return null;
		}).catch(function(e) {
			console.error(e);
		});
	},
	loadPlaylists: function() {
		if (Box.playlists.length > 0) {
			return Promise.resolve();
		}
		return spotifyApi.getUserPlaylists()
		.then(function(data){
			console.log(data);
			Box.playlists = data['items'];
			//Box.playlists.push.apply(Box.playlists, data['items']);
			//Box.nextOffset['offset'] = Box.nextOffset['offset'] + data['limit'];
			Box.nextOffset['offset'] = data['limit'];
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
		.then(function(data){
			console.log(data);
			Box.current = data;
			Box.currentSongs = data.tracks.items;
			m.redraw();
			return Box.loadAllPlaylistTracks();
		}).catch(function(e) {
			console.error(e);
		});
	},
	loadMorePlaylistTracks: function() {
		var id = Box.current.id;
		var offsetNumber = Box.currentSongs.length;
		return spotifyApi.getPlaylistTracks(id, {'offset': offsetNumber})
		.then(function(data){
			console.log(data);
			Box.currentSongs.push.apply(Box.currentSongs, data['items']);
			return null;
		});
	},
	loadAllPlaylistTracks: async function () {
		//a while loop with promises?
		console.log(Box.currentSongs.length);
		while (Box.currentSongs.length < Box.current.tracks.total) {
			await Box.loadMorePlaylistTracks();
			console.log(Box.currentSongs.length);
		}
		m.redraw();
		return null;
	},
	loadAlbumPage: function(id) {
		if (Box.current.id == id) {
			//playlist already loaded
			return Promise.resolve();
		} else {
			return Box.loadPlaylist(id);
			//.then(Box.loadAlbums)
		}
	},

	addAlbumTracksFromPositionToQueue: async function(song) {
		var songId = song.track.id;
		var albumId = song.track.album.id;
		var tracks = [];
		var total = 0;
		var offset = {offset: 0};
		var data = await spotifyApi.getAlbum(albumId);
		//.then(function(data){
			console.log(data);
			tracks = data.tracks.items;
			total = data.tracks.total;
			offset.offset = data.tracks.limit;
			while (tracks.length < total) {
				var newdata = await spotifyApi.getAlbumTracks(albumId, offset);
				//.then(function(data){
					console.log(newdata);
					tracks.push.apply(tracks, newdata.items);
					offset.offset = offset.offset + newdata.limit;
					//return null;
				//});
			}
			var shown = false;
			var toQueue = [];
			for (var title of tracks) {
				if (title.track.id == songId || shown) {
					toQueue.push(spotifyApi.queue(title.track.id));
				}
			}
			return Promise.all(toQueue);
		//});
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