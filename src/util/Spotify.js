let accessToken;
const clientID = '684fbc43cdc044308c70678302c6256d';
const redirectURI = 'khronarsjam.surge.sh';

const Spotify = {
    
    getAccessToken() {
        if(accessToken) {
            return accessToken;
        }
        const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
        const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);

        if(accessTokenMatch && expiresInMatch) {
            accessToken = accessTokenMatch[1];
            const expiresIn = Number(expiresInMatch[1]);
            //Will clear the access token in *expired time* so that we can grab a new token after this one expires
            window.setTimeout(() => accessToken = '', expiresIn * 1000);
            window.history.pushState('Access Token', null, '/');
            return accessToken;
        }
        else {
            const accessURL = `https://accounts.spotify.com/authorize?client_id=${clientID}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectURI}`;
            window.location = accessURL;
        }
    },

    search(searchTerm) {
        const accessToken = Spotify.getAccessToken();
        console.log(accessToken);
        return fetch(`https://api.spotify.com/v1/search?type=track&q=${searchTerm}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                }
            }).then(response => {
                return response.json();
            }).then(response => {
                console.log(response);
                if (!response.tracks) {
                    return [];
                }
                console.log(response.tracks.items);
                return response.tracks.items.map(track => ({
                        id: track.id,
                        name: track.name,
                        artist: track.artists[0].name,
                        album: track.album.name,
                        uri: track.uri,
                }));
            });
        },

    savePlaylist(playlistName, playlistURIs) {
        if(!playlistName || !playlistURIs.length) {
            return [];
        }

        const accessToken = Spotify.getAccessToken();
        const headers = { Authorization: `Bearer ${accessToken}`};
        let userId;
        
        return fetch('https://api.spotify.com/v1/me', {headers: headers} 
        ).then(response => response.json())
        .then(jsonResponse => {
            userId = jsonResponse.id
            return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`,
            {
                headers: headers,
                method: 'POST',
                body: JSON.stringify({ name: playlistName})
                
            }).then(response => response.json())
            .then(jsonResponse => {
                const playlistId = jsonResponse.id;
                return fetch(`https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`,
                {
                    headers: headers,
                    method: 'POST',
                    body: JSON.stringify({uris: playlistURIs})
                });
            });
        })
    }
}

export default Spotify;