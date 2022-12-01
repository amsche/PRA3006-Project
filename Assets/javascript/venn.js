async function __init_venn(symptoms) {
    document.getElementById("container").innerHTML = ""
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
    const sparqlQuery = `SELECT ?drug ?drugLabel
                        WHERE {
                        wd:SYMPTOM wdt:P2176 ?drug
                        SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en" }
                        }`;
    result = []
    for (let i in symptoms) {
        var temp = sparqlQuery.replace('SYMPTOM', symptoms[i].ID);
        console.log(temp)
        const queryDispatcher = new SPARQLQueryDispatcher(endpointUrl);
        temp = (await queryDispatcher.query(temp))
        drugs = []
        for (let j in temp.results.bindings) {
            drugs.push(temp.results.bindings[j].drugLabel.value)
        }
        result.push({ symptom: symptoms[i].Name, treatment: drugs, colour: symptoms[i].Colour })
    }
    console.log(result)
    //Next generate the data
    //this part puts all the data into a single array. each treatment is its own element (stored with symptom and colour)
    var alldata = []
    for (let i in result) {
        for (let j in result[i].treatment) {
            alldata.push({
                treatment: result[i].treatment[j],
                symptom: result[i].symptom,
                colour: result[i].colour
            })
        }
    }
    console.log(alldata)

    //this makes all the treatments unique in the array and introduces multimple symptoms it may treat
    var compresseddata = []
    for (let i in alldata) {
        check = true
        for (let j in compresseddata) {
            if (alldata[i].treatment === compresseddata[j].treatment) {
                compresseddata[j].symptom.push(alldata[i].symptom)
                check = false
            }
        }
        if (check) {
            compresseddata.push({
                treatment: alldata[i].treatment,
                symptom: [alldata[i].symptom],
                colour: alldata[i].colour
            })
        }
    }
    console.log(compresseddata)

    function arraysEqual(a, b) {
        if (a === b) return true;
        if (a == null || b == null) return false;
        if (a.length !== b.length) return false;

        a.sort() // be carefull with these if you care about the ordering of your arrays
        b.sort()

        for (var i = 0; i < a.length; ++i) {
            if (a[i] !== b[i]) return false;
        }
        return true;
    }

    //this puts all the treatments that treat the same set of symptoms into an array
    var morecompresseddata = []
    for (let i in compresseddata) {
        check = true
        for (let j in morecompresseddata) {
            if (arraysEqual(compresseddata[i].symptom, morecompresseddata[j].symptom)) {
                morecompresseddata[j].treatment.push(compresseddata[i].treatment)
                check = false
            }
        }
        if (check) {
            morecompresseddata.push({
                treatment: [compresseddata[i].treatment],
                symptom: compresseddata[i].symptom,
                colour: compresseddata[i].colour
            })
        }
    }
    console.log(morecompresseddata)
    // congratulations the data is nearly in the right format for the venn diagram
    var data = []
    for(let i in morecompresseddata){
        data.push({
            x: morecompresseddata[i].symptom,
            value: 15*morecompresseddata[i].treatment.length+25,
            name: "Drugs to cure \n" + morecompresseddata[i].symptom,
            custom_field: morecompresseddata[i].treatment,
            normal: { fill: morecompresseddata[i].color }, 
        })
    }
    //make the chart
    anychart.onDocumentReady(function () {
        // var data = [
        //     {
        //         x: "A",
        //         value: 100,
        //         name: "Drugs to cure \nSymptom 1",
        //         custom_field: "Drug 1 \nDrug 2 \n Drug 3",
        //         normal: { fill: "#7EE5B1 0.7" },
        //     },
        //     {
        //         x: "B",
        //         value: 100,
        //         name: "Drugs to cure \nSymptom 2",
        //         custom_field: "Drug 4 \nDrug 5 \n Drug 6",
        //         normal: { fill: "#72B6FF 0.7" }
        //     },
        //     {
        //         x: ["A", "B"],
        //         value: 25,
        //         name: "Drugs to cure \nSymptoms 1&2",
        //         custom_field: "Drug 12 \nDrug 13"
        //     }
        // ];
        var chart = anychart.venn(data);
        chart.container("container");
        chart.draw();
        chart.labels().format("{%custom_field}");
        chart.stroke('1 #fff');
        chart.legend(false);
        chart.tooltip(false);
    });

}
