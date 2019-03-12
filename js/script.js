/**
 * Holds the GET variables
 */
var GET = { output: 'html' };
parseURLVars();
//Check if we are passing by query or id
console.log("Starting query...");

if (GET.id != undefined) {
    //Normalize mode
    normalizeMode();
    //Lookup the constructed url
    lookup(constructUrl());
}else if(GET.q != undefined){
    //Do a lookup for the term for every mode option
    GET.m = 'n';
    lookup(constructUrl());
    GET.m = 'p';
    lookup(constructUrl());
    GET.m = 'b';
    lookup(constructUrl())
    GET.m = 't'
    lookup(constructUrl());
}

/**
 * Make the API work with different aliases for the modes
 */
function normalizeMode() {
    //Check the mode depending on the ID input
    let id = GET.id.toLowerCase().trim();
    if (contains(id, 'person')) GET.m = 'n';
    else if (contains(id, 'place')) GET.m = 'p';
    else if (contains(id, 'book')) GET.m = 'b';
    else if (contains(id, 'title')) GET.m = 't';
    //Also normalize the id
    GET.id = GET.id.substring(GET.id.indexOf('_') + 1);
}

/**
 * Returns a boolean if a substring is in that provided string
 * @param {String} s 
 * @param {String} c 
 */
function contains(s, c) {
    return (s.indexOf(c) != -1);
}

/**
 * Constructs the url we need to look up the data
 */
function constructUrl() {
    //The base url, used for all services
    let url = "https://digerati.aks.ac.kr:";
    //Add the port number
    url += getPortNumber(GET.m);
    //Now see if we made a search or a ID request, and modify url accordingly
    if (GET.q != undefined) {
        url += "ChName?ChName=" + GET.q;
    } else if (GET.id != undefined) {
        url += "IdValues/" + GET.id;
    }
    return url;
}

/**
 * REturns the appropriate port number for the mode of the search
 * @param {String} mode 
 */
function getPortNumber(mode) {
    if (mode == 'n') return "85/api/";
    else if (mode == 'b') return "91/api/";
    else if (mode == 'p') return "88/api/";
    else if (mode == 't') return "89/api/";
}

function lookup(urlVar) {
    console.log("Loading data from: " + urlVar);
    //Immediately pass on the GET variable to the proxy
    $.ajax({
        url: urlVar,
        type: "GET",
        cache: false,
        dataType: 'json',
        crossDomain: true,
        contentType: "text/plain",
        success: function (response) {
            start(response);
        },
        error: function (xhr, status) {
            console.log("error in data request");
        }
    });
}

/**
 * Entry point of the code, takes JSON data as the parameter, will then visualize it nicely
 */
function start(data) {
    //For each of the entry points in the data set, show a results div
    let html = "";
    data.forEach(entry => {
        switch (GET.m) {
            case 'n':
                html += displayName(entry);
                break;
            case 'p':
                html += displayPlace(entry);
                break;
            case 't':
                html += displayTitle(entry);
                break;
            case 'b':
                html += displayBook(entry);
                break;
        }
    });
    document.body.innerHTML += html;
}

/**
 * Pretty prints the object entry to the screen
 * @param {Object} entry 
 */
function displayName(entry) {
    //Start results div
    let ahtml = "<div class='result'>";
    ahtml += "<h3>" + entry.PersonId + " <span style='color:grey;'>(" + entry.AkspId + ")</span></h3>"
    ahtml += "<span class='dictDef'>" + entry.Source + "</span>";
    ahtml += "<p>Chinese Name: " + entry.ChName + "</p>";
    ahtml += "<p>Korean Name: " + entry.KoName + "</p>";
    ahtml += "<p>Gender: " + (entry.Gender == 1 ? "Male" : "Female") + "</p>";
    ahtml += "<p>Lived:  " + getLiveSpan(entry) + "</p>";
    ahtml += getAliases(entry);
    ahtml += getAddress(entry);
    ahtml += getEntries(entry);
    //Close results div
    ahtml += "</div>";
}

/**
 * Pretty prints the object entry to the screen
 * @param {Object} entry 
 */
function displayPlace(entry) {
    //Start results div
    let html = "<div class='result'>";
    html += "<h3>" + entry.LocationId + " <span style='color:grey;'>(" + entry.AksloId + ")</span></h3>"
    html += "<span class='dictDef'>" + entry.Source + "</span>";
    html += "<p>Chinese Name: " + entry.ChName + "</p>";
    html += "<p>Korean Name: " + entry.KoName + "</p>";
    html += "<p><a target='_blank' href='" + entry.Link + "'>Link To Map</a></p>";
    //Close results div
    html += "</div>";
    return html;
}

/**
 * Pretty prints the object entry to the screen
 * @param {Object} entry 
 */
function displayBook(entry) {
    //Start results div
    let html = "<div class='result'>";
    html += "<h3>" + entry.BookId + " <span style='color:grey;'>(" + entry.AksbId + ")</span></h3>"
    html += "<span class='dictDef'>" + entry.Source + "</span>";
    html += "<p>Chinese Name: " + entry.ChName + "</p>";
    html += "<p>Korean Name: " + entry.KoName + "</p>";
    html += "<p><a target='_blank' href='" + entry.Link + "'>Link To More Info</a></p>";
    //Close results div
    html += "</div>";
    return html;
}

/**
 * Pretty prints the object entry to the screen
 * @param {Object} entry 
 */
function displayTitle(entry) {
    let sillok = entry.aks_bOfficesofSillok[0];
    //Start results div
    let html = "<div class='result'>";
    html += "<h3>" + sillok.sillokId + " <span style='color:grey;'>(" + entry.AksBOId + ")</span></h3>"
    html += "<span class='dictDef'>" + entry.Source + "</span>";
    html += "<p>Chinese Name: " + entry.ChName + "</p>";
    html += "<p>Korean Name: " + entry.KoName + "</p>";
    html += "<p>Date: " + getSillokDate(sillok) + "&nbsp;<span style='color:grey;'>(" + getKingDate(sillok) + ")</span></p>";
    html += "<p><a target='_blank' href='" + sillok.sillokLink + "'>Sillok Link</a></p>";
    //Close results div
    html += "</div>";
    return html;
}

/**
 * Returns a nicely formatted date from a sillok office object
 * @param {Object} s 
 */
function getSillokDate(s) {
    return pad(s.sillokDay) + "-" + pad(s.sillokMonth) + "-" + s.sillokYear;
}

/**
 * Nicely formats the year of which king date
 * @param {Object} s 
 */
function getKingDate(s) {
    return "year " + s.sillokKingYear + " of " + s.sillokKing;
}

/**
 * If the number is smaller than 10 adds a leading 0
 */
function pad(s) {
    if (s < 10) return "0" + s;
    else return s;
}

/**
 * Nicely formatg the collection object
 * @param {Object} entry 
 */
function getEntries(entry) {
    //If there is nothing in the array, return empty string
    if (entry.aks_Entry.length < 1) return "";
    //Else go through each one and add them to a list
    let list = "Entries: <ol>";
    entry.aks_Entry.forEach(alias => {
        list += "<li>";
        list += alias.RuShiDoor + " (" + alias.RuShiType + ") - " + alias.RuShiYear;
        list += "</li>";
    });
    list += "</ol>";
    return list;
}

/**
 * Returns the livespan as a nice string
 * @param {Object} entry 
 */
function getLiveSpan(entry) {
    let start = entry.YearBirth == null ? "?" : entry.YearBirth;
    let end = entry.YearDeath == null ? "?" : entry.YearDeath;
    return start + " - " + end;
}

/**
 * Adds nicely formatted aliases
 * @param {Object} entry 
 */
function getAliases(entry) {
    //If there is nothing in the array, return empty string
    if (entry.aks_PersonAliases.length < 1) return "";
    //Else go through each one and add them to a list
    let list = "Aliases: <ol>";
    entry.aks_PersonAliases.forEach(alias => {
        list += "<li>";
        list += alias.AliasName + " (" + alias.AliasType + ")";
        list += "</li>";
    });
    list += "</ol>";
    return list;
}

/**
 * Adds nicely formatted adress
 * @param {Object} entry 
 */
function getAddress(entry) {
    //If there is nothing in the array, return empty string
    if (entry.aks_Address.length < 1) return "";
    //Else go through each one and add them to a list
    let list = "Address: <ol>";
    entry.aks_Address.forEach(alias => {
        list += "<li>";
        list += alias.AddrName + " (" + alias.AddrType + ")";
        list += "</li>";
    });
    list += "</ol>";
    return list;
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