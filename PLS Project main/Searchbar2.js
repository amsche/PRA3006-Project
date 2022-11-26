class SPARQLQueryDispatcher {
    constructor( endpoint ) {
        this.endpoint = endpoint;
    }

    query( sparqlQuery ) {
        const fullUrl = this.endpoint + '?query=' + encodeURIComponent( sparqlQuery );
        const headers = { 'Accept': 'application/sparql-results+json' };
        return fetch( fullUrl, { headers } ).then( body => body.json() );
    }
}

const endpointUrl = 'https://query.wikidata.org/sparql';
const sparqlQuery = `SELECT ?disease ?diseaseLabel 
                    WHERE {
                    ?disease wdt:P31 wd:Q18123741.
                    SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en" }
                    }`;
function render(result){
    var diseases = new Set()
    for (let i = 0; i < result.results.bindings.length; i++){
        diseases.add({ ID: result.results.bindings[i].disease.value, name: result.results.bindings[i].diseaseLabel.value})
    }
    return Array.from(diseases)

}
async function main(){const queryDispatcher = new SPARQLQueryDispatcher( endpointUrl );
diseases = await queryDispatcher.query( sparqlQuery ).then(render);

const searchInput = document.querySelector('.input')
searchInput.addEventListener("input", (e) => {
    let value = e.target.value

    if (value){
        value = value.trim().toLowerCase()
        //returning only the results of setDropdown if the value of the search is included in the d's name
        setDropdown(diseases.filter(d => {
            return d.name.includes(value)
        }))}
    else{
        clearList()
    }
})
const clearButton = document.getElementById('clear')

clearButton.addEventListener("click", () => {
    clearList()
})
const randomButton = document.getElementById('random')

randomButton.addEventListener("click", () => {
    let selected = diseases[Math.floor(Math.random()*diseases.length)].name
    //returning only the results of setDropdown if the value of the search is included in the d's name
    setDropdown(diseases.filter(d => {
        return d.name.includes(selected)})
)})

function clearList(){
    // looping through each child of the search results list and remove each child
    document.getElementById("dropdown").innerHTML=""
    }



function setDropdown(results){
    clearList()
    var dropdown = "<select>"
    for (let i = 0; i<results.length;i++){
        dropdown += "<option value=\"" + results[i].ID + "\">"+results[i].name+"</option>"
    }
    dropdown+="</select>"
    document.getElementById("dropdown").innerHTML=dropdown

}}
main()