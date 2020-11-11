function position(d) {
    const t = d3.select(this);
    switch (d.side) {
      case "top":
        t.attr("text-anchor", "middle").attr("dy", "-0.7em");
        break;
      case "right":
        t.attr("dx", "0.5em")
          .attr("dy", "0.32em")
          .attr("text-anchor", "start");
        break;
      case "bottom":
        t.attr("text-anchor", "middle").attr("dy", "1.4em");
        break;
      case "left":
        t.attr("dx", "-0.5em")
          .attr("dy", "0.32em")
          .attr("text-anchor", "end");
        break;
    }
  }
function halo(text) {
    text
        .select(function() {
        return this.parentNode.insertBefore(this.cloneNode(true), this);
        })
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-width", 4)
        .attr("stroke-linejoin", "round");
}


export function scatterplot(data){
    const margin = ({top: 20, right: 20, bottom: 40, left: 50});
    const w = screen.availWidth - margin.left - margin.right - 100;
    const h = 650 - margin.top - margin.bottom;

    var svg = d3.selectAll('.chart')
        .append("svg")
        .attr("width", w + margin.left + margin.right)
        .attr("height", h + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var xScale = d3.scaleLinear()
        .domain(d3.extent(data, d=>d.miles))
        .nice()
        .range([0,w])
    
    var yScale = d3.scaleLinear()
        .domain(d3.extent(data, d=>d.gas))
        .nice()
        .range([h,0])
    
    var xAxis = d3.axisBottom()
        .scale(xScale);

    var yAxis = d3.axisLeft()
        .scale(yScale)
        .ticks(null, "$.2f");

    var xAxisDisplay = svg.append("g")
        .attr('class', 'axis x-axis')
        .call(xAxis)
        .attr("transform", `translate(0, ${h})`);

    var yAxisDisplay = svg.append('g')
        .attr('class', 'axis y-axis')
        .call(yAxis);
    

    yAxisDisplay.select(".domain").remove()

    yAxisDisplay.selectAll(".tick line")
      .clone()
      .attr("x2", w)
      .attr("stroke-opacity", 0.1); // make it transparent 
    
    xAxisDisplay.selectAll(".tick line")
      .clone()
      .attr("y1", -h)
      .attr('y2', 0)
      .attr("stroke-opacity", 0.1); // make it transparent 
    
    yAxisDisplay.call(g=>
      g.append("text")
        .attr('x', 0)
        .attr('y', 5)
        .attr('text-anchor', 'start')
        .attr('font-size',14)
        .attr('fill', 'black')
        .text("Cost per gallon")
        .call(halo) // optional halo effect
    );
    xAxisDisplay.call(g=>
      g.append("text")
        .attr('x', w)
        .attr('y', -5)
        .attr('text-anchor', 'end')
        .attr('font-size',14)
        .attr('fill', 'black')
        .text("Miles per person per year")
        .call(halo) // optional halo effect
    );

    const line = d3
      .line()
      .curve(d3.curveCatmullRom)
      .x(d => xScale(d.miles))
      .y(d => yScale(d.gas));
    
    function length(path) {
      return d3.create("svg:path").attr("d", path).node().getTotalLength();
    }

    // get length of the line
    const l = length(line(data));
      
    //create path joining labels
    var path = svg.append("path")
      .datum(data)
        .attr('fill', 'none')
        .attr('stroke', 'black')
        .attr('stroke-width', 3)
        .attr("d", line)
        .attr("stroke-dasharray", `0,${l}`) //make line initially invisible
    
    var circles = svg.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', d=>xScale(d.miles))
      .attr('cy', d=>yScale(d.gas))
      .attr('r', 3)
      .attr('stroke', 'black')
      .attr('fill', 'white');
    
    var labels = svg.append("g").attr("class", "labels").selectAll("text")
      .data(data)
      .enter()
      .append("text")
      .attr('x', d=>xScale(d.miles))
      .attr('y', d=>yScale(d.gas))
      .text(d=>d.year)
      .attr('font-size', 14)
      .each(position)
      .attr('fill', 'none')
      .call(halo); //make labels initially invisible-- animate apperance below
    
    //use length of line to animate when text label show up with the path
    function animate(){
      console.log("animation");
      path.attr("stroke-dasharray", `0,${l}`);

      console.log("path should be invisible")
      //console log is necessary to delay animation by a half second

      path.transition() //animate line appearance
        .duration(5000)
        .ease(d3.easeLinear)
        .attr("stroke-dasharray", `${l},${l}`);
      
      labels.attr("fill", 'none');
      labels.transition()
        .delay((d, i) => length(line(data.slice(0, i + 1))) / l * (5000))
        .attr("fill", 'black');
    } 
  return{
    animate
  };
}

