query1();
            
async function query1() {
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

const queryDispatcher = new SPARQLQueryDispatcher( endpointUrl );
queryDispatcher.query( sparqlQuery ).then( console.log );
}






query2();

async function query2() {
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
const diseaseEntered = 'A';
const endpointUrl = 'https://query.wikidata.org/sparql';
const sparqlQuery = `SELECT ?symptom ?symptomLabel ?symptomDescription
                    WHERE {
                    wd:DISEASE wdt:P780 ?symptom.
                    SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en" }
                    }`;
sparqlQuery.replace('DISEASE', diseaseEntered);

const queryDispatcher = new SPARQLQueryDispatcher( endpointUrl );
queryDispatcher.query( sparqlQuery ).then( console.log );
}






query3();

async function query3 () {
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
const symptomClicked = 'A';
const endpointUrl = 'https://query.wikidata.org/sparql';
const sparqlQuery = `SELECT ?drug ?drugLabel
                    WHERE {
                    wd:SYMPTOM wdt:P2176 ?drug
                    SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en" }
                    }`;
sparqlQuery.replace('SYMPTOM', symptomClicked);

const queryDispatcher = new SPARQLQueryDispatcher( endpointUrl );
queryDispatcher.query( sparqlQuery ).then( console.log );
}