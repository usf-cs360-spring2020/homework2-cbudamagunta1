const width = 960;
const height = 600;

let quintiles = ["Fraction of Parents in Q1", "Fraction of Parents in Q2", "Fraction of Parents in Q3",
  "Fraction of Parents in Q4", "Fraction of Parents in Q5"];

const heatMargin = {
  top: 40,
  bottom: 50,
  left: 150,
  right: 30
};


/* PLOT */
let heatSvg = d3.select("body").select("svg#HeatVis");
const heatPlot = heatSvg.append("g").attr("id", "plot");

heatPlot.attr("transform", "translate(" + heatMargin.left + "," + heatMargin.top + ")");


/* SCALES */
let bounds = heatSvg.node().getBoundingClientRect();
let plotWidth = bounds.width - heatMargin.right - heatMargin.left;
let plotHeight = bounds.height - heatMargin.top - heatMargin.bottom;

const heatScales = {
  x: d3.scaleBand(),
  y: d3.scaleBand(),
  color: d3.scaleSequential(d3.interpolateRdYlGn)
};

heatScales.x.range([0, width - heatMargin.left - heatMargin.right]);
heatScales.x.domain(quintiles);
heatScales.x.rangeRound([0, plotWidth]);
heatScales.x.paddingInner(0.1);

heatScales.y.range([height - heatMargin.top - heatMargin.bottom, 0]);
//heatScales.y.domain();

heatScales.color.domain([0.0358, 0.6900]);


/* PLOT SETUP */
//drawHeatAxis();
drawHeatTitles();
drawHeatLegend();


/* LOAD THE DATA */
d3.csv("mrc_table2.csv", parseHeatmapData).then(drawHeatmap);


/* AXES */
// function drawHeatAxis() {
//
//   let xGroup = heatPlot.append("g").attr("id", "x-axis").attr('class', 'axis');
//   let yGroup = heatPlot.append("g").attr("id", "y-axis").attr('class', 'axis');
//
//   let xAxis = d3.axisBottom(heatScales.x).tickPadding(0);
//   let yAxis = d3.axisLeft(heatScales.y).tickPadding(0);
//
//   xGroup.attr("transform", "translate(0," + plotHeight + ")");
//   xGroup.call(xAxis);
//
//   yGroup.call(yAxis);
// }


/* AXIS TITLES */
function drawHeatTitles() {

    const xMiddle = heatMargin.left + midpoint(heatScales.x.range());
    const yMiddle = heatMargin.top + midpoint(heatScales.y.range());

    const xTitle = heatSvg.append('text')
      .attr('class', 'axis-title')
      .text('Fraction of Parents in Quintile 1');

    xTitle.attr('x', xMiddle);
    xTitle.attr('y', height);
    xTitle.attr('dy', -4);
    xTitle.attr('text-anchor', 'middle');

    const yTitleGroup = heatSvg.append('g');
    yTitleGroup.attr('transform', translate(4, yMiddle));

    const yTitle = yTitleGroup.append('text')
      .attr('class', 'axis-title')
      .text('Mobility Rate');

    yTitle.attr('x', 0);
    yTitle.attr('y', 0);

    yTitle.attr('dy', 15);
    yTitle.attr('text-anchor', 'middle');
    yTitle.attr('transform', 'rotate(-90)');
}


/* LEGEND */
function drawHeatLegend(){

  const legendWidth = 250;
  const legendHeight = 20;

  const colorGroup = heatSvg.append('g').attr('id', 'color-legend');
  colorGroup.attr('transform', translate(width - heatMargin.right - legendWidth -20, heatMargin.top + 10));

  const title = colorGroup.append('text')
    .attr('class', 'axis-title')
    .text('Fraction of Parents in Given Quintile');

  title.attr('dy', 12);

  const colorbox = colorGroup.append('rect')
    .attr('x', 0)
    .attr('y', 12 + 6)
    .attr('width', legendWidth)
    .attr('height', legendHeight);

  const colorDomain = [d3.min(heatScales.color.domain()), d3.max(heatScales.color.domain())];
  heatScales.percent = d3.scaleLinear()
    .range([0, 100])
    .domain(colorDomain);

  const defs = heatSvg.append('defs');

  defs.append('linearGradient')
    .attr('id', 'gradient')
    .selectAll('stop')
    .data(heatScales.color.ticks())
    .enter()
    .append('stop')
    .attr('offset', d => heatScales.percent(d) + '%')
    .attr('stop-color', d => heatScales.color(d));

  colorbox.attr('fill', 'url(#gradient)');

  heatScales.legend = d3.scaleLinear()
    .domain(colorDomain)
    .range([0, legendWidth]);

  const legendAxis = d3.axisBottom(heatScales.legend)
    .tickValues(heatScales.color.domain())
    .tickSize(legendHeight)
    .tickSizeOuter(0);

  const axisGroup = colorGroup.append('g')
    .attr('id', 'color-axis')
    .attr('transform', translate(0, 12 + 6))
    .call(legendAxis);
}


/*
* Draw the heatmap
*/
function drawHeatmap(data) {

  console.log(data.length);

  data = data.filter(function(row) {
    return row["tier_name"] === "Ivy Plus" ||
        row["tier_name"] === "Other elite schools (public and private)" ||
       row["tier_name"] === "Highly selective public" ||
       row["tier_name"] === "Highly selective private";
  });

  console.log(data.length);

  data = data.sort(function(a, b) {
    return a["name"] - b["name"];
  });


  let colleges = data.map(row => row.name);
  heatScales.y.domain(colleges);


  let xGroup = heatPlot.append("g").attr("id", "x-axis").attr('class', 'axis');
  let yGroup = heatPlot.append("g").attr("id", "y-axis").attr('class', 'axis');

  let xAxis = d3.axisBottom(heatScales.x).tickPadding(0);
  let yAxis = d3.axisLeft(heatScales.y).tickPadding(0);

  xGroup.attr("transform", "translate(0," + plotHeight + ")");
  xGroup.call(xAxis);

  yGroup.call(yAxis);


  // let values = [data.parQ1, data.parQ2, data.parQ3, data.parQ4, data.parQ5];
  // let merged = d3.merge(values);


  // create one group per row
  let rows = heatPlot.selectAll("g.cell")
    .data(data)
    .enter()
    .append("g");

  rows.attr("class", "cell");
  rows.attr("id", d => "Region-" + d.RegionID);

  // shift the entire group to the appropriate y-location
  rows.attr("transform", function(d) {
    return translate(0, heatScales.y(d["RegionName"]));
  });

  // create one rect per cell within row group
  let cells = rows.selectAll("rect")
    .data(d => d.values)
    .enter()
    .append("rect");

  cells.attr("x", d => heatScales.x(d.parQ));
  cells.attr("y", 0); // handled by group transform
  cells.attr("width", heatScales.x.bandwidth());
  cells.attr("height", heatScales.y.bandwidth());

  // here is the color magic!
  cells.style("fill", d => scale.color(d.value));
  cells.style("stroke", d => scale.color(d.value));




}


/*
 * Convert values as necessary and discard unused columns
 */
function parseHeatmapData(row){
  let keep = {};

  // keep.parQ = row["Measure Names"];
  // keep.parQValue = parseFloat(row["Measure Values"]);
  // keep.mobility = parseFloat(row["Mobility Rate"]);
  // keep.name = row["Name"];

  keep.parQ1 = parseFloat(row["par_q1"]);
  keep.parQ2 = parseFloat(row["par_q2"]);
  keep.parQ3 = parseFloat(row["par_q3"]);
  keep.parQ4 = parseFloat(row["par_q4"]);
  keep.parQ5 = parseFloat(row["par_q5"]);

  keep.mobility = parseFloat(row["mr_kq5_pq1"]);
  keep.tier = parseInt(row["tier"]);
  keep.tier_name = row["tier_name"];

  keep.state = row["state"];

  switch(row["name"].toLowerCase()) {
    case 'university of california, berkeley':
      keep.name = "UC Berkeley";
      break;

    case 'university of california, irvine':
      keep.name = "UC Irvine";
      break;

    case 'university of california, los angeles':
      keep.name = "UC Los Angeles";
      break;

    case 'university of california, san diego':
      keep.name = "UC San Diego";
      break;

    case 'university of california, santa barbara':
      keep.name = "UC Santa Barbara";
      break;

    default:
      keep.name = row["name"];
  }

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
