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

const endpointUrl = 'https://query.wikidata.org/sparql';
const sparqlQuery = `SELECT ?disease ?diseaseLabel ?symptom ?symptomLabel
WHERE {
?disease wdt:P31 wd:Q18123741.
?disease wdt:P780 ?symptom.
SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en" }
}`;
function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }
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
    console.log(diseases)
    return diseases
}
async function main() {
    const queryDispatcher = new SPARQLQueryDispatcher(endpointUrl);
    diseases = await queryDispatcher.query(sparqlQuery).then(Load);
    const searchInput = document.querySelector('.input')
    searchInput.addEventListener("input", (e) => {
        let value = e.target.value

        if (value) {
            value = value.trim().toLowerCase()
            //returning only the results of setDropdown if the value of the search is included in the d's name
            setDropdown(diseases.filter(d => {
                return d.name.includes(value)
            }))
        }
        else {
            clearList()
        }
    })
    const clearButton = document.getElementById('clear')

    clearButton.addEventListener("click", () => {
        clearList()
    })
    const randomButton = document.getElementById('random')

    randomButton.addEventListener("click", () => {
        let selected = diseases[Math.floor(Math.random() * diseases.length)].name
        //returning only the results of setDropdown if the value of the search is included in the d's name
        setDropdown(diseases.filter(d => {
            return d.name.includes(selected)
        })
        )
    })

    function clearList() {
        // looping through each child of the search results list and remove each child
        document.getElementById("dropdown").innerHTML = ""
    }



    function setDropdown(results) {
        clearList()
        var dropdown = "<select>"
        for (let i = 0; i < results.length; i++) {
            dropdown += "<option value=\"" + results[i].ID + "\">" + results[i].name + "</option>"
        }
        dropdown += "</select>"
        document.getElementById("dropdown").innerHTML = dropdown

    }
}
main()