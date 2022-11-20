class SPARQLQueryDispatcher {
    constructor( endpoint ) {
        this.endpoint = endpoint;
    }
    async query( sparqlQuery ) {
        const fullUrl = this.endpoint + '?query=' + encodeURIComponent( sparqlQuery );
        const headers = { 'Accept': 'application/sparql-results+json' };
        const body = await fetch(fullUrl, { headers });//should get the data, but just crashes with "Access to fetch at [fullUrl] from origin has been blocked by CORS policy"
      return await body.json();
    }
  }

  async function runQuery(query) {
    const endpointUrl = 'http://linkedlifedata.com/sparq'; //this is the endpoint of linked life data I believe, kept outside class incase we need data from 2 different endpoints
    let queryDispatcher = new SPARQLQueryDispatcher(endpointUrl); //kinda dumb to create the same object everytime the method is run, but should only be used rarely on site so irrelevant
    let response = await queryDispatcher.query(query);
    console.table(response)
    return response
  }

//Simple query to test the importing
const query =  `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                PREFIX sider: <http://linkedlifedata.com/resource/sider/>
                PREFIX sider-drugs: <http://linkedlifedata.com/resource/sider/drug/>
                SELECT ?drugname 
                WHERE{
                    ?drug rdf:type sider:Drug.
                    ?drug sider-drugs:drugName ?drugname.
                }`

runQuery(query)