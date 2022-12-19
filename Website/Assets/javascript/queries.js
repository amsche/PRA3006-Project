class SPARQLQueryDispatcher {
    constructor(endpoint) {
        this.endpoint = endpoint;
    }

    query(sparqlQuery) {
        const fullUrl = this.endpoint + '?query=' + encodeURIComponent(sparqlQuery); //method that calls this endpoint and the query term and makes it a uri
        const headers = { 'Accept': 'application/sparql-results+json' }; //headers: conditions that you give to show what it's (not) allowed to do 
        return fetch(fullUrl, { headers }).then(body => body.json());
    }
}

const wikidataURL = 'https://query.wikidata.org/sparql';
const wikidataDispatcher = new SPARQLQueryDispatcher(wikidataURL);

async function __diseasesQuery(){
    const sparqlQuery =`SELECT ?disease ?diseaseLabel ?symptom ?symptomLabel
                        WHERE {
                            ?disease wdt:P31 wd:Q18123741.
                            ?disease wdt:P780 ?symptom. 
                            SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en" }
                        }`; //the ?symptom only exists for the query to only return diseases that have symptoms
    return wikidataDispatcher.query(sparqlQuery)
}

async function __symptomsQuery(diseaseEntered){
    var sparqlQuery = `SELECT ?symptom ?symptomLabel ?symptomDescription
                    WHERE {
                    wd:DISEASE wdt:P780 ?symptom.
                    SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en" }
                    }`;
    sparqlQuery = sparqlQuery.replaceAll('DISEASE', diseaseEntered); //allows us to find a specific diseases symptoms

    return wikidataDispatcher.query(sparqlQuery);
}
async function __treatmentsQuery(symptoms){
    const sparqlQuery = `SELECT ?drug ?drugLabel
                        WHERE {
                        wd:SYMPTOM wdt:P2176 ?drug
                        SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en" }
                        }`;
    // Retrieving and storing them in an array, go through each symptom and for each symptom we create an array named drugs, insert it into an object, and
    //then insert it into a result array 
    //call a bunch of querries for all the symptoms selected 
    result = []
    for (let i in symptoms) {
        query = sparqlQuery.replace('SYMPTOM', symptoms[i].ID);
        queryResults = await wikidataDispatcher.query(query)
        drugs = []
        for (let j in queryResults.results.bindings) {
            drugs.push(capitalizeFirstLetter(queryResults.results.bindings[j].drugLabel.value))
        }
        result.push({ symptom: capitalizeFirstLetter(symptoms[i].Name), treatment: drugs, colour: symptoms[i].Colour })
    }
    return result
}
