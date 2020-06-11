import React from 'react';
import './App.css';
import SearchBar from '../SearchBar/SearchBar';
import SearchResults from '../SearchResults/SearchResults';
import Playlist from '../Playlist/Playlist';
import Spotify from '../../util/Spotify';

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      searchResults: [],
      playlistName: 'Play List Name',
      playlistTracks: [],
    }
    this.addTrack = this.addTrack.bind(this);
    this.removeTrack = this.removeTrack.bind(this);
    this.updatePlaylistName = this.updatePlaylistName.bind(this);
    this.savePlaylist = this.savePlaylist.bind(this);
    this.search = this.search.bind(this);
  }

  addTrack(track) {
    let existingPlaylist = this.state.playlistTracks;
    if(existingPlaylist.find(oldTrack => oldTrack.id === track.id)) {
      return;
    }
    else {
      existingPlaylist.push(track);
      this.setState({playlistTracks: existingPlaylist});
    }
  }

  removeTrack(track) {
    let existingPlaylist = this.state.playlistTracks;
    let removedTrack = existingPlaylist.findIndex(playListTrack => playListTrack.id === track.id);
    existingPlaylist.splice(removedTrack, 1);
    this.setState({playlistTracks: existingPlaylist});
  }

  updatePlaylistName(name) {
    this.setState({playlistName: name});
  }

  savePlaylist() {
    const trackURIs = this.state.playlistTracks.map(track => track.uri);
    Spotify.savePlaylist(this.state.playlistName, trackURIs).then(() => {
      this.setState({
        playlistName: 'New Playlist',
        playlistTracks: [],
      })
    })

  
  }

  search(term) {
    Spotify.search(term).then(results => {
      this.setState({searchResults: results})
    })
  }

  render() {
    return (
      <div>
        <h1>Ja<span className="highlight">mmm</span>ing</h1>
        <div className="App">
          <SearchBar onSearch={this.search}/>
          <div className="App-playlist">
            <SearchResults onSearch={this.search} searchResults={this.state.searchResults} onAdd={this.addTrack}/>
            <Playlist 
              playlistName={this.state.playlistName} 
              playlistTracks={this.state.playlistTracks} 
              onRemove={this.removeTrack} 
              onNameChange={this.updatePlaylistName} 
              onSave={this.savePlaylist}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
