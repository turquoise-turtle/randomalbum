/*

Box
	playlists
	favourites
	.loadmore
	current
		songs
		albums
		.extractalbums
	currentSongs
Playlist view
Main view


*/

var Header = {
	view: function(vnode) {
		return m('h1.apptitle', m(m.route.Link, {class: 'applink', href: '/'}, 'randomalbum'))
	}
};

var Main = {
	oninit: function(vnode){
		Box.loadUser()
		.then(Box.loadPlaylists);
	},
	view: function(vnode) {
		//return m('.app', [
		//	m('h1.apptitle', m(m.route.Link, {class: 'applink', href: '/'}, 'randomalbum')),
		return m('.playlists-container', [
			m('.playlists', Box.playlists.map(function(playlist){
				return m('.playlist', m(m.route.Link, {
					class: 'playlist',
					href: '/view/' + playlist.id
				}, playlist.name));
			})),
			m('br'),
			m('button', {onclick: Box.loadMore}, 'Load More Playlists')
		])
		//]);
	}
}

var Playlist = {
	oninit: function(vnode){
		Box.loadPlaylist(vnode.attrs.id);
	},
	view: function(vnode) {
		return m('.playlist', [
			m('h2', {value: Box.current.name}), 
			m('.tracks', Box.currentSongs.map(function(song){
				return m('h3', song.track.name);
			})),
			m('.bar', m(m.route.Link, {
				class: 'barbutton',
				href: '/albums/' + vnode.attrs.id
			}, 'Show Albums'))
		]);
	}
}

var Album = {
	oninit: function(vnode) {
		Box.loadAlbumPage(vnode.attrs.id);
	},
	view: function(vnode) {
		return m('.playlist', [
			m('h2', {value: Box.current.name}), 
			m('.albums', Box.currentSongs.map(function(song){
				return m('a', {
					href: song.track.album.uri,
					style: {
						display: 'block'
					}
				}, m('.album', m('h3', song.track.album.name)));
			}))
		]);
	}
}



m.route(document.querySelector('.app'), '/list', {
    '/list': {
		view: function(vnode) {
			return m('.app', [
				m(Header),
				m(Main)
			]);
		}
	},
	
	//Main,
	'/view/:id': Playlist,
	'/albums/:id': Album
})




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