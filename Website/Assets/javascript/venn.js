// FUNCTIONALITY OF THE VENN DIAGRAMM
// Consists of one main function to construct the Venn Diagramm
// Uses the Venn Diagramm function of AnyChart.



// Construction of the Venn Diagramm
// Called by RPC.js when a symptom is selected
async function __init_venn(symptoms) {


    // Ensuring that data is clean before new constructions occur
    document.getElementById("container").innerHTML = ""


    // Class to retreive the results of third SPARQL Query to Wikidata (code downloaded from the WikiData Query Service)
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
    // Constructing the SPARQL Query as a URL
    const endpointUrl = 'https://query.wikidata.org/sparql';
    const sparqlQuery = `SELECT ?drug ?drugLabel
                        WHERE {
                        wd:SYMPTOM wdt:P2176 ?drug
                        SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en" }
                        }`;
    


    // Retrieving and storing them in an array
    result = []
    for (let i in symptoms) {
        var temp = sparqlQuery.replace('SYMPTOM', symptoms[i].ID);
        //console.log(temp)
        const queryDispatcher = new SPARQLQueryDispatcher(endpointUrl);
        temp = await queryDispatcher.query(temp)
        drugs = []
        for (let j in temp.results.bindings) {
            drugs.push(capitalizeFirstLetter(temp.results.bindings[j].drugLabel.value))
        }
        result.push({ symptom: capitalizeFirstLetter(symptoms[i].Name), treatment: drugs, colour: symptoms[i].Colour })
    }



    // Generating the data
    // (Putting all the data into a single array, where each treatment is its own element (stored with symptom and colour))
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



    // Making all the treatments unique in the array and introducing multiple symptoms it may treat
    var compresseddata = []
    for (let i in alldata) {
        check = true
        for (let j in compresseddata) {//for loop used because includes doesnt work with objects
            if (alldata[i].treatment === compresseddata[j].treatment) {
                compresseddata[j].symptom.push(alldata[i].symptom)
                check = false
            }
        }
        
        if (check) { //wont run if any treatment in compresseddata === treatment i in alldata. similar to for else loop in python(although you shouldnt use for else as it reduces readability)
            compresseddata.push({
                treatment: alldata[i].treatment,
                symptom: [alldata[i].symptom], //array so that additional symptoms for this treatment can be appended
                colour: alldata[i].colour
            })
        }
    }

    //compares 2 arrays to see if they are equal. does not work if array stores objects
    function arraysEqual(a, b) {
        if (a === b) return true; //if both are assigned to same memory they are litteraly the same
        if (a == null || b == null) return false; //if one is null it cant be equal (both cant be null because above clause would filter that out)
        if (a.length !== b.length) return false; //if the lengths are different they cant be equal
        //we dont care about the order in which the treatable symptoms were added to the array so we can sort
        a.sort() // be carefull with these if you care about the ordering of your arrays
        b.sort()

        for (var i = 0; i < a.length; ++i) {
            if (a[i] !== b[i]) return false;//if after sorting any element is not equal the arrays are not equal
        }
        return true;
    }

    // Putting all the treatments that treat the same set of symptoms into an array
    //Same functionality as previous for loop just now comparing array of symptoms (reason for above function) and forming an array of treatments
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


    // Converting the data into a format that the AnyChart Venn Diagram can use
    var data = [] //named data as this is the part acually used all previous arrays were just for the conversion process
    for(let i in morecompresseddata){
        data.push({
            x: morecompresseddata[i].symptom, //label of venn section
            value: morecompresseddata[i].treatment.length, //size of venn section
            name: "Click here for treatments", //seen on hover
            custom_field: morecompresseddata[i].treatment.sort().toString().replaceAll(",", "<br>"), //list of treatments used in click funtionality
            normal: ((1 < morecompresseddata[i].symptom.length) ? { } : {fill: morecompresseddata[i].colour + " 0.5"}),  //determines the colour with 50% opacity (if its an overlap section no color is assigned)
        })
    }
    var index = 0

    // Creating the chart with AnyChart
    anychart.onDocumentReady(function () {
        var chart = anychart.venn(data);
        chart.container("container"); //assigns container to be used for the diagram
        chart.draw();
        chart.labels().format("{%x}"); //label text asignment
        chart.labels().fontColor("#000") //font colour
        chart.stroke('1 #fff'); //outline of the diagram
        chart.legend(false);
        chart.tooltip(true); //on hover functionality
        document.getElementById("venntitle").innerHTML = "Number of Available Treatments"
        var vennDis = "Note: If no circle shows up for a selected symptom, no treatments are currently available in our database"
        document.getElementById("vennDisclaimer").innerHTML = vennDis
        chart.listen("pointClick", function(e) {
            index = e.iterator.getIndex()
            setTList(index);
            //console.log(index)
        })
    });

    // Creating the list of treatments for the symptom clicked in the Venn Diagramm
    function setTList(index) {
        //console.log(data[index].custom_field)
        var tList = `<div class=treatmentBox> 
        <div id="tListText"> 
        <h3>List of Available Treatments:</h3>
        <p> 
        `
        tList += data[index].custom_field
        tList += "</p> </div> </div>"
        document.getElementById("treatmentList").innerHTML = tList
    }
}

// Capitalizing the first letters of symptoms and treatments
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }


