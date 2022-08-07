
# DiscoList 💿
DiscoList is a web application that allows you to look up the discography your favorite artist.
<br><br>Try it out here: [Live Site](https://tdo95.github.io/discolist/) ✨
###
![Discolist Demo Image Gif](https://github.com/tdo95/discolist/blob/main/discolist-demo.gif)

## How it's made  🏗
**Tech Used:** HTML, CSS, JavaScript, Node, Express [Spotify API](https://developer.spotify.com/documentation/web-api/quick-start/) <br><br>
DiscoList uses APIs to collect data on each artists music catalog and serves this information on an interface inspired by Spotify’s web app design.

## Features 📱
- Artist lookup: dynamically generates options based on search entry
- Music catalog view: shows collection of entire artist discography
- Timeline view: details project creation history in chronological order
- Tracklist view: view all the tracks included in album and click link to play 

## Lessons Learned 🎖
- Prevent zooming within input text, while still keeping pinch zoom functionality by adding a maximum property to your meta tag
- How to create an API relay on a remote server to hide API keys
- Safari v14 only recently implemented the gap property for Flexbox, later versions will need alternative styling
- OAuth authentication convention and the different flows involved (implicit grant, client credentials, authentication grant etc.)
- How  to implement CORS module to block unapproved user from accessing routes

## Future Improvements 📊
- Add artist specific information (i.e. place of origin, birthday, age, government name) using Media Wiki API
- Reduce latency and increase remote server response performance
