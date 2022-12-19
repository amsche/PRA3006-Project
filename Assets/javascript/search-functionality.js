class SPARQLQueryDispatcher { //might make a new document with just this class to make it neater 
    constructor(endpoint) {
        this.endpoint = endpoint;
    }

    query(sparqlQuery) {
        const fullUrl = this.endpoint + '?query=' + encodeURIComponent(sparqlQuery); //method that calls this endpoint and the query term and makes it a 
        //uri
        const headers = { 'Accept': 'application/sparql-results+json' }; //headers: conditions that you give to show what it's (not) allowed to do 
        return fetch(fullUrl, { headers }).then(body => body.json()); 
    }
}

const endpointUrl = 'https://query.wikidata.org/sparql'; //this is the endpointurl
const sparqlQuery = `SELECT ?disease ?diseaseLabel ?symptom ?symptomLabel 
WHERE {
?disease wdt:P31 wd:Q18123741.
?disease wdt:P780 ?symptom. 
SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en" }
}`; //the ?symptom only exists for the query to only return diseases that have symptoms

// Called after query. Used to remove douplicates
function Load(result) {
    var set = new Set()
    for (let i = 0; i < result.results.bindings.length; i++) {
        set.add(result.results.bindings[i].disease.value)
    }

    diseaseIDs = Array.from(set)
    diseases = new Array(diseaseIDs)
    for (let j = 0; j< diseaseIDs.length;j++){ //probably could remove douplicates more efficiently
        for (let i = 0; i < result.results.bindings.length; i++) {
            if(result.results.bindings[i].disease.value === diseaseIDs[j]){
                diseases[j] = { ID: result.results.bindings[i].disease.value, name: result.results.bindings[i].diseaseLabel.value }
            }
        }
    }
    //console.log(diseases)
    return diseases
}

// the actual part that runs the code
async function main() {
    const queryDispatcher = new SPARQLQueryDispatcher(endpointUrl);
    diseases = await queryDispatcher.query(sparqlQuery).then(Load);

    //Adds listener to searchbar
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

    //establishes the rendom button (show example) 
    //@todo does not immediately generate piechart which it really should
    const randomButton = document.getElementById('random')
    randomButton.addEventListener("click", () => {
        let selected = diseases[Math.floor(Math.random() * diseases.length)].name //selects a random disease
        //filters out all other diseases
        setDropdown(diseases.filter(d => {
            return d.name.includes(selected)
        })
        )
    })

    //removes all the entries in the dropdown
    function clearList() {
        document.getElementById("dropdown").innerHTML = ""
        document.getElementById("svg").innerHTML = ""
        document.getElementById("container").innerHTML = ""
        document.getElementById("speechBubbleContainer").innerHTML = ""
    }


    //generates the dropdown menu
    function setDropdown(results) {
        console.log(results)
        if (results.length == 1){
            __init_RPC(results[0].ID.replace("http://www.wikidata.org/entity/", ""))
            setName(results[0].name)
            return
        }
        //creating a selector 
        clearList()
        var dropdown = "<select>"

        //fixes an issue with the first element being unselectable
        if(results&&results.length>0){
            dropdown += "<option value=\""+null +"\">Select your Disease</option>"
        }

        //creates an option for every disease that matches the searchbar input
        for (let i = 0; i < results.length; i++) {
            dropdown += "<option value=\"" +results[i].ID +"," +results[i].name + "\">" + results[i].name + "</option>\n"
        }
        dropdown += "</select>"
        //updates the dropdown in the html
        document.getElementById("dropdown").innerHTML = dropdown

    }
}

// actually runs the code
main()
