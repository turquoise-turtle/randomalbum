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

var Layout = {
	view: function(vnode) {
		return m('.app', [
			m('h1.apptitle', [
				m(m.route.Link, {class: 'applink', href: '/'}, 'randomalbum'),
				Box.username ? m('span', ' - '  + Box.username) : null
			]),
			
			m('.content', vnode.children)
		]);
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

var Footer = {
	view: function(vnode) {
		return m('.footer', [
			m(m.route.Link, {
				class: 'barbutton',
				href: '/albums/' + m.route.param('id')
			}, 'Show Albums'),
			m('button', {
				onclick: function() {
					//m.route.set('/albums/' + m.route.param('id'));
					Box.loadAlbumPage(m.route.param('id'))
					.then(function(){
						var n = Math.floor(Math.random() * Box.currentSongs.length);
						while (Box.currentSongs[n].track.available_markets.length == 0) {
							n = Math.floor(Math.random() * Box.currentSongs.length);
						}
						location.href = Box.currentSongs[n].track.album.uri;
						//var x = document.querySelectorAll('div.row[data-type="show"]');var n = Math.floor(Math.random() * 50);x[n].scrollIntoView();x[n].style.backgroundColor = 'linen'
					})
				}
			}, 'Random Album')
		])
	}
};

var Playlist = {
	oninit: function(vnode){
		Box.loadPlaylist(m.route.param('id'));
	},
	view: function(vnode) {
		return m('.playlist', [
			m('h2', {value: Box.current.name}), 
			m('.tracks', Box.currentSongs.filter(function(song){
				return song.track.available_markets.length > 0;
			}).map(function(song){
				return m('h3', song.track.name);
			})),
			m(Footer)
		]);
	}
}

var Album = {
	oninit: function(vnode) {
		Box.loadAlbumPage(m.route.param('id'));
	},
	view: function(vnode) {
		return m('.playlist', [
			m('h2', {value: Box.current.name}), 
			m('.albums', Box.currentSongs.filter(function(song, index, self){
				return song.track.available_markets.length > 0 && self.indexOf(song) === index;
			}).map(function(song){
				return m('a', {
					href: song.track.album.uri,
					style: {
						display: 'block'
					}
				}, m('.album', m('h3', song.track.album.name)));
			})),
			m(Footer)
		]);
	}
}



m.route(document.querySelector('.app'), '/list', {
    '/list': {
		render: function(){
			return m(Layout, m(Main))
		}
	},
	'/view/:id': {
		render: function(vnode){
			return m(Layout, m(Playlist))
		}
	},
	'/albums/:id': {
		render: function(){
			return m(Layout, m(Album))
		}
	}
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