// FUNCTIONALITY OF THE SEARCH BAR
// All necessary classes and functions are displayed first.
// The main function can be found at the bottom of the code.



//Class to retreive the results of a SPARQL Query to Wikidata (code downloaded from the WikiData Query Service)
class SPARQLQueryDispatcher {
    constructor(endpoint) {
        this.endpoint = endpoint;
    }

    query(sparqlQuery) {
        const fullUrl = this.endpoint + '?query=' + encodeURIComponent(sparqlQuery);
        const headers = { 'Accept': 'application/sparql-results+json' };
        return fetch(fullUrl, { headers }).then(body => body.json());
    }
}
//Constructing the SPARQL Query as a URL
const endpointUrl = 'https://query.wikidata.org/sparql';
const sparqlQuery = `SELECT ?disease ?diseaseLabel ?symptom ?symptomLabel
WHERE {
?disease wdt:P31 wd:Q18123741.
?disease wdt:P780 ?symptom. 
SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en" }
}`; //the ?symptom only exists for the query to only return diseases that have symptoms



// Removing duplicates (called after the query)
function Load(result) {
    var set = new Set()
    for (let i = 0; i < result.results.bindings.length; i++) {
        set.add(result.results.bindings[i].disease.value)
    }
    diseaseIDs = Array.from(set)
    diseases = new Array(diseaseIDs)
    for (let j = 0; j< diseaseIDs.length;j++){
        for (let i = 0; i < result.results.bindings.length; i++) {
            if(result.results.bindings[i].disease.value === diseaseIDs[j]){
                diseases[j] = { ID: result.results.bindings[i].disease.value, name: result.results.bindings[i].diseaseLabel.value }
            }
        }
    }
    return diseases
}



//Generating the dropdown menu
function setDropdown(results) {
    console.log(results)
    if (results.length == 1){
        __init_RPC(results[0].ID.replace("http://www.wikidata.org/entity/", ""))
        setName(results[0].name)
        return
    }
    clearList()
    var dropdown = "<select>"

    //Fixing an issue of the first element being unselectable
    if(results&&results.length>0){
        dropdown += "<option value=\""+null +"\">Select your Disease</option>"
    }

    //Creating an option for every disease that matches the searchbar input
    for (let i = 0; i < results.length; i++) {
        dropdown += "<option value=\"" +results[i].ID +"," +results[i].name + "\">" + results[i].name + "</option>\n"
    }
    dropdown += "</select>"

    //Updating the dropdown in the html
    document.getElementById("dropdown").innerHTML = dropdown
}



//Removing all the entries in the dropdown
function clearList() {
    document.getElementById("dropdown").innerHTML = ""
    document.getElementById("svg").innerHTML = ""
    document.getElementById("container").innerHTML = ""
    document.getElementById("speechBubbleContainer").innerHTML = ""
}



//MAIN function, manages the search bar
async function main() {

    //Constructing object of query class
    const queryDispatcher = new SPARQLQueryDispatcher(endpointUrl);
    diseases = await queryDispatcher.query(sparqlQuery).then(Load);

    //Adding listener to searchbar
    const searchInput = document.querySelector('.input')
    searchInput.addEventListener("input", (e) => {
        let value = e.target.value

        if (value) { //checks if there is an entered value
            value = value.trim().toLowerCase() 
            //returning only the results to setDropdown if the value of the search is included in the disease's name
            setDropdown(diseases.filter(d => {
                return d.name.includes(value)
            }))
        }
        else {
            clearList()
        }
    })

    //Creating the "Show Example"-button (selects a random infectious disease) 
    const randomButton = document.getElementById('random')
    randomButton.addEventListener("click", () => {
        //selects a random disease
        let selected = diseases[Math.floor(Math.random() * diseases.length)].name 
        //filters out all other diseases
        setDropdown(diseases.filter(d => {
            return d.name.includes(selected)
        })
        )
    })
}


//Running this code
main()