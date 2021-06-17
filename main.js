var spotifyApi = new SpotifyWebApi();
var token = localStorage.getItem('access_token');
spotifyApi.setAccessToken(token);

spotifyApi.getUserPlaylists()
.then(
    function (data) {
    	console.log('User playlists', data);
    },
    function (err) {
    	console.error(err);
    }
);