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

/*
* Draw the Plot
*/
function drawChart(data){

  /* SCALES */

  const bounds = svg.node().getBoundingClientRect();
  const plotWidth = bounds.width - margin.right - margin.left;
  const plotHeight = bounds.height - margin.top - margin.bottom;

  const xScale = data.map(c => d3.scaleLinear()
      .domain(d3.extent(data, d => d[c]))
      .range([plotHeight, 0])
      .nice());

  const yScale = xScale.map(x => x.copy().range([0, plotWidth]))

  const zScale = d3.scaleOrdinal()
    .domain(data.map(d => d.iclevel))
    .range(d3.interpolateBlues);


  /* AXES */

  const xGroup = plot.append("g").attr("id", "x-axis").attr('class', 'axis');
  const yGroup = plot.append("g").attr("id", "y-axis").attr('class', 'axis');

  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale);

  xGroup.attr("transform", "translate(0," + plotHeight + ")");
  xGroup.call(xAxis);
  yGroup.call(yAxis);

  //drawScatter(data);
}


/*
* Draw the Data Scatter
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
