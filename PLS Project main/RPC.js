
var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height"),
    radius = Math.min(width, height) / 3,
    g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var color = d3.scaleOrdinal(["#72FFC3", "#72FFE5", "#72E1FF", "#72B6FF", "#728AFF", "#8C72FF"]);

var data = [ {symName:"Rash", frequency: 0.25},{symName:"Fever", frequency: 0.25},{symName:"Nausea", frequency: 0.25},{symName:"Cancer", frequency: 0.25},{symName:"Blindness", frequency: 0.25},{symName:"Loss of Limbs", frequency: 0.25} ]


    
var pie = d3.pie()
    .sort(null)
    .value(function(d) { return d.frequency; });

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
    .attr("fill", function(d) { 
        return color(d.data.symName); 
    })
    // .attr("transform", function(d) {
    //     var c = arc.centroid(d),
    //         x = c[0],
    //         y = c[1],
    //         // pythagorean theorem for hypotenuse
    //         h = Math.sqrt(x*x + y*y);
    //     return "translate(" + (x/h * labelr) +  ',' +
    //         (y/h * labelr) +  ")";
    // })
    .attr("text-anchor", function(d) {
    // are we past the center?
        return (d.endAngle + d.startAngle)/2 > Math.PI ?
            "end" : "start";
    })

    .on("click",function(d) {
      // The amount we need to rotate:
      var rotate = 90-(d.startAngle + d.endAngle)/2 / Math.PI * 180;
      var color = "#000000"

      // Transition the pie chart
      g.transition()
        .attr("transform",  "translate(" + width / 2 + "," + height / 2 + ") rotate(" + rotate + ")")
        .duration(1000);

     // Τransition the labels:
     text.transition()
       .attr("transform", function(dd) {
         return "translate(" + label.centroid(dd) + ") rotate(" + (-rotate) + ")"; })
       .duration(1000);

    // console log 
        console.log(d.data.symName);
    });

var text = arc.append("text")
      .attr("transform", function(d) { return "translate(" + label.centroid(d) + ")"; })
      .attr("dy", "0.38em")
      .text(function(d) { return d.data.symName; });


