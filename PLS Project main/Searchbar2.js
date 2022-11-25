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
const sparqlQuery = `SELECT ?disease ?diseaseLabel ?symptom ?symptomLabel
                    WHERE {
                    ?disease wdt:P31 wd:Q18123741.
                    ?disease wdt:P780 ?symptom.
                    SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en" }
                    }`;
function render(result){
    var dropdown = "<select>"
    console.log(result.results.bindings[0])
    var diseases = new Set()
    for (let i = 0; i < result.results.bindings.length; i++){
        diseases.add("<option value=\"" + result.results.bindings[i].disease.value + "\">"+result.results.bindings[i].diseaseLabel.value+"</option>")
    }
    diseases = Array.from(diseases).sort()
    for (let i = 0; i < diseases.length; i++){
        // console.log(result.results.bindings[i].diseaseLabel.value)
        dropdown += diseases[i]
    }
    dropdown+="</select>"
    document.getElementById("dropdown").innerHTML=dropdown
}
const queryDispatcher = new SPARQLQueryDispatcher( endpointUrl );
result =  queryDispatcher.query( sparqlQuery ).then(render);
//console.log(result)
// const diseases = result[0]
// console.log(diseases)
const diseases = [
    { name: 'adri'},
    { name: 'becky'},
    { name: 'chris'},
    { name: 'dillon'},
    { name: 'evan'},
    { name: 'frank'},
    { name: 'georgette'},
    { name: 'hugh'},
    { name: 'igor'},
    { name: 'jacoby'},
    { name: 'kristina'},
    { name: 'lemony'},
    { name: 'matilda'},
    { name: 'nile'},
    { name: 'ophelia'},
    { name: 'patrick'},
    { name: 'quincy'},
    { name: 'roslyn'},
    { name: 'solene'},
    { name: 'timothy'},
    { name: 'uff'},
    { name: 'violet'},
    { name: 'wyatt'},
    { name: 'x'},
    { name: 'yadri'},
    { name: 'zack'},
]
const searchInput = document.querySelector('.input')
searchInput.addEventListener("input", (e) => {
    let value = e.target.value

    if (value && value.trim().length > 2){
         value = value.trim().toLowerCase()

        //returning only the results of setList if the value of the search is included in the d's name
        setList(diseases.filter(d => {
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
    //returning only the results of setList if the value of the search is included in the d's name
    setList(diseases.filter(d => {
        return d.name.includes(selected)})
)})

function clearList(){
    // looping through each child of the search results list and remove each child
    while (list.firstChild){
        list.removeChild(list.firstChild)
    }
}

function noResults(){
    // create an element for the error; a list item ("li")
    const error = document.createElement('li')
    // adding a class name of "error-message" to our error element
    error.classList.add('error-message')

    // creating text for our element
    const text = document.createTextNode('No results found. Sorry!')
    // appending the text to our element
    error.appendChild(text)
    // appending the error to our list element
    list.appendChild(error)
}
function setList(results){
    clearList()
    for (const d of results){
        const resultItem = document.createElement('li')
        resultItem.classList.add('result-item')
        const text = document.createTextNode(d.name)
        resultItem.appendChild(text)
        list.appendChild(resultItem)
    }

    if (results.length === 0 ){
        noResults()
    }
}