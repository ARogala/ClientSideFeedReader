# Client Side Feed Reader

## Table of Contents

* [About](#about)
* [Instructions](#instructions)
* [Contributing](#contributing)
* [Future Plans](#future-plans)
* [Dependencies](#dependencies)

## About

I developed Client Side Feed Reader (CSFeedy) as a fun and productive way to learn about AJAX in native JavaScript. Despite its name this single page web app isn’t 100% Client Side as it utilizes rss2json.com API for converting the RSS and Atom feeds to usable JSON objects. Everything else is handled on the client side with JavaScript, CSS, and HTML (BEM naming convention is used). All the feeds (and API Key) input get stored in the web browsers local storage. The feeds can be backed up and restored in order to keep the data persistent in the event of clearing browser data. This app only works in Chrome and Firefox.

I am aware, and want everyone using this code to be aware, that the choice to store the API key in local storage is not safe from a security perspective. However, I personally feel the risk is at a tolerable level for a small project that is ONLY intended to be run locally on the browser (I would not host this code as is). To help mitigate whatever risk there is to the API key use the IP address restriction in the My Account section at rss2json.com and NEVER enter you key on a public computer.

If a key is being used there are only 50 feeds available. Also make sure to uncheck the disable adding new feeds from API requests in the My Feeds section of My Account on rss2json.com or the server will throw a 401 error. This app will run without an API key but it doesn’t work as well so I recommend just getting the key if you wish to use this app or experiment with the code and API. I have NO association with rss2json. I simply found their API worked well and decided to use if for the first version of my app.

I am looking into ways to drop the use of the API and process the RSS feeds on the client’s browser thus making this app 100% client side and removing any risk associated with storing the API key on the client browser. I think https://www.npmjs.com/package/rss-parser is a possible solution. This would complete the goal of having a feed reader app that runs entirely client side with no need to sign up for any service!!

Overall this project proved to be challenging, very interesting, and even distracting as I spent too much time on reddit RSS feeds. Below is a brief description of two interesting parts of the project.

The RSS feed menu is generated dynamically by sorting and building the feed buttons from the array of objects stored in local storage. See buildFeedButtons() function in the code.

Backing up and restoring the local storage session was another interesting and challenging part of this project and after experimenting and getting a proof of concept with the JSZip API at https://stuk.github.io/jszip/ I actually decided to go with a native JavaScript File API solution instead as I felt for a small project I wanted to limit libraries. It was tough seeking out information on backing up and restoring local storage as a text file but I knew it could be done so I did not quit. See backUpFeeds() and restoreFeeds() functions in the code.


## Instructions

To run this app on your PC download or clone this repo and place it anywhere you would like on your PC. Then go into the app folder right click on index.html and open with Chrome or Firefox. I have included (for an example) in the app folder a backup of my feeds (CSFeedyBackUp.txt). Once you open index.html in Chrome click on settings then click on Restore Feeds then upload CSFeedyBackUp.txt and click settings again to make the feed list menu visible again. Adding and deleting feeds should be pretty easy. You can then bookmark the page for easy opening next time. Edge or IE will not run this code locally but may work if you spin up a local web server. IE and Edge will not run code that contains the Web Storage API locally without a local server. I tested this in Edge it is buggy.

As mentioned in the About section this code is ONLY intended to be run locally on your PC. DO NOT host this code as is! This code is in the experimental stage and has some security issues. See About section.

## Contributing

Feel free to fork the code and modify to your liking. I may open some issues in the future.
Of course, please credit me (ARogala @ https://github.com/ARogala/ClientSideFeedReader) for my initial work on this feed reader.

## Future Plans

If possible remove rss2json dependency and parse the RSS and Atom feeds entirely on the clients browser to meet the goal of a 100% client side feed reader. (No Sign Ups and NO API Keys)
Improve error handling.
Improve the algorithm for deciding which image to display.

## Dependencies
https://rss2json.com/google-feed-api-alternative





