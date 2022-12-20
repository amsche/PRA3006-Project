// FUNCTIONALITY OF THE WHEEL OF MISFORTUNE
// The necessary variables and the function to initiate execution of this code are shown first.
// All other necessary functions are displayed below.
// The basic structure of the wheel is taken from the d3 library.



// Setup of some variables which will be needed
selectedSymptoms = [] //bookkeeping device, set it to nothing to make sure it is always empty when we start 
// Creating a colour space according to our specifications (mint green to purple)
var color = d3.scaleOrdinal(["#72FFC3", "#72FFE5", "#72E1FF", "#72B6FF", "#728AFF", "#8C72FF"]); // color is now a function that returns a consistent colour based on input



// Creating an eventlistener for the dropdown menu for diseases 
// (uses the input as the entered disease for the query)
//selector drop down menu 
const selected = document.querySelector('.selector')
selected.addEventListener("input", (e) => {
    var value = e.target.value.split(",")[0]//the first part is the Wikidata ID, takes the results and name (from search functionality) and splits it with a comma 
    __init_RPC(value.replace("http://www.wikidata.org/entity/", ""))//Initiates wheel of misfortune 
    setName ( e.target.value.split(",")[1])//the second part is the label (name)
    //done with the string split function as this seemed like the best way to transfer this data
})



// To display the name of the disease in the html
function setName(name){
    document.getElementById("title").innerHTML = "Symptoms of " + capitalizeFirstLetter(name)
  }  
// To capitalize the first letters of String
//takes the char at place 0 and makes it upper case 
//string.slice removes the first letter of the string (lowercase) and then adds it to the uppercase first letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }



// Function to execute this file when a disease is selected
// Seperated from previous section because it is also called from another document(search-functionality.js)
// Because called from another file dunder notation used
async function __init_RPC(diseaseEntered) {

    results = await __symptomsQuery(diseaseEntered)

    // Ensuring that the data is clean before other constructions occur (reseting it) 
    document.getElementById("svg").innerHTML = ""
    document.getElementById("container").innerHTML = ""
    document.getElementById("treatmentList").innerHTML = ""
    document.getElementById("venntitle").innerHTML = ""
    document.getElementById("vennDisclaimer").innerHTML = ""
    //document.getElementById("title").innerHTML = ""

    var currentIndex = null //no current index yet
    selectedSymptoms = []

    // Creating the speech bubble for the description and the select button in the html
    document.getElementById("speechBubbleContainer").innerHTML = `
    <div id="speech-bubble" class="speech-bubble" >
    <p><div id="symLabel"></div> description:</p>
    <p>
        <div id="symptomDescription" ></div>
    </p>
    </div>
    <div class="sButton">
    <button id="select">Select</button>
    </div>
    `

    // Using the results to get purely the symptom IDs as this is easier to work with
    const symptoms = await parser(results)
    // Establishing values needed for the creation of the wheel, i.e. the area available 
    var svg = d3.select("svg"), width = +svg.attr("width"), height = +svg.attr("height"), radius = Math.min(width, height)/2, g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
    //this line also uses the g variable, which resulted in a lot of confusion, practically it is only a html tag
    //the transform stuff is related to the rotational function


    // Creating an array with the data in the format that the wheel is used to, put the data into objects 
    var data = new Array(symptoms.length);
    for (let i = 0; i < symptoms.length; i++) {
        data[i] = { symName: symptoms[i] }
    }

    // WARNING following section contains a lot of incomprehensible variable names. It was copied hope for change
    // Creating the parts needed for the wheel
    var pie = d3.pie()
        .sort(null)
        .value(1);//hard coded because we want all slices to be the same size

    var path = d3.arc()
        .outerRadius(radius - 10)
        .innerRadius(0);

    var label = d3.arc()
        .outerRadius(radius - 50) //these values/offsets determine the locations of the lables
        .innerRadius(radius - 50);

    var arc = g.selectAll(".arc")//selects all arc classes in the g element
        .data(pie(data))
        .enter().append("g")//new lines and appends a new g element to the circle until pie(data) is empty
        .attr("class", "arc");//assignes the class arc to the element


    // Setting wheel characteristics (colours, rotate function, labels etc.)
    // (most edited part of the code from the d3 collection)
    arc.append("path")

        // Colours and sections
        .attr("d", path)
        .attr("class", "path-section") //gives the arc area a class so its colour can be changed later
        .attr("fill", "#C0C0C0") //gives the arc areas a standard colour
        .attr("text-anchor", function (d) {
            // are we past the center?
            //makes sure the text isn't on the outside of the pie
            return (d.endAngle + d.startAngle) / 2 > Math.PI ? "end" : "start";
        })

        // Rotation of wheel when clicking on a section
        .on("click", function (d) {

            // The amount we need to rotate
            // 90 makes it go to the right when you click 
            var rotate = 90 - (d.startAngle + d.endAngle) / 2 / Math.PI * 180;

            // Transition the pie chart
            g.transition()
                .attr("transform", "translate(" + width / 2 + "," + height / 2 + ") rotate(" + rotate + ")")
                //1000 ms 
                .duration(1000);

            // Τransition the labels
            text.transition()
                .attr("transform", function (dd) {
                    return "translate(" + label.centroid(dd) + ") rotate(" + (-rotate) + ")";
                })
                .duration(1250);

            // Book keeping, puts stuff in the description box 
            getInfo(d.data.symName, results);
            //current index knows what is currently selected
            currentIndex = d.index
        });

    // Formatting the label text 
    // (Just copied from the d3 library)
    var text = arc.append("text")
        .attr("class", "arcText")
        .attr("transform", function (d) { return "translate(" + label.centroid(d) + ")"; })
        .attr("dy", "0.38em")
        .text(function (d) { return d.data.symName; });

    // Establishing the select button 
    // (to select a specific symptom, which will be displayed in the Venn Diagram)
    const selectorbutton = document.getElementById("select")
    //not adding event because we don't care 
    selectorbutton.addEventListener("click", () => {
        // Checking if the current index (section on right) is selected
        if (selectedSymptoms.includes(currentIndex)) { 
            let index = selectedSymptoms.indexOf(currentIndex)
            // Removing symptom from the array of selected symptoms if true
            //unselect it if already selected
            if (index > -1) {
                selectedSymptoms.splice(index, 1)
            }
        }
        else {
            selectedSymptoms.push(currentIndex) //Avoiding that it adds it to the array
        }

        changeColour()  // Updating the colours 

        // Constructing the Venn Diagram if at least one symptom is selected
        if (selectedSymptoms.length > 0) {
            constructVenn(results)
        }
        else{
            document.getElementById("container").innerHTML = ""
        }
    })

}

// Taking the results of the query (parser) and converting them to just the names of the symptoms
// (so it can be used easily in the wheel)
async function parser(results) {
    var symptoms = new Set //new set to make sure everything is unique
    for (let i = 0; i < await results.results.bindings.length; i++) {
        symptoms.add((capitalizeFirstLetter(results.results.bindings[i].symptomLabel.value)))
    }
    return Array.from(symptoms)
}



// Taking a symptom name and the results object to produce the symptom descripion
async function getInfo(symptom, results) {
    for (let i = 0; i < await results.results.bindings.length; i++) {
        if (symptom.toUpperCase() === results.results.bindings[i].symptomLabel.value.toUpperCase()) {
            symptom = results.results.bindings[i] //id name and description 
            break // to prevent unneccesary run time
        }
    }
    document.getElementById("symptomDescription").innerHTML = symptom.symptomDescription.value //updates the value in html
    document.getElementById("symLabel").innerHTML = capitalizeFirstLetter(symptom.symptomLabel.value) //updates value of the symptom label in the description box in HTML
}



// Changing the colour of each element with the path-section (needs to change) class
function changeColour() {
    // Looping through each element with path-section class
    for (let i = 0; i < document.getElementsByClassName("path-section").length; i++) { 
        if (selectedSymptoms.includes(i)) { // if included fills it a colour
            d3.select(document.getElementsByClassName("path-section")[i]).style("fill", color(i))
        }
        else { // else colours it the default colour
            d3.select(document.getElementsByClassName("path-section")[i]).style("fill", "#C0C0C0")
        }
    }
}



// Constructing the Venn Diagram with the selected symptoms
async function constructVenn(results) {
    var selectedSymptomNames = [] //will temp store names of selected symptoms
    const arcText = document.getElementsByClassName("arcText")//stores each element with the arcText class

    for (let i = 0; i < arcText.length; i++) { //loops through each element with arcText class
        if (selectedSymptoms.includes(i)) { //then if the element is selected it adds its name and color to the array with names
            selectedSymptomNames.push({
                name: arcText[i].innerHTML,
                colour: color(i) //color is added to assure accurate visual communication between RPC and venn
            })
            if (arcText[i].innerHTML === "Increase"){//easter egg
                var svg = document.getElementById("svg")
                svg.attributes.width.value = parseInt(svg.attributes.width.value) +40
                svg.attributes.height.value = parseInt(svg.attributes.height.value) +40
                
            }
        }
    }
    //cant be easily refactored because the index i needs to match the render order using the below example would result in the ordering
    //of colours to be mixed up, which may be confusing to the user eventhough this would be more efficient
    // for (let i = 0; i < selectedSymptoms.length; i++) {
    //     selectedSymptomNames.push({
    //         name: arcText[i].innerHTML,
    //         colour: color(i)
    //     })
    // }

    
    var symptoms = []
    //loops through all the results and selected symptom names, needed to get the symptom IDs
    for (let i = 0; i < await results.results.bindings.length; i++) {
        for (let j = 0; j < selectedSymptomNames.length; j++) {//cant use includes instead bc color communication may be lost
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
//@todo refactoring the datastructure to not use the parser function may allow the constructVenn()
// function to be simplified
