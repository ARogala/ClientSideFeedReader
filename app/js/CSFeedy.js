/**
 * Client Side Feed Reader
 * @authors Andrew Rogala
 * @date    2018-06-28 06:10:40
 * @version 1.0
 */

//array of rss objects
let allFeeds = [
	{
		name: 'Nasa Image of the Day',
		category: 'Science',
		url:  'http://www.nasa.gov/rss/dyn/image_of_the_day.rss'
	},

	{
		name: 'CSS-Tricks',
		category: 'WebDevelopment',
		url: 'http://css-tricks.com/feed/'
	},

	{
		name: 'HTML5 Rocks',
		category: 'WebDevelopment',
		url: 'http://feeds.feedburner.com/html5rocks'
	},

	{
		name: 'David Kleinert Photography',
		category: 'Photography',
		url: 'http://www.davidkphotography.com/index.php?x=atom'
	},

	{
		name: 'Reddit Video',
		category: 'Reddit',
		url: 'http://www.reddit.com/r/videos/.rss'
	},

	{
		name: 'Outdoor Photographer',
		category: 'Photography',
		url: 'https://www.outdoorphotographer.com/feed/'
	},

	{
		name: 'Shutterstock',
		category: 'Photography',
		url: 'https://www.petapixel.com/feed'
	},

	{
		name: 'Smithsonian Mag',
		category: 'Smithsonian',
		url: 'https://www.smithsonianmag.com/rss/multimedia/'
	},

	{
		name: 'Smithsonian Food',
		category: 'Smithsonian',
		url: 'https://www.smithsonianmag.com/rss/food/'
	},

	{
		name: 'Wired',
		category: 'Technology',
		url: 'http://www.wired.com/feed'
	},

	{
		name: 'Smithsonian Videos',
		category: 'Smithsonian',
		url: 'https://www.smithsonianmag.com/rss/videos/'
	},

	{
		name: 'Reddit Home',
		category: 'Reddit',
		url: 'https://www.reddit.com/.rss'
	},

	{
		name: 'JS Weekly',
		category: 'JavaScript',
		url: 'https://javascriptweekly.com/rss/1a177hd2'
	}
];

/*
	function to load feeds
	Note: The readyState property holds the status of the XMLHttpRequest.
	The onreadystatechange event is triggered every time the readyState changes.

	1. get the rssOutput div from html
	2. clear the page of previous feed
	3. set up a new Http requeset object (needed to request data from servers)
	4. create an apiData object containing api specific data
	5. Initialize a new request with open() and specify it is to get something from the server
	6. send() the request to the server
	7. set up a onreadystatechange function to listen for readyState changes and process the request

*/
function loadFeed(id) {
	const content = document.getElementById('rssOutput');
	content.innerHTML ='';
	let xhr = new XMLHttpRequest();
	let apiData = {
        rss_url: allFeeds[id].url,
        //api_key: 'abc123yourapikey',
        count: 100,
        order_by: 'pubDate'
    };

    if(apiData.api_key != undefined) {
    	xhr.open(
	        'GET',
	        'https://api.rss2json.com/v1/api.json?rss_url='+apiData.rss_url+'&api_key='+
	        apiData.api_key+'&order_by='+apiData.order_by+'&count='+apiData.count,
	        true
    	);
    }
    else if(apiData.api_key === undefined) {
    	xhr.open(
	        'GET',
	        'https://api.rss2json.com/v1/api.json?rss_url='+apiData.rss_url,
	        true
    	);
    }


    xhr.send();
    /*
    	readyState 4: request finished and response is ready
    	status 200: Ok
    	status 404: page not found
    	The api will respond with text that is parsed to a JSON object
    	Then we can work with the JSON object and display the feed on the page
    */
	xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            const data = JSON.parse(xhr.responseText);
            console.log(data);
			//this div holds all the feeds
   		 	const itemsContainer = document.createElement('div');
            const frag = document.createDocumentFragment();

            if(data.status == 'ok') {
            	//for each feed (item) in the JSON object build its div
                for(let i = 0; i < data.items.length; ++i ) {
                    let item = data.items[i];
                    //this div holds the individual feeds
                    let itemContainer          = document.createElement('div');
                    let itemTitleElement       = document.createElement('h2');
                    let itemLinkElement        = document.createElement('a');
                    let itemPubDate            = document.createElement('time');
                    let itemDescriptionElement = document.createElement('p');
                    let imageElement           = document.createElement('img');
                    let thumbnailImageElement  = document.createElement('img');
                    //link is a child of h2 title element
					itemLinkElement.setAttribute('href' , item.link);
                    itemLinkElement.setAttribute('target' , '_blank');
                    itemLinkElement.innerText = item.title;
                    itemTitleElement.appendChild(itemLinkElement);

                    itemPubDate.setAttribute('datetime', item.pubDate);
                    itemPubDate.innerText = item.pubDate;

					// note : make sure the content is XSS safe before using innerHTML
                    itemDescriptionElement.innerHTML = item.description;
                    //append title, pubdate, description, and images to item container
                    itemContainer.appendChild(itemTitleElement);
                    itemContainer.appendChild(itemPubDate);
                    itemContainer.appendChild(itemDescriptionElement);

                    itemContainer.appendChild(imageElement);
                    itemContainer.appendChild(thumbnailImageElement);

                    /*
                    Images are potentially stored in one (1) or more of three (3) places in the item object
                    the description, enclosure, or thumbnail. If an image is stored in the description it is injected
                    with the innerHTML command above.

                    To ensure the single best image is displayed several feeds were tested and it was
                    found that the highest resolution images are typically located in the enclosure

					thus if the enclosure link is not undefined prioritize that image else display the thumbnail image
                    */
                    if(item.enclosure.link != undefined) {
                    	imageElement.setAttribute('src', item.enclosure.link);
                    	//imageElement.setAttribute('style', 'width: 60%; height: auto;');
                    }

                    else if(item.thumbnail != undefined && item.enclosure.link == undefined) {
                    	thumbnailImageElement.setAttribute('src', item.thumbnail);
                    	//thumbnailImageElement.setAttribute('style', 'width: 40%; height: auto;');
                    }

                    /*
					For feeds that contain images in all three locations there will be three (3) img elements in the document
					display the enclosure image over the description image
					but display the description image over the thumbnail.
                    */
					let imgElements = itemContainer.querySelectorAll('img');

                    if(imgElements.length === 3 && (item.enclosure.link != undefined)) {
                    	imgElements.item(0).setAttribute('style', 'display: none');
                    }
                    else if(imgElements.length === 3 && (item.thumbnail != undefined)) {
                    	imgElements.item(2).setAttribute('style', 'display: none');
                    }

                    //append each feed div to the doc frag
                    frag.appendChild(itemContainer);

                } //end for loop

                //append the doc frag of feeds to the div that holds all the feeds
                itemsContainer.appendChild(frag);


                let titleElement = document.createElement('h1');
                titleElement.innerText = data.feed.title;
                //append the title and feeds to the main rssOutput content div
                content.appendChild(titleElement);
                content.appendChild(itemsContainer);

            }
        }
        //error
        else if(xhr.status == 404) {
        	const errorElement = document.createElement('h3');
        	errorElement.innerText = 'Sorry there was an error';
        	content.appendChild(errorElement);
        }
    }; //end onreadystatechange
} //end load feed

function init() {
    // Load the first feed we've defined (index of 0).
    loadFeed(0);
}

//init();

/*
	add a feed button to page for each feed in the allFeeds array
	each button must load the proper feed
	the code works as follows
	1. create doc frag
	2. get feedList ul element from html
	3. for each feed create a li and button element
	4. set data attribute on each button (tracks array)
	5. insert innerText on buttons
	6. append button as child to each li element
	7. append li element to DocFrag (then increment feedId)
	8. after loop append frag to feedList
	9. set the event listener on the feed list (this way only 1 event listener)
	10. add trap to event listener function so it only calls loadFeed() when button clicked
	11. pass feedId to loadFeed()
*/
(function() {
	let feedId = 0;
	const frag = document.createDocumentFragment();
	const feedList = document.getElementById('feedList');


	let catID = 0;
	function compair(a,b) {
		if(a.category < b.category) {
			return -1;
		}
		if(a.category > b.category) {
			return 1;
		}
		else {
			return 0;
		}
	}
	//sort the allFeeds obj array according to category
	allFeeds.sort(compair);
	console.log(allFeeds);
	//add categoryIDs to feeds in the same category
	for(let i = 0; i < allFeeds.length; i++) {
		if(i+1 < allFeeds.length) {
			if(allFeeds[i].category === allFeeds[i+1].category) {
				allFeeds[i].categoryID = catID;
				allFeeds[i+1].categoryID = catID;

			}
			else if(allFeeds[i].categoryID != undefined) {
				catID++;
			}
		}
	}
	let categorizedFeeds = [];
	let singleFeeds = [];
	//separate feeds with multiple categories from those alone
	for(let i =0; i < allFeeds.length; i++) {
		if(allFeeds[i].categoryID === undefined) {
			singleFeeds.push(allFeeds[i]);
		}
		else {
			categorizedFeeds.push(allFeeds[i]);
		}
	}

	console.log(categorizedFeeds);
	console.log(singleFeeds);


	//further serpareate each category into its own array
	for(let i =0; i <= catID; i++) {
		this['category'+i]=[];
		for(let j = 0; j < categorizedFeeds.length; j++) {
			if(categorizedFeeds[j].categoryID === i) {
				this['category'+i].push(categorizedFeeds[j])
			}
		}
	}
// console.log(category0);
// console.log(category1);
// console.log(category2);
// console.log(category3);

	for(let feed of allFeeds) {
		feed.id = feedId;
		const newListElement = document.createElement('li');
		const newButtonElement = document.createElement('button');
		newButtonElement.setAttribute('data-id', feedId);
		newButtonElement.innerText = feed.name;
		newListElement.appendChild(newButtonElement);
		frag.appendChild(newListElement);
		feedId++;
	}
	feedList.appendChild(frag);

	feedList.addEventListener('click', function(e) {
		//console.log(e.target.tagName);
		if(e.target.tagName === 'BUTTON') {
			loadFeed(e.target.dataset.id);
		}

	});

})();






