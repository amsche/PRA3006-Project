async function __init_venn(symptoms){
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
    const sparqlQuery = `SELECT ?drug ?drugLabel
                        WHERE {
                        wd:SYMPTOM wdt:P2176 ?drug
                        SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en" }
                        }`;
    result = []
    for(let i in symptoms){
        var temp = sparqlQuery.replace('SYMPTOM', symptoms[i].ID);
        console.log(temp)
        const queryDispatcher = new SPARQLQueryDispatcher( endpointUrl );
        temp = (await queryDispatcher.query( temp ))
        drugs = []
        for (let j in temp.results.bindings){
            drugs.push(temp.results.bindings[j].drugLabel.value)
        }
        result.push({symptom: symptoms[i].Name, treatment: drugs, color: symptoms[i].Colour})
    }
    console.log(result)

    anychart.onDocumentReady(function () {
        var data = [
            {x: "A",
            value: 100,
            name: "Drugs to cure \nSymptom 1",
            custom_field: "Drug 1 \nDrug 2 \n Drug 3",
            normal: {fill: "#7EE5B1 0.7"},},
            {x: "B",
            value: 100,
            name: "Drugs to cure \nSymptom 2",
            custom_field: "Drug 4 \nDrug 5 \n Drug 6",
            normal: {fill: "#72B6FF 0.7"}},
            {x: ["A", "B"],
            value: 25,
            name: "Drugs to cure \nSymptoms 1&2",
            custom_field: "Drug 12 \nDrug 13"}
        ];
        var chart = anychart.venn(data);
        chart.container("container");
        chart.draw();
        chart.labels().format("{%custom_field}");
        chart.stroke('1 #fff');
        chart.legend(false);
        chart.tooltip(false);
    });
    
}
