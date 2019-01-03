/**
 * Holds the GET variables
 */
var GET = { output: 'html' };
parseURLVars();
//Immediately start running the code
start();
/**
 * Entry point of the code
 */
async function start() {
    //Start the search process;
    let searchData = await getSearchData();
    let results = searchData.results;
    if (GET.output.toLowerCase() === 'json') {
        //Now set the html of the body to the JSON that was fetched
        document.getElementsByTagName("body")[0].innerHTML = "<pre>" + JSON.stringify(searchData) + "</pre>";
    } else {
        //The html we will generate
        var html = "";
        results.forEach(function (result) {
            html += htmlResult(result);
        });
        //Set the generated html as content of the list div
        document.getElementsByTagName("body")[0].innerHTML = html;
    }
}

/**
 * Generates the HTML for a result
 * @param {Object} result 
 */
function htmlResult(result) {
    //Generate the lemma header and open the div
    var html = "<div class='result'><h3>" + result.lemma + "</h3>";
    result.entries.forEach(function(entry){
        html += htmlEntry(entry);
    });
    //Close the html div and return
    return html + "</div>";

}

/**
 * Generates the HTML code for one single entry
 * @param {Object} entry 
 */
function htmlEntry(entry){
    var html = "<div class='entry' id='" + entry.id + "'>";
    html += "<span class='dictDef'>Dict: " + entry.dictionary + "</span>";
    html += "<ul class='meaningList'>";
    entry.definitions.forEach(function(definition){
        html += "<li><span class='langDef'>" + definition.language + "</span>:&nbsp;";
        html += definition.definition;
        html += "</li>";
    });
    html += "</ul></div>";
    //Now add the highlights to the generated text
    let toReplace = entry.highlight.replace(/<\/?em>/g, '');
    let index = html.indexOf(toReplace);
    //Now reconstruct the string with the em in the middle
    html = html.substring(0, index) + entry.highlight + html.substring(index + toReplace.length);

    return html;
}


/**
 * Retrieves the access token from the api, and returns that token
 */
async function getAccessToken() {
    let response = await fetch('https://manc.hu/api/oauth/token', {
        method: 'post',
        mode: "cors",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "client_id=6nqtHYGpTc&client_secret=uv179ZWxI5rfIw6ilYGfA87TeAAAls5I&grant=client_credentials&scope=lexicon"
    })
    //Store the key after request
    let key = await response.json();
    //Now do the request with the access token
    return key.access_token;
}

/**
 * Starts the search process, first asks for an access token,
 * then checks if the keyword value is not empty or otherwise invalid
 */
async function getSearchData() {
    //First check if the keyword is valid
    var keyword = GET.keyword;
    //Abort if keyword is undefined or not of a proper length
    if (!keyword || keyword.length < 1) return;
    //Now set up the request method
    let response = await fetch('https://manc.hu/api/lexicon/search', {
        method: 'post',
        mode: "cors",
        cache: "no-cache",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
        },
        headers: {
            "Authorization": "Bearer " + (await getAccessToken()),
            "Content-Type": "application/json",
        },
        body: '{"query": "' + keyword + '","definition": true,"from": 0,"size": 100}'
    });
    //Now wait for the response
    let result = await response.json();
    return result;
}

/**
 * Parses the URL variables and stores them in an object
 */
function parseURLVars() {
    //First grab the url
    let url = window.location.href;
    //Check if we have a GET value in there, if not return empty
    if (url.indexOf("?") < 0) return "";
    //Now only read the get part
    let get = url.split('?')[1];
    //Split the get part into pairs, each is a key value pair
    let pairs = get.split("&");
    //Iterate over the pairs, and only once you see keyword we return the value
    var returnValue = "";
    pairs.forEach(function (pair) {
        if (pair.split("=")[0].toLowerCase() == "keyword") {
            returnValue = pair.split("=")[1];
        }
        let parts = pair.split('=');
        GET[decodeURI(parts[0])] = decodeURI(parts[1]);
    });
}