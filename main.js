/*
 * Format a timestamp to print the time
 */
function timestampToString(timestamp){
    var d = new Date(1*timestamp);
    var h = d.getHours();
    if(h<10) h = '0' + h;
    var m = d.getMinutes();
    if(m<10) m = '0' + m;
    var now = new Date();
    //If the same day, ok
    if(now.getDate()== d.getDate()) return h+":"+m;
    //Else have to precise day
    return monthNames[d.getMonth()]+" "+d.getDate()+getSup(d.getDate())+", "+h+":"+m;
}

/*
 * Sets the display to the given movie
 */
var currentMovieId = null;
var monthNames = [
    "Jan.", "Feb.", "Mar.",
    "Apr.", "May", "June", "July",
    "Aug.", "Sept.", "Oct.",
    "Nov.", "Dec."
];
function getSup(date){
    if(date%10==1) return "st";
    else if(date%10==3) return "rd";
    else if(date%10==2) return "nd";
    else return "th";
}
function getRotation(percentage){
    return 220*percentage/100 - 110;
}
function setMovie(movieId){
    //Loading screen
    var loadingScreen = document.getElementById("loading-screen");
    loadingScreen.style.display = "block";
    setTimeout("document.getElementById('loading-screen').style.opacity = 0.8", 50);
    //Changes current id
    currentMovieId = movieId;
    document.getElementById("feed-tweets").innerHTML = "";
    //JSON url
    var url = "getMovie.php?id="+movieId+"&top="+topTweetsOnly.valueOf();
    //Gets JSON
    $.getJSON( url, function( data ) {
        document.getElementById("movie-title").innerHTML = data.title;
        document.getElementById("details-overview").innerHTML = data.overview;
        document.getElementById("details-poster").src = image_base_url+"w342"+data.poster_path;
        var d = new Date();
        d.setYear(data.release_date.substr(0,4));
        d.setMonth(data.release_date.substr(5,2)-1);
        d.setDate(data.release_date.substr(8,2));
        document.getElementById("details-release-date").innerHTML = monthNames[d.getMonth()]+" "+ d.getDate() + "<sup>"+getSup(d.getDate())+"</sup>";
        document.getElementById("details-release-title").innerHTML = d < new Date() ? "Released" : "To be released";
        document.getElementById("tweets-count").innerHTML = data.count;
        //Sets the value of the pointers
        document.getElementById("pointer-1").style.transform = "rotate("+getRotation(data.rel_pop)+"deg)";
        document.getElementById("pointer-2").style.transform = "rotate("+getRotation(data.rel_flow)+"deg)";
        document.getElementById("pointer-3").style.transform = "rotate("+getRotation(data.rel_rating)+"deg)";
        //Removes loading screen
        var loadingScreen = document.getElementById("loading-screen");
        loadingScreen.style.opacity = 0;
        setTimeout("document.getElementById('loading-screen').style.display = 'none'", 500);
        //Scrolls to title
        $('html, body').animate({
            scrollTop: $("#movie-title").offset().top
        }, 300);
    });
    //resets the latest timestamp
    timestampLatest = null;
    t_refresh = 1;
    getNewTweets(false);
}

/*
 * Handles tweets
 */
//The timestamp of most recent retrieved tweet;
var timestampLatest = null;
//The timestamp of the oldest retrieved tweet
var timestampOldest = null;
//Current state : retrieving or not
var retrieving = false;

//Gets new tweets (incoming)
function getNewTweets(reschedule){
    //If already retrieving, delays
    if(retrieving){
        setTimeout("getNewTweets("+reschedule+")", 1000);
        return;
    }
    //Else starts retrieving
    retrieving = true;
    //JSON url
    var url = "getTweet.php?movie="+currentMovieId+"&action=new&top="+topTweetsOnly.valueOf();
    if(timestampLatest!=null) url += "&timestamp=" + timestampLatest;
    //Gets JSON
    $.getJSON( url, function( data ) {
        var nbRetrieved = 0;
        var firstRetrieval = timestampLatest==null;
        $.each( data, function( key, val ) {
            //Updates the timestamp
            if(timestampLatest==null){
                timestampLatest = val.timestamp;
                timestampOldest = val.timestamp;
            }else if(timestampLatest < val.timestamp){
                timestampLatest = val.timestamp;
            }else if(timestampOldest > val.timestamp){
                timestampOldest = val.timestamp;
            }
            //Adds the tweet to the beginning feed
            tweet_addToFeed(val, true);
            //Retrieval not empty
            nbRetrieved++;
        });
        //Updates the nb of tweets for last hour
        var tlh = document.getElementById("tweets-count");
        if(!firstRetrieval) tlh.innerHTML = tlh.innerHTML*1 + nbRetrieved;
        if(reschedule) tweet_scheduleRefresh(nbRetrieved);
        retrieving = false;
    });
}

//Gets more tweets (older tweets)
function getMoreTweets(){
    //JSON url
    var url = "getTweet.php?movie="+currentMovieId+"&timestamp="+timestampOldest+"&action=more&top="+topTweetsOnly.valueOf();
    //If no tweet already, means there is none to retrieve
    if(timestampOldest==null) return;
    //Gets JSON
    $.getJSON( url, function( data ) {
        $.each( data, function( key, val ) {
            //Updates the timestamp
            if(timestampOldest > val.timestamp){
                timestampOldest = val.timestamp;
            }
            //Adds the tweet to the end of the feed
            tweet_addToFeed(val, false);
        });
    });
}

//Adds tweet object to the feed
function tweet_addToFeed(tweet, prepend){
    if(tweet.text==null) return;
    var feedTweets = document.getElementById("feed-tweets");
    //Creates a tweet box
    var tweet_box = document.createElement("div");
    tweet_box.className = "tweet box " + (tweet.top_tweet==1 ? "top" : "notTop");
    //Creates avatar
    var avatar = document.createElement("img");
    avatar.src = tweet.avatar;
    avatar.className = "avatar";
    //Creates user div
    var user = document.createElement("div");
    user.className = "user";
    user.innerHTML = tweet.user;
    //Screen name
    if(tweet.screen_name!=""){
        var screen_name = document.createElement("a");
        screen_name.href = "https://twitter.com/"+tweet.screen_name;
        screen_name.target = "_blank";
        screen_name.innerHTML = "@"+tweet.screen_name;
        user.appendChild(screen_name);
    }
    //Creates text div
    var text = document.createElement("div");
    text.className = "text";
    //Replaces hashtag and links
    if(tweet.text!=null) text.innerHTML = tweet.text
        .replace(/(http[s]{0,1}:\/\/[a-z0-9./]+)/ig, "<a href='$1' target='_blank'>$1</a>")
        .replace(/(#)([a-z0-9]+)/ig, "<a href='https://twitter.com/hashtag/$2?src=hash' target='_blank' class='hashtag'>$1$2</a>")
        .replace(/(@)([a-z0-9]+)/ig, "<a href='https://twitter.com/$2' target='_blank'>$1$2</a>");
    //Creates metadata div
    var metadataLeft = document.createElement("div");
    metadataLeft.innerHTML = "<img src='icons/clock-16.png'/>" + timestampToString(tweet.timestamp);
    metadataLeft.className = "metadata-left";
    var metadataRight = document.createElement("div");
    metadataRight.innerHTML = "<img src='icons/good-16.png'/>"+ Math.round(tweet.score*10)/10;
    metadataRight.className = "metadata-right";
    //Appends divs to box
    tweet_box.appendChild(avatar);
    tweet_box.appendChild(user);
    tweet_box.appendChild(text);
    tweet_box.appendChild(metadataLeft);
    tweet_box.appendChild(metadataRight);
    //Appends box to feed
    var box = jQuery(tweet_box);
    box.hide();
    //Appends or prepends according to situation
    if(prepend) jQuery(feedTweets).prepend(box);
    else jQuery(feedTweets).append(box)
    box.show('fast');
}

//Refreshes the feed
var t_refresh = 1;
function tweet_scheduleRefresh(nbRetrieved){
    //Max refresh waiting time is 30s and min 1s
    if(nbRetrieved==0 && t_refresh<30) t_refresh += 1;
    else if(nbRetrieved>=5) t_refresh = 1;
    else if(t_refresh>1) t_refresh -= 1;
    console.log("refresh timeout = " + t_refresh);
    //Schedules next retrieval
    setTimeout('getNewTweets(true)', t_refresh*1000);
}
//Adds inital db query
window.addEventListener("load", getNewTweets, false);


/*
* Two modes of display: all displays all tweets while top displays only relevant ones
 */
var topTweetsOnly = true;
function toggleDisplay(left){
    var toggler = document.getElementById("toggle-feed");
    toggler.className = left ? "toggler toggler-left" : "toggler toggler-right";
    topTweetsOnly = left;
    setMovie(currentMovieId);
}

/*
 * Map for displaying the area
 */
/*
var map;
//Initialize the map (default = London)
function map_initialize() {
    //If cannot find the element in dom doesn't go further
    if(!document.getElementById("map")) return;
    var mapOptions = {
        zoom: 6,
        draggable: false,
        maxZoom:6,
        minZoom:6,
        center: {lat:51.50642, lng:-0.12721},
        disableDefaultUI: true
    };
    map = new google.maps.Map(document.getElementById("map"),
        mapOptions);
    //Style
    var styles = [
        {
            "stylers": [
                { "visibility": "off" }
            ]
        },{
            "featureType": "landscape",
            "stylers": [
                { "visibility": "on" }
            ]
        },{
            "featureType": "water",
            "stylers": [
                { "visibility": "on" },
                { "color": "#5A81FF" }
            ]
        },{
            "featureType": "administrative.locality",
            "stylers": [
                { "visibility": "on" }
            ]
        },{
            "featureType": "administrative.country",
            "elementType": "geometry.stroke",
            "stylers": [
                { "visibility": "on" }
            ]
        },{
            "elementType": "labels.text",
            "stylers": [
                { "visibility": "on" }
            ]
        }
    ];
    map.setOptions({styles: styles});
}
//Changes the lat and long for the map
function map_relocate(center){
    map.setCenter(center);
}
//Adds event listener to initialize the map
window.addEventListener('load', map_initialize, false);*/