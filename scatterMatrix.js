const margin = {
  top: 40,
  bottom: 40,
  left: 70,
  right: 30
};

let svg = d3.select("body").select("svg#Vis");
const plot = svg.append("g").attr("id", "plot");

plot.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

/* LOAD THE DATA */
d3.csv("mrc_table2.csv", parseScatterData).then(drawChart);


function drawChart(data){

  /* SCALES */

  let bounds = svg.node().getBoundingClientRect();
  let plotWidth = bounds.width - margin.right - margin.left;
  let plotHeight = bounds.height - margin.top - margin.bottom;

  let xScale = data.map(c => d3.scaleLinear()
      .domain(d3.extent(data, data => data[c]))
      .range([plotHeight, 0])
      .nice());

  let yScale = xScale.map(xScale => xScale.copy().range([0, plotWidth]))

  let zScale = d3.scaleOrdinal()
    .domain(data.map(d => d.iclevel))
    .range(d3.schemeCategory10);


  /* AXES */

  let xGroup = plot.append("g").attr("id", "x-axis").attr('class', 'axis');
  let yGroup = plot.append("g").attr("id", "y-axis").attr('class', 'axis');

  let xAxis = d3.axisBottom();
  let yAxis = d3.axisLeft();

  yAxis.ticks(5, 's').tickSizeOuter(0);

  xGroup.attr("transform", "translate(0," + plotHeight + ")");
  xGroup.call(xAxis);
  yGroup.call(yAxis);

  const gridAxis = d3.axisLeft().tickSize(-plotWidth).tickFormat('').ticks(5);
  let gridGroup = plot.append("g").attr("id", "grid-axis")
    .attr('class', 'axis')
    .call(gridAxis);


  /* AXIS TITLES */

  const xMiddle = margin.left + midpoint(regionScale.range());
  const yMiddle = margin.top + midpoint(countScale.range());

  const xTitle = svg.append('text')
    .attr('class', 'axis-title')
    .text('GEO Region');

  xTitle.attr('x', xMiddle);
  xTitle.attr('y', 30);
  xTitle.attr('dy', -8);
  xTitle.attr('text-anchor', 'middle');

  const yTitleGroup = svg.append('g');
  yTitleGroup.attr('transform', translate(4, yMiddle));

  const yTitle = yTitleGroup.append('text')
    .attr('class', 'axis-title')
    .text('Passenger Count');

  yTitle.attr('x', 0);
  yTitle.attr('y', 0);

  yTitle.attr('dy', 15);
  yTitle.attr('text-anchor', 'middle');
  yTitle.attr('transform', 'rotate(-90)');


  /* LEGEND */

  const legendGroup = svg.append('g').attr('id', 'legend');
  legendGroup.attr('transform', translate(margin.left + 40, 50));
  const title = legendGroup.append('text')
      .attr('class', 'legend-title')
      .text('Price Category Code');

  title.attr('dy', 12);

  const legendbox = legendGroup.append('rect')
    .attr('x', 0)
    .attr('y', 20)
    .attr('width', 140)
    .attr('height', 75)
    .style('fill', 'none');

  legendGroup.append('rect')
    .attr('x', 10)
    .attr('y', 30)
    .attr('width', 20)
    .attr('height', 20)
    .style('fill', '6a9e59');

  legendGroup.append('text')
      .attr('class', 'legend-title')
      .attr('x', 40)
      .attr('y', 45)
      .text('Low Fare');

  legendGroup.append('rect')
    .attr('x', 10)
    .attr('y', 60)
    .attr('width', 20)
    .attr('height', 20)
    .style('fill', '5679a3');

  legendGroup.append('text')
      .attr('class', 'legend-title')
      .attr('x', 40)
      .attr('y', 75)
      .text('Other');

      drawScatter(data);

}



/*
* Draw the Scatter Chart
*/
function drawScatter(data) {

  const group = plot.append('g').attr('id', 'scatter');

  const scatterLow = group
    .selectAll("rect")
    .data(data)
    .enter()
    .append("circle")
      .attr("cx", d => (regionScale(d[0]) + (regionScale.bandwidth() / 2)))
      .attr("cy", d => countScale(d[1]))
      .attr("width", regionScale.bandwidth())
      .attr("height", d => plotHeight - countScale(d[1]))
      .attr("r", 8)
      .style("fill", "6a9e59");
}

/*
 * Modeled from convert function in bubble.js example:
 * converts values as necessary and discards unused columns
 */
function parseScatterData(row){
  let keep = {};

  keep.tier = row.tier;
  keep.krankparq5 = parseFloat(row.k_rank_cond_parq5);
  keep.krankparq1 = parseFloat(row.k_rank_cond_parq1);
  keep.kmedian = parseInt(row.k_median);
  keep.mobility = parseFloat(row.mr_kq5_pq1);
  keep.iclevel = parseInt(row.iclevel);

  return keep;
}

/*
 * From bubble.js example:
 * calculates the midpoint of a range given as a 2 element array
 */
function midpoint(range) {
  return range[0] + (range[1] - range[0]) / 2.0;
}

/*
 * From bubble.js example:
 * returns a translate string for the transform attribute
 */
function translate(x, y) {
  return 'translate(' + String(x) + ',' + String(y) + ')';
}
