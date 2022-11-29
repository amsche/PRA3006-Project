async function RPC(results) {
    document.getElementById("svg").innerHTML = ""
    var currentIndex = null
    selectedSymptoms = []

    const symptoms = await parser(results)

    // document.getElementById("speechBubbleContainer").innerHTML = `<div id="speech-bubble" class="speech-bubble" ><p>Description:</p>
    // <p>
    //     <div id="symptomDescription" ></div>
    // </p>
    // </div>`

    
    var svg = d3.select("svg"), width = +svg.attr("width"), height = +svg.attr("height"), radius = Math.min(width, height) / 3, g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");


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
        .attr("class", "help")
        .attr("fill", "#C0C0C0")
        .attr("text-anchor", function (d) {
            // are we past the center?
            return (d.endAngle + d.startAngle) / 2 > Math.PI ?
                "end" : "start";
        })

        .on("click", function (d) {
            // The amount we need to rotate:
            var rotate = 90 - (d.startAngle + d.endAngle) / 2 / Math.PI * 180;

            // Transition the pie chart
            g.transition()
                .attr("transform", "translate(" + width / 2 + "," + height / 2 + ") rotate(" + rotate + ")")
                .duration(1000);

            // Τransition the labels:
            text.transition()
                .attr("transform", function (dd) {
                    return "translate(" + label.centroid(dd) + ") rotate(" + (-rotate) + ")";
                })
                .duration(1250);

            // console log

            getInfo(d.data.symName, results);
            currentIndex = d.index
        });

    var text = arc.append("text")
        .attr("transform", function (d) { return "translate(" + label.centroid(d) + ")"; })
        .attr("dy", "0.38em")
        .attr("font-family", "Brandon-Grotesque-Font-Family")
        .text(function (d) { return d.data.symName; });
    
    const selectorbutton = document.getElementById("select")
    selectorbutton.addEventListener("click", () =>{
        if (selectedSymptoms.includes(currentIndex)){
            let index = selectedSymptoms.indexOf(currentIndex)
            if (index > -1){
                selectedSymptoms.splice(index, 1)
            }
        }
        else{
            selectedSymptoms.push(currentIndex)
        }
        console.log(selectedSymptoms)
        changeColour()  
    })
}
selectedSymptoms = []
function changeColour(){
    var color = d3.scaleOrdinal(["#72FFC3", "#72FFE5", "#72E1FF", "#72B6FF", "#728AFF", "#8C72FF"]);
    for(let i = 0; i<document.getElementsByClassName("help").length;i++){
        if (selectedSymptoms.includes(i)){
            d3.select(document.getElementsByClassName("help")[i]).style("fill", color(i))
        }
        else{
            d3.select(document.getElementsByClassName("help")[i]).style("fill", "#C0C0C0")
        }
    }
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
