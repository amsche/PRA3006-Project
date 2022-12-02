// import { __init_venn} from "./venn.js";
//generates the RPC
async function RPC(results) {
    // below is book keeping to ensure the data is clean before now constructions occur
    document.getElementById("svg").innerHTML = ""
    document.getElementById("container").innerHTML = ""
    document.getElementById("speechBubbleContainer").innerHTML = ""

    var currentIndex = null
    selectedSymptoms = []

    //uses the results to get purely the symptom IDs as this is easier to work with
    const symptoms = await parser(results)

    //creates the speech bubble for the description and the select button
    document.getElementById("speechBubbleContainer").innerHTML = `<div id="speech-bubble" class="speech-bubble" ><p>Description:</p>
    <p>
        <div id="symptomDescription" ></div>
    </p>
    </div>
    <button id="select">Select</button>
    `

    //establishes values needed for the creation of the RPC i.e the area available 
    var svg = d3.select("svg"), width = +svg.attr("width"), height = +svg.attr("height"), radius = Math.min(width, height)/2, g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    //creates an array with the data in the format that the RPC is used to
    var data = new Array(symptoms.length);
    for (let i = 0; i < symptoms.length; i++) {
        data[i] = { symName: symptoms[i], frequency: 1 }
    }


    //WARNING following section contains a lot of incomprehensible variable names. It was copied hope for change
    // creates the parts needed for the RPC
    var pie = d3.pie()
        .sort(null)
        .value(function (d) { return d.frequency; });

    var path = d3.arc()
        .outerRadius(radius - 10)
        .innerRadius(0);

    var label = d3.arc()
        .outerRadius(radius - 50)//these values/offsets determine the locations of the lables
        .innerRadius(radius - 50);

    var arc = g.selectAll(".arc")
        .data(pie(data))
        .enter().append("g")
        .attr("class", "arc");


    //most edited part of the code from the d3 collection
    arc.append("path")
        .attr("d", path)
        .attr("class", "help")//gives the arc area a class so its colour can be changed later
        .attr("fill", "#C0C0C0")//gives the arc areas a standard colour
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

            // book keeping
            getInfo(d.data.symName, results);
            currentIndex = d.index
        });
    //again just copied from the collection
    var text = arc.append("text")
        .attr("class", "arcText")
        .attr("transform", function (d) { return "translate(" + label.centroid(d) + ")"; })
        .attr("dy", "0.38em")
        .text(function (d) { return d.data.symName; });

    //establishes the select button
    const selectorbutton = document.getElementById("select")
    selectorbutton.addEventListener("click", () => {
        if (selectedSymptoms.includes(currentIndex)) { //checks if the current index (section on right) is selected
            let index = selectedSymptoms.indexOf(currentIndex)
            if (index > -1) {
                selectedSymptoms.splice(index, 1)//if true removes it from the array of selected symptoms
            }
        }
        else {
            selectedSymptoms.push(currentIndex)//otherwise adds it to the array
        }
        //console.log(selectedSymptoms)
        changeColour()  //then updates the colours 
        if (selectedSymptoms.length > 0) {
            constructVenn(results)
        }
        else{
            document.getElementById("container").innerHTML = ""
        }
    })
}

selectedSymptoms = [] //sorry for the spagetti code this should be somewhere else @todo
var color = d3.scaleOrdinal(["#72FFC3", "#72FFE5", "#72E1FF", "#72B6FF", "#728AFF", "#8C72FF"]);
//changes the colour of each element with the help (needs to change) class
function changeColour() {
    //creates a colour space according to our specifications (mint green to purple)
    for (let i = 0; i < document.getElementsByClassName("help").length; i++) { //loops through each element with help class
        if (selectedSymptoms.includes(i)) { //if included fills it a colour
            d3.select(document.getElementsByClassName("help")[i]).style("fill", color(i))
        }
        else { //else colours it the default colour
            d3.select(document.getElementsByClassName("help")[i]).style("fill", "#C0C0C0")
        }
    }
}

//takes the results of the query and converts them to just the names of the symptoms so it can be
//used easily in the RPC
async function parser(results) {
    //console.log(results.results.bindings)
    var symptoms = new Set //new set to make sure everything is unique
    for (let i = 0; i < await results.results.bindings.length; i++) {
        symptoms.add((capitalizeFirstLetter(results.results.bindings[i].symptomLabel.value)))
    }
    return Array.from(symptoms)
}

//query from wikidata
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
    sparqlQuery = sparqlQuery.replaceAll('DISEASE', diseaseEntered); //allows us to find a specific diseases symptoms

    const queryDispatcher = new SPARQLQueryDispatcher(endpointUrl);
    return queryDispatcher.query(sparqlQuery);
}

//seperate function due to the async nature of the entire code
async function __init_RPC(diseaseEntered) {
    result = await query2(diseaseEntered)
    RPC(result)
}

//creates an eventlistener for the dropdown menu for diseases uses the input as the entered diseas for the query
const selected = document.querySelector('.selector')
selected.addEventListener("input", (e) => {
    var value = e.target.value.split(",")[0]
    value = value.replace("http://www.wikidata.org/entity/", "")
    setName ( e.target.value.split(",")[1])
    __init_RPC(value)
})

// takes a symptom name and the results object to produce the symptom descripion
async function getInfo(symptom, results) {

    for (let i = 0; i < await results.results.bindings.length; i++) {
        if (symptom === results.results.bindings[i].symptomLabel.value) {
            symptom = results.results.bindings[i]
            break // to prevent unneccesary run time
        }
    }
    document.getElementById("symptomDescription").innerHTML = symptom.symptomDescription.value //updates the value in html
    //console.log(symptom.symptomDescription.value)
}

// I am so sorry to anyone reading this function
async function constructVenn(results) {
    var selectedSymptomNames = []
    var symptoms = []
    for (let i = 0; i < document.getElementsByClassName("arcText").length; i++) { //loops through each element with help class
        if (selectedSymptoms.includes(i)) {
            selectedSymptomNames.push({
                name: document.getElementsByClassName("arcText")[i].innerHTML,
                colour: color(i)
            })
        }
    }

    for (let i = 0; i < await results.results.bindings.length; i++) {
        for (let j = 0; j < selectedSymptomNames.length; j++) {
            if (selectedSymptomNames[j].name === capitalizeFirstLetter(results.results.bindings[i].symptomLabel.value)) {
                symptoms.push({
                    ID: results.results.bindings[i].symptom.value.replace("http://www.wikidata.org/entity/", ""),
                    Name: results.results.bindings[i].symptomLabel.value,
                    Colour: selectedSymptomNames[j].colour
                })
            }
        }
    }
    await __init_venn(symptoms)
}
function setName(name){
    console.log(name)
    document.getElementById("title").innerHTML = name
  }  
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  
