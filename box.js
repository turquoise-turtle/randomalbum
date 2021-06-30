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
		tracks.push.apply(tracks, data.tracks.items);
		console.log(tracks);
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
		console.log(tracks);

		function delay(ms) {
			return new Promise(resolve => setTimeout(resolve, ms));
		}
		var shown = false;
		for (var title of tracks) {
			if (title.id == songId || shown) {
				console.log(title);
				shown = true;
				await spotifyApi.queue(title.uri);
				// await delay(100);
			}
		}

		
		// return new Promise((resolve) => {
		// 	let results = [];
		// 	function sendReq (itemsList, iterate) {
		// 		setTimeout(() => {
		// 			// slice itemsList to send request according to the api limit
		// 			let slicedArray = itemsList.slice(iterate * 5, (iterate * 5 + 5));
		// 			result = slicedArray.map(item => spotifyApi.queue(item.uri));
		// 			results = [...results, ...result];
				
		// 			// This will resolve the promise when reaches to the last iteration
		// 			if (iterate === Math.ceil(tracks.length / 5) - 1) {
		// 				resolve(results);
		// 			}
		// 		}, (1000 * iterate)); // every 1000ms runs (api limit of one second)
		// 	}
		  
		// 	// This will make iteration to split array (requests) to chunks of five items 
		// 	for (i = 0; i < Math.ceil(tracks.length / 5); i++) {
		// 	  sendReq(tracks, i);
		// 	}
		// }).then(Promise.all.bind(Promise)).then(console.log);
		// Use Promise.all to wait for all requests to resolve
		// To use it this way binding is required
		
		// var shown = false;
		// var toQueue = [];
		// for (var title of tracks) {
		// 	console.log(title);
		// 	if (title.id == songId || shown) {
		// 		shown = true;
		// 		toQueue.push(spotifyApi.queue(title.uri));
		// 	}
		// }
		// return Promise.all(toQueue);
		//});
	},
	addSongsToQueue: async function() {
		var playableSongs = Box.currentSongs.filter(function(song){
			return song.track.available_markets.length > 0 && song.track.type == 'track';
		});
		for (var song of playableSongs) {
			console.log(song);
			await spotifyApi.queue(song.track.id);
		}
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