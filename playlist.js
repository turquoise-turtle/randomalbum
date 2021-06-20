var Playlist = {
	oninit: function(vnode){
		Box.loadPlaylist(vnode.attrs.id);
	},
	view: function(vnode) {
		return m('.playlist', [
			m('h2', {value: Box.current.name}), 
			m('.tracks', Box.currentSongs.map(function(song){
				return m('h3', {value: song.track.name});
			}))
		]);
	}
}