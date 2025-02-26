require('dotenv').config();

const express = require('express');
const hbs = require('hbs');

// require spotify-web-api-node package here:
const SpotifyWebApi = require('spotify-web-api-node');

const app = express();

app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

// Register the location for handlebars partials here:
hbs.registerPartials(__dirname + "/views/partials");

app.use(express.urlencoded({ extended: true }));

// setting the spotify-api goes here:
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET
});

main();

async function main() {
    // Retrieve an access token
    try {
        const data = await spotifyApi.clientCredentialsGrant();
        await spotifyApi.setAccessToken(data.body['access_token']);
    } catch (error) {
        console.error('Something went wrong when retrieving an access token', error);
    };
}

// Our routes go here:
app.get('/', (req, res) => {
    res.render('index', {pageTitle: "Home"});
});

app.get('/artist-search', async (req, res) => {
    try {
        const artist = req.query.artist;
        const data = await spotifyApi.searchArtists(artist);
        //console.log('The received data from the API: ', data.body.artists.items);    
        res.render('artist-search-results', { artists: data.body.artists.items });
    } catch (error) {
        console.error('The error while searching artists occurred: ', error)
    }
});

app.get('/albums/:artistId', async (req, res) => {
    try {
        // due to line 4 in artist-search-results.hbs we pass here the id:
        // req.params ALWAYS returns an object
        const artistId = req.params.artistId;
        //this works too
        //const { artistId } = req.params
         
        const albums = await spotifyApi.getArtistAlbums(artistId);
        //console.log('Artist albums', albums.body.items);
        res.render('albums', { albums: albums.body.items });
         
    } catch (error) {
        console.error(error);
    };
});

app.get('/tracks/:albumId', async (req, res) => {
    try {
        const albumId = req.params.albumId;
        const tracks = await spotifyApi.getAlbumTracks(albumId);
        //console.log('Album tracks: ', tracks.body.items);
        res.render('tracks', {tracks: tracks.body.items});
    } catch (error) {
        console.error(error);
    }
})


app.listen(3000, () => console.log('My Spotify project running on port 3000 🎧 🥁 🎸 🔊'));
