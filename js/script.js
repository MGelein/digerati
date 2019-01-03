/**
 * Holds the GET variables
 */
var GET = { output: 'html' };
parseURLVars();
//Immediately pass on the GET variable to the proxy
fetch('get.php?id=' + GET.id)
  .then(function(response) {
    return response.json();
  })
  .then(function(json) {
    start(json);
  });
/**
 * Entry point of the code, takes JSON data as the parameter, will then visualize it nicely
 */
function start(data){
    //For each of the entry points in the data set, show a results div
    let html = "";
    data.forEach(entry =>{
        //Start results div
        html += "<div class='result'>";
        html += "<h3>" + entry.PersonId + " <span style='color:grey;'>(" + entry.AkspId + ")</span></h3>"
        html += "<span class='dictDef'>" + entry.Source + "</span>";
        html += "<p>Chinese Name: " + entry.ChName + "</p>";
        html += "<p>Korean Name: " + entry.KoName + "</p>";
        html += "<p>Gender: " + (entry.Gender == 1 ? "Male" : "Female") + "</p>";
        html += "<p>Lived:  " + getLiveSpan(entry) +"</p>";
        html += getAliases(entry);
        html += getAddress(entry);
        html += getEntries(entry);
        //Close results div
        html += "</div>";
    });
    document.body.innerHTML = html;
}

/**
 * Nicely formatg the collection object
 * @param {Object} entry 
 */
function getEntries(entry){
    //If there is nothing in the array, return empty string
    if(entry.aks_Entry.length < 1) return "";
    //Else go through each one and add them to a list
    let list = "Entries: <ol>";
    entry.aks_Entry.forEach(alias =>{
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
function getLiveSpan(entry){
    let start = entry.YearBirth == null ? "?" : entry.YearBirth;
    let end = entry.YearDeath == null ? "?" : entry.YearDeath;
    return start + " - " + end;
}

/**
 * Adds nicely formatted aliases
 * @param {Object} entry 
 */
function getAliases(entry){
    //If there is nothing in the array, return empty string
    if(entry.aks_PersonAliases.length < 1) return "";
    //Else go through each one and add them to a list
    let list = "Aliases: <ol>";
    entry.aks_PersonAliases.forEach(alias =>{
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
function getAddress(entry){
    //If there is nothing in the array, return empty string
    if(entry.aks_Address.length < 1) return "";
    //Else go through each one and add them to a list
    let list = "Address: <ol>";
    entry.aks_Address.forEach(alias =>{
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