/**
 * Client Side Feed Reader
 * @authors Andrew Rogala
 * @date    2018-06-28 06:10:40
 * @version 1.0
 */
'use strict';
//array of rss objects from local storage or blank array is no feeds saved yet
let allFeeds = JSON.parse(localStorage.getItem('allFeeds') || '[]');

const formElement = document.getElementById('feedData');

//toggle visibility of feed entry form and other settings
formElement.style.display = 'none';
const toggleBtn = document.getElementById('formToggle');

toggleBtn.addEventListener('click', function() {
	const navElement = document.getElementById('nav');
	if(formElement.style.display === 'none') {
		formElement.style.display = 'block';
		navElement.style.display = 'none';
	}
	else {
		formElement.style.display = 'none';
		navElement.style.display = 'block';
	}
});

//scroll to top button
const scrollBtn = document.getElementById('scrollTop');

//display and hide button at break points
window.onscroll = function() {
	displayHideScrollBtn();
};

function displayHideScrollBtn() {
	 if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
        scrollBtn.style.display = 'block';
    } else {
        scrollBtn.style.display = 'none';
    }
}

//on click scroll to top
scrollBtn.addEventListener('click', function() {
	document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
});

//save feeds to local storage
let feedName, feedCategory, feedURL;
//when the Add Feed button in clicked get the inputs and save the data
formElement.addEventListener('submit', function(e) {
	e.preventDefault();
	getInputs();
	saveData();
});

function getInputs() {
	feedName     = formElement.elements[1].value;
	feedCategory = formElement.elements[2].value;
	feedURL      = formElement.elements[3].value;
}

function saveData() {
	//push a new empty object on the all feeds array
	allFeeds.push({});

	const newFeedIndex = allFeeds.length - 1;
	//add new feed data to obj in feeds array
	allFeeds[newFeedIndex].name = feedName;
	allFeeds[newFeedIndex].category = feedCategory;
	allFeeds[newFeedIndex].url = feedURL;
	//save new feed array locally
	localStorage.setItem('allFeeds', JSON.stringify(allFeeds));
	//build the feed buttons and reset the form
	buildFeedButtons();
	formElement.reset();

}

//Backup code starts here

//add event listeners to backup and restore buttons
document.getElementById('backUpFile').addEventListener('change', restoreFeeds);
document.getElementById('backUpBtn').addEventListener('click', backUpFeeds);

/*
	store the text to backup as a string in the backUpFileText variable
	convert the sting to a blob which is raw data that represents our text
	(Blobs allow you to construct file like objects on the client that you can pass
	to apis that expect urls)
	generate a URL from the blob so our text can be passed as a
	URL to APIs that accept urls
	in this case i pass the text now represented in the objectURL
	to the anchor tag for download

*/
function backUpFeeds() {
	let backUpFileText = localStorage.getItem('allFeeds');
	let backUpFileTextAsBlob = new Blob([backUpFileText], {type:"text/plain"});
	let backUpFileAsURL = window.URL.createObjectURL(backUpFileTextAsBlob);
	let fileName = 'CSFeedyBackUp.txt';

	let downloadElement = document.createElement('a');
	downloadElement.setAttribute('href', backUpFileAsURL);
	downloadElement.setAttribute('download', fileName);

	downloadElement.style.display = 'none';
	document.body.appendChild(downloadElement);

	downloadElement.click();

	document.body.removeChild(downloadElement);
	//free up memory by revoking the url after we finish
	window.URL.revokeObjectURL(backUpFileTextAsBlob);

}
//get the file from the user and use readAsText to read the txt doc
//parse into allFeeds and save allFeeds back to localStorage
function restoreFeeds(evt) {
    let files = evt.target.files; // FileList object
    if(files[0].name === 'CSFeedyBackUp.txt') { //ensure proper file is uploaded
	    let file = files[0];
	    let reader = new FileReader();
	    //readAsText is asynchronous, so need to use the onload callback
	    //to see the result
	    reader.readAsText(file);
	    reader.onload = function(event) {
	    	allFeeds = JSON.parse(event.target.result);
	    	localStorage.setItem('allFeeds', JSON.stringify(allFeeds));
	    	//build the feed buttons and reset the form
	    	buildFeedButtons();
	    	formElement.reset();
		}
    }
    else {
    	alert('To restore your feeds please upload the same file downloaded as a backup. It is named CSFeedyBackUp.txt');
    }
}

//backup code ends


//delete a feed
function deleteSingleFeed(id) {
	//loop through allFeeds array delete object with matching id
	//set localStorage equal to the modified allFeeds array
	for(let i = 0; i < allFeeds.length; i++) {
		if(allFeeds[i].id === parseInt(id)) {
			allFeeds.splice(i,1);
		}
	}
	localStorage.setItem('allFeeds', JSON.stringify(allFeeds));
	buildFeedButtons();
}

//add api key to localStorage
const APIKeyBtn = document.getElementById('APIKey');

APIKeyBtn.addEventListener('click', function() {
	let APIKey = prompt('Please enter your API Key', 'abc123yourapikey');
	let reWriteKey;
	if(localStorage.getItem('APIKey') === null) {
		localStorage.setItem('APIKey', JSON.stringify(APIKey));
	}
	else {
		reWriteKey = confirm('CSFeedy detects an API Key would you like to over ride the current key?');
	}
	if(reWriteKey === true) {
		localStorage.setItem('APIKey', JSON.stringify(APIKey));
	}
});


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
	//process id to get url
	let url;
	for(let i=0; i<allFeeds.length; i++) {
		if(allFeeds[i].id === parseInt(id)) {
			url = allFeeds[i].url;
		}
	}

	const content = document.getElementById('rssOutput');
	content.innerHTML ='';
	let xhr = new XMLHttpRequest();
	let apiData = {
	    rss_url: url,
	    api_key: JSON.parse(localStorage.getItem('APIKey')),
	    count: 100,
	    order_by: 'pubDate'
	};

    if(apiData.api_key !== null) {
    	xhr.open(
	        'GET',
	        'https://api.rss2json.com/v1/api.json?rss_url='+apiData.rss_url+'&api_key='+
	        apiData.api_key+'&order_by='+apiData.order_by+'&count='+apiData.count,
	        true
    	);
    }
    else if(apiData.api_key === null) {
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
			//this div holds all the feeds
   		 	const itemsContainer = document.createElement('div');
            const frag = document.createDocumentFragment();

            if(data.status == 'ok') {
            	//for each feed (item) in the JSON object build its div
                for(let i = 0; i < data.items.length; ++i ) {
                    let item = data.items[i];
                    //this article tag holds the individual feeds
                    let itemContainer          = document.createElement('article');
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
	each button loads the proper feed
*/
function buildFeedButtons() {
	let feedId = 0;
	const frag = document.createDocumentFragment();
	const feedList = document.getElementById('feedList');
	//clear the previous feed list
	feedList.innerHTML = '';
	//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce
	function groupBy(objectArray, property) {
		return objectArray.reduce(function (acc, obj) {
			//remove case sensitivity
			obj[property] = toTitleCase(obj[property]);
			//store the category in key
			let key = obj[property];
			//if the accumulator object at key is undefined place empty array
			if (!acc[key]) {
			  acc[key] = [];
			}
			//push objects with the same key into their array
			//return accumulator
			acc[key].push(obj);
			return acc;
		}, {});
	}

	//https://stackoverflow.com/questions/4878756/how-to-capitalize-first-letter-of-each-word-like-a-2-word-city
	function toTitleCase(str) {
		return str.replace(/\w\S*/g, function(txt){
		    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
		});
	}

	//group allFeeds according to category
	let groupedAllFeeds = groupBy(allFeeds, 'category');

	//get and sort the categories
	let allCategories = Object.keys(groupedAllFeeds);
	allCategories.sort();

	/*
		for each category if the number of feeds is greater than 1
		build the DOM
		note: adding feedId to groupedAllFeeds adds feedId to allFeeds as well.
		I am not sure why that happens (must have something to do with the reducer)
	*/
	for(let i = 0; i < allCategories.length; i++) {
		if(groupedAllFeeds[allCategories[i]].length > 1) {
			//build the dropdown li, button, and ul for each category
			const dropDownList = document.createElement('li');
			const dropDownButton = document.createElement('button');
			const dropDownUL = document.createElement('ul');
			dropDownList.setAttribute('class', 'nav__dropDownLI');
			dropDownButton.setAttribute('aria-haspopup', true);
			dropDownButton.setAttribute('class', 'nav__dropDownBtn');
			dropDownButton.innerText = allCategories[i];
			dropDownUL.setAttribute('aria-label', 'submenu');
			dropDownUL.setAttribute('class', 'nav__dropDownUL');

			dropDownList.appendChild(dropDownButton);
			dropDownList.appendChild(dropDownUL);
			//for each feed in the category build the drop down buttons
			for(let j = 0; j < groupedAllFeeds[allCategories[i]].length; j++) {
				groupedAllFeeds[allCategories[i]][j].id = feedId;
				const dropDownListItem = document.createElement('li');
				const dropDownButtonItem = document.createElement('button');
				const deleteFeedButton = document.createElement('button');

				dropDownListItem.setAttribute('class', 'nav__feedLI');
				dropDownButtonItem.setAttribute('data-id', feedId);
				dropDownButtonItem.setAttribute('class', 'nav__feedBtn');
				deleteFeedButton.setAttribute('data-id', feedId);
				deleteFeedButton.setAttribute('class', 'nav__deleteBtn');
				dropDownButtonItem.innerText = groupedAllFeeds[allCategories[i]][j].name;
				deleteFeedButton.innerText = 'Delete';
				dropDownListItem.appendChild(dropDownButtonItem);
				dropDownListItem.appendChild(deleteFeedButton);
				dropDownUL.appendChild(dropDownListItem);

				feedId++;
			}
			frag.appendChild(dropDownList);
		}

	}

	//build the DOM for single feeds
	for(let i = 0; i < allCategories.length; i++) {

		if(groupedAllFeeds[allCategories[i]].length === 1) {
			/*
			build the DOM for single feeds
			1. for each single feed create a li and button element
			2. set data attribute on each button (tracks array)
			3. insert innerText on buttons
			4. append button as child to each li element
			5. append li element to DocFrag (then increment feedId)
			6. after loop append frag to feedList
			*/

			groupedAllFeeds[allCategories[i]][0].id = feedId;
			const newListElement = document.createElement('li');
			const newButtonElement = document.createElement('button');
			const deleteFeedButton = document.createElement('button');

			newListElement.setAttribute('class', 'nav__feedLI');
			newButtonElement.setAttribute('data-id', feedId);
			newButtonElement.setAttribute('class', 'nav__feedBtn');
			deleteFeedButton.setAttribute('data-id', feedId);
			deleteFeedButton.setAttribute('class', 'nav__deleteBtn');

			newButtonElement.innerText = groupedAllFeeds[allCategories[i]][0].name;
			deleteFeedButton.innerText ='Delete';

			newListElement.appendChild(newButtonElement);
			newListElement.appendChild(deleteFeedButton);
			frag.appendChild(newListElement);
			feedId++;
		}
	}

	//attached the frag to the document
	feedList.appendChild(frag);
} //end buildFeedButtons

(function() {

	// Check for the various File API support.
	if (window.File && window.FileReader && window.FileList && window.Blob && window.URL) {
	  // Great success! All the File APIs are supported.
	  console.log('All APIs supported');
	}
	else {
	  alert('The File APIs are not fully supported in this browser. Please use the latest version of Chrome or Firefox');
	}

	buildFeedButtons();

	/*
		1. set the event listener on the feed list (this way only 1 event listener)
		2. add trap to event listener function so it only calls loadFeed() when button clicked
		3. pass feedId to loadFeed()
	*/
	feedList.addEventListener('click', function(e) {
		//console.log(e.target.tagName);
		//console.log(e.target.className);
		if(e.target.tagName === 'BUTTON' && e.target.className === 'nav__feedBtn') {
			loadFeed(e.target.dataset.id);
		}
		else if(e.target.tagName === 'BUTTON' && e.target.className === 'nav__deleteBtn') {
			deleteSingleFeed(e.target.dataset.id);
		}
	});

})();






