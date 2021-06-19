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










var Main = {
	oninit: function(vnode){
		Box.loadUser()
		.then(Box.loadPlaylists);
	},
	view: function(vnode) {
		return m('.playlists-container', [
			m('.playlists', Box.playlists.map(function(playlist){
				return m(m.route.Link, {
					class: 'playlist',
					href: '/view/' + playlist.id
				}, playlist.name);
			})),
			m('button', {onclick: Box.loadMore}, 'Load More Playlists')
		]);
	}
}

m.route(document.querySelector('.app'), '/list', {
    '/list': Main,
	'/view/:id': Playlist
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