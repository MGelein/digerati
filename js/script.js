/**
 * Holds the GET variables
 */
var GET = { output: 'html' };

const NAME = 'koreanperson';
const PLACE = 'koreanplace';
const SILLOK = 'koreansillokoffice';
const BOOK = 'koreanbook';
const RANK = 'koreanofficerrank';
const POST = 'koreanofficerpost';
const OFFICE = 'koreanofficeroffice';

init();

/**
 * Called once the document has been initialized
 */
function init() {
    parseURLVars();
    //Check if we are passing by query or id
    console.log("Starting query...");

    if (GET.id != undefined) {
        //See if we have to do this multiple times
        if (GET.id.indexOf('|')) {
            //Split by delimiter
            let ids = GET.id.split('|');
            //Lookup every one of the id's
            ids.forEach(id => {
                //Briefly assign this id to the GET variable
                GET.id = id;
                //Normalize mode
                normalizeMode();
                //Lookup the constructed url
                lookup(constructUrl(), GET.m);
            });
        } else {//Single ID lookup
            //Normalize mode
            normalizeMode();
            //Lookup the constructed url
            lookup(constructUrl(), GET.m);
        }
    } else if (GET.q != undefined) {
        //Do a lookup for the term for every mode option
        GET.m = NAME;
        lookup(constructUrl(), NAME);
        GET.m = PLACE;
        lookup(constructUrl(), PLACE);
        GET.m = BOOK;
        lookup(constructUrl(), BOOK)
        GET.m = OFFICE;
        lookup(constructUrl(), OFFICE);
        GET.m = RANK;
        lookup(constructUrl(), RANK);
        GET.m = POST;
        lookup(constructUrl(), POST);
        GET.m = SILLOK;
        lookup(constructUrl(), SILLOK);
    }
}

/**
 * Make the API work with different aliases for the modes
 */
function normalizeMode() {
    //Check the mode depending on the ID input
    let id = GET.id.toLowerCase().trim();
    //Retrieve the mode part
    GET.m = id.substring(0, id.indexOf('_'));
    if ([NAME, PLACE, BOOK, SILLOK, RANK, POST, OFFICE].indexOf(GET.m) == -1) {
        console.log("WARNING!!!!");
        console.log("Unrecognized method: " + GET.m);
        console.log("WARNING!!!!");
    }
    //Also normalize the id
    GET.id = GET.id.substring(GET.id.indexOf('_') + 1);
}

/**
 * Returns a boolean if a substring is in that provided string
 * @param {String} s 
 * @param {String} c 
 */
function contains(s, c) {
    return (s.indexOf(c) == 0);
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
    if (mode == NAME) return "85/api/";
    else if (mode == BOOK) return "86/api/";
    else if (mode == PLACE) return "88/api/";
    else if (mode == SILLOK) return "89/api/";
    else if (mode == RANK) return "92/api/";
    else if (mode == POST) return "90/api/";
    else if (mode == OFFICE) return "91/api/";
}

/**
 * Starts the lookup using the provided url to fetch data
 * @param {String} urlVar 
 * @param {String} mode 
 */
function lookup(urlVar, mode) {
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
            console.log("Response from: " + urlVar);
            console.log(response);
            start(response, mode);
        },
        error: function (xhr, status) {
            console.log("error in data request");
        }
    });
}

/**
 * Entry point of the code, takes JSON data as the parameter, will then visualize it nicely
 */
function start(data, mode) {
    //For each of the entry points in the data set, show a results div
    let html = "";
    data.forEach(entry => {
        switch (mode) {
            case NAME:
                html += displayPerson(entry);
                break;
            case PLACE:
                html += displayPlace(entry);
                break;
            case SILLOK:
                html += displaySillokOffice(entry);
                break;
            case BOOK:
                html += displayBook(entry);
                break;
            case RANK:
                html += displayRank(entry);
                break;
            case OFFICE:
                html += displayOffice(entry);
                break;
            case POST:
                html += displayPost(entry);
                break;
        }
    });
    if (html.trim().length > 1) {
        $('#' + mode).fadeIn().append(html);
    }
}

/**
 * Pretty prints the object entry to the screen
 * @param {Object} entry 
 */
function displayPerson(entry) {
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
    return ahtml;
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
 * Displays a rank query entry
 * @param {Object} entry 
 */
function displayRank(entry) {
    //Start results div
    let html = "<div class='result'>";
    html += "<h3>" + entry.AksograId + "</h3>"
    html += "<span class='dictDef'>" + entry.Source + "</span>";
    html += "<p>Chinese Name: " + entry.ChName + "</p>";
    html += "<p>Korean Name: " + entry.KoName + "</p>";
    let opt1 = entry.OfficePostType1;
    if(opt1 != null) html+= "<p>Office Post Type 1: " + opt1 +"</p>";
    let opt2 = entry.OfficePostType2;
    if(opt2 != null) html += "<p>Office Post Type 2: " + opt2 + "</p>";
    let ort1 = entry.OfficeRankType1;
    if(ort1 != null) html += "<p>Office Rank Type 1: " + ort1 + "</p>";
    let ort2 = entry.OfficeRankType2;
    if(ort2 != null) html += "<p>Office Rank Type 2: " + ort2 + "</p>";
    html += "<p><a target='_blank' href='" + entry.Link + "'>Sillok Wiki</a></p>";
    //Close results div
    html += "</div>";
    return html;
}

/**
 * Displays a post query entry
 * @param {Object} entry 
 */
function displayPost(entry) {
    //Start results div
    let html = "<div class='result'>";
    html += "<h3>" + entry.AksoffId + "</h3>";
    html += "<span class='dictDef'>" + entry.Source + "</span>";
    html += "<p>Chinese Name: " + entry.ChName + "</p>";
    html += "<p>Korean Name: " + entry.KoName + "</p>";
    html += "<p><a target='_blank' href='" + entry.Link + "'>Sillok Wiki</a></p>";
    let details = entry.aks_OfficesToOfficePost;
    details.forEach(detail => {
        html += "<p><b>Aks Post ID: " + detail.aksopId + "</b></p>";
        html += "<p>Post Chinese Name: " + detail.OPChName + "</p>";
        html += "<p>Post Korean Name: " + detail.OPKoName + "</p>";
        html += "<p>Office Rank Type: " + detail.OfficeRankType + "</p>";
        html += "<p>Office Post Type: " + detail.OfficePostType + "</p>";
        html += "<p>Office Position: " + detail.OfficePositionCentralLocal + " " + detail.OfficePositionTypeEastWest + "</p>"
        html += "<p><a target='_blank' href='" + detail.OfficePostLink + "'>Post Link</a></p>";
    });
    //Close results div
    html += "</div>";
    return html;
}

/**
 * Displays a post query entry
 * @param {Object} entry 
 */
function displayOffice(entry) {
    //Start results div
    let html = "<div class='result'>";
    html += "<h3>" + entry.AksopId + "</h3>";
    html += "<span class='dictDef'>" + entry.Source + "</span>";
    html += "<p>Chinese Name: " + entry.ChName + "</p>";
    html += "<p>Korean Name: " + entry.KoName + "</p>";
    html += "<p><a target='_blank' href='" + entry.Link + "'>Sillok Wiki</a></p>";
    let details = entry.aks_OfficePostToOffice;
    details.forEach(detail => {
        html += "<p><b>Aks Office ID: " + detail.AksoffId + "<span style='color:grey;'>&nbsp;(" + detail.AksopId + ")</span></b></p>";
        html += "<p>Office Chinese Name: " + detail.OffChName + "</p>";
        html += "<p>Office Korean Name: " + detail.OffKoName + "</p>";
        html += "<p>Office Type: " + detail.OfficeType + "</p>";
        html += "<p>Office Rank Type: " + detail.OfficeRankType + "</p>";
        html += "<p>Office Post Type: " + detail.OfficePostType + "</p>";
        html += "<p>Office Position: " + detail.OfficePositionCentralLocal + " " + detail.OfficePositionTypeEastWest + "</p>"
        html += "<p><a target='_blank' href='" + detail.OfficeLink + "'>Office Link</a></p>";
    });
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
    let details = entry.aks_BooksDetails;
    let html = "<div class='result'>";
    html += "<h3>" + entry.ChName + " <span style='color:grey;'>(" + entry.KoName + ")</span></h3>";
    //Now go through every book separately
    details.forEach(function (book) {
        html += "<p><b>ID: " + book.BookId + "</b></p>";
        html += "<span class='dictDef'>" + book.Source + "</span>";
        html += "<p>Holding Institution: " + book.HoldingInstitution + "</p>";
        html += "<p>Publication Date: " + book.PublicationTime + "</p>";
        html += "<p><a target='_blank' href='" + book.Link + "'>Link To More Info</a></p>";
    });
    //Close results div
    html += "</div>";
    return html;
}

/**
 * Pretty prints the object entry to the screen
 * @param {Object} entry 
 */
function displaySillokOffice(entry) {
    //Start results div
    let html = "<div class='result'>";
    html += "<h3>" + entry.AksBOId + "</h3>";
    html += "<span class='dictDef'>" + entry.Source + "</span>";
    html += "<p>Chinese Name: " + entry.ChName + "</p>";
    html += "<p>Korean Name: " + entry.KoName + "</p>";
    //Go through all sillok entries
    entry.aks_bOfficesofSillok.forEach(function (sillok) {
        html += "<h4>" + sillok.sillokId + "</h4>";
        html += "<p>Date: " + getSillokDate(sillok) + "&nbsp;<span style='color:grey;'>(" + getKingDate(sillok) + ")</span></p>";
        html += "<p><a target='_blank' href='" + sillok.sillokLink + "'>Sillok Link</a></p>";
    });
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
    //Iterate over the pairs, log them all in the object
    pairs.forEach(function (pair) {
        let parts = pair.split('=');
        GET[decodeURI(parts[0]).trim()] = decodeURI(parts[1].trim());
    });
}