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
        {x: "C",
        value: 100,
        name: "Drugs to cure \nSymptom 3",
        custom_field: "Drug 7 \nDrug 8 \n Drug 9",
        normal: {fill: "#8C72FF 0.7"}},
        {x: ["A", "C"],
        value: 25, 
        name: "Drugs to cure \nSymptoms 1&3",
        custom_field: "Drug 10 \nDrug 11"},
        {x: ["A", "B"],
        value: 25,
        name: "Drugs to cure \nSymptoms 1&2",
        custom_field: "Drug 12 \nDrug 13"},
        {x: ["B", "C"],
        value: 25,
        name: "Drugs to cure \nSymptoms 2&3",
        custom_field: "Drug 14 \nDrug 15"},
        {x: ["A", "B", "C"],
        value: 25,
        name: "Drugs to cure \nSymptoms 1&2&3",
        custom_field: "Drug 16"}
    ];
    var chart = anychart.venn(data);
    chart.container("container");
    chart.draw();
    chart.labels().format("{%custom_field}");
    chart.stroke('1 #fff');
    chart.legend(false);
    chart.tooltip(false);
});
