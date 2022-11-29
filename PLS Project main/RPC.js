async function RPC(results) {
    const symptoms = await parser(results)

    var svg = d3.select("svg"), width = +svg.attr("width"), height = +svg.attr("height"), radius = Math.min(width, height) / 3, g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var color = d3.scaleOrdinal(["#C0C0C0", "#C0C0C0", "#C0C0C0", "#C0C0C0", "#C0C0C0", "#C0C0C0"]);

    var data = new Array(symptoms.length);
    for (let i = 0; i < symptoms.length; i++) {
        data[i] = { symName: symptoms[i], frequency: 1 }
    }




    var pie = d3.pie()
        .sort(null)
        .value(function (d) { return d.frequency; });

    var path = d3.arc()
        .outerRadius(radius - 10)
        .innerRadius(0);

    var label = d3.arc()
        .outerRadius(radius - 50)
        .innerRadius(radius - 50);

    var arc = g.selectAll(".arc")
        .data(pie(data))
        .enter().append("g")
        .attr("class", "arc");



    arc.append("path")
        .attr("d", path)
        .attr("fill", function (d) {
            return color(d.data.symName);
        })
        .attr("text-anchor", function (d) {
            // are we past the center?
            return (d.endAngle + d.startAngle) / 2 > Math.PI ?
                "end" : "start";
        })

        .on("click", function (d) {
            // The amount we need to rotate:
            var rotate = 90 - (d.startAngle + d.endAngle) / 2 / Math.PI * 180;
            var color = "#000000";

            // Transition the pie chart
            g.transition()
                .attr("transform", "translate(" + width / 2 + "," + height / 2 + ") rotate(" + rotate + ")")
                .duration(1000);

            // Τransition the labels:
            text.transition()
                .attr("transform", function (dd) {
                    return "translate(" + label.centroid(dd) + ") rotate(" + (-rotate) + ")";
                })
                .duration(1000);

            // console log 
            getInfo(d.data.symName, results);
        });

    var text = arc.append("text")
        .attr("transform", function (d) { return "translate(" + label.centroid(d) + ")"; })
        .attr("dy", "0.38em")
        .attr("font-family", "Brandon-Grotesque-Font-Family")
        .text(function (d) { return d.data.symName; });
}
async function parser(results) {
    console.log(results.results.bindings)
    var symptoms = new Set
    for (let i = 0; i < await results.results.bindings.length; i++) {
        symptoms.add(results.results.bindings[i].symptomLabel.value)
    }
    symptoms = Array.from(symptoms)
    return symptoms
}
async function query2(diseaseEntered) {
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
    var sparqlQuery = `SELECT ?symptom ?symptomLabel ?symptomDescription
                    WHERE {
                    wd:DISEASE wdt:P780 ?symptom.
                    SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en" }
                    }`;
    sparqlQuery = sparqlQuery.replaceAll('DISEASE', diseaseEntered);

    const queryDispatcher = new SPARQLQueryDispatcher(endpointUrl);
    return queryDispatcher.query(sparqlQuery);
}
async function main(diseaseEntered) {
    result = await query2(diseaseEntered)
    RPC(result)
}
const selected = document.querySelector('.selector')
selected.addEventListener("input", (e) => {
    var value = e.target.value
    value = value.replace("http://www.wikidata.org/entity/", "")

    main(value)
})

async function getInfo(symptom, results){

    for (let i = 0; i < await results.results.bindings.length; i++) {
        if (symptom ===results.results.bindings[i].symptomLabel.value){
            symptom = results.results.bindings[i]
            break
        }
    }
    document.getElementById("symptomDescription").innerHTML = symptom.symptomDescription.value
    console.log(symptom.symptomDescription.value)
}