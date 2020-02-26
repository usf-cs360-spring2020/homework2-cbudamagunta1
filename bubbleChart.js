const width = 960;
const height = 500;

const margin = {
  top: 40,
  bottom: 50,
  left: 70,
  right: 30
};


/* PLOT */
let bubbleSvg = d3.select("body").select("svg#BubbleVis");
const bubblePlot = bubbleSvg.append("g").attr("id", "plot");

bubblePlot.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


/* SCALES */
let bounds = bubbleSvg.node().getBoundingClientRect();
let plotWidth = bounds.width - margin.right - margin.left;
let plotHeight = bounds.height - margin.top - margin.bottom;

const scales = {
  x: d3.scaleLinear(),
  y: d3.scaleLinear(),
  r: d3.scaleSqrt(),
  fill: d3.scaleDiverging(d3.interpolateRdYlGn)
};

scales.x.range([0, width-margin.left-margin.right]);
scales.x.domain([0, 0.50]);

scales.y.range([height-margin.top-margin.bottom, 0]);
scales.y.domain([0, 0.10]);

scales.r.range([3, 15]);
scales.r.domain([15525, 174059]);

scales.fill.domain([1, 6, 12]);


/* PLOT SETUP */
drawBubbleAxis();
drawBubbleTitles();
drawBubbleLegends();


/* LOAD THE DATA */
d3.csv("mrc_table2.csv", parseBubbleData).then(drawBubbles);


/* AXES */
function drawBubbleAxis() {

  let xGroup = bubblePlot.append("g").attr("id", "x-axis").attr('class', 'axis');
  let yGroup = bubblePlot.append("g").attr("id", "y-axis").attr('class', 'axis');

  let xAxis = d3.axisBottom(scales.x);
  let yAxis = d3.axisLeft(scales.y);

  xAxis.ticks(11).tickSizeOuter(0);
  yAxis.ticks(11).tickSizeOuter(0);

  xGroup.attr("transform", "translate(0," + plotHeight + ")");
  xGroup.call(xAxis);

  yGroup.call(yAxis);

  const gridYAxis = d3.axisLeft(scales.y).tickSize(-plotWidth).tickFormat('').ticks(11);
  let gridYGroup = bubblePlot.append("g").attr("id", "grid-axis")
    .attr('class', 'axis')
    .call(gridYAxis);

  const gridXAxis = d3.axisBottom(scales.x).tickSize(plotHeight).tickFormat('').ticks(10);
  let gridXGroup = bubblePlot.append("g").attr("id", "grid-axis")
    .attr('class', 'axis')
    .call(gridXAxis);
}


/* AXIS TITLES */
function drawBubbleTitles() {

    const xMiddle = margin.left + midpoint(scales.x.range());
    const yMiddle = margin.top + midpoint(scales.y.range());

    const xTitle = bubbleSvg.append('text')
      .attr('class', 'axis-title')
      .text('Fraction of Parents in Quintile 1');

    xTitle.attr('x', xMiddle);
    xTitle.attr('y', height);
    xTitle.attr('dy', -4);
    xTitle.attr('text-anchor', 'middle');

    const yTitleGroup = bubbleSvg.append('g');
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
function drawBubbleLegends(){

  //Circle
  const legendWidth = 100;
  const legendHeight = 20;

  const circleGroup = bubbleSvg.append('g').attr('id', 'circle-legend');
  circleGroup.attr('transform', translate(width - margin.right - legendWidth - 30, margin.top + 80))

  // https://d3-legend.susielu.com/#size-linear
  const legendSize = d3.legendSize()
    .scale(scales.r)
    .shape('circle')
    .cells(4)
    .ascending(false)
    .shapePadding(8)
    .labelOffset(10)
    .labelFormat("d")
    .title('Mean Kid Earnings')
    .orient('vertical');

  circleGroup.call(legendSize);

  //Color
  const colorGroup = bubbleSvg.append('g').attr('id', 'color-legend');
  colorGroup.attr('transform', translate(width - margin.right - legendWidth - 5, margin.top + 5));

  const title = colorGroup.append('text')
    .attr('class', 'axis-title')
    .text('Tier');

  title.attr('dy', 12);

  const colorbox = colorGroup.append('rect')
    .attr('x', 0)
    .attr('y', 12 + 6)
    .attr('width', legendWidth)
    .attr('height', legendHeight);

  const colorDomain = [d3.min(scales.fill.domain()), d3.max(scales.fill.domain())];
  scales.percent = d3.scaleLinear()
    .range([0, 100])
    .domain(colorDomain);

  const defs = bubbleSvg.append('defs');

  defs.append('linearGradient')
    .attr('id', 'gradient')
    .selectAll('stop')
    .data(scales.fill.ticks())
    .enter()
    .append('stop')
    .attr('offset', d => scales.percent(d) + '%')
    .attr('stop-color', d => scales.fill(d));

  colorbox.attr('fill', 'url(#gradient)');

  scales.legend = d3.scaleLinear()
    .domain(colorDomain)
    .range([0, legendWidth]);

  const legendAxis = d3.axisBottom(scales.legend)
    .tickValues(scales.fill.domain())
    .tickSize(legendHeight)
    .tickSizeOuter(0);

  const axisGroup = colorGroup.append('g')
    .attr('id', 'color-axis')
    .attr('transform', translate(0, 12 + 6))
    .call(legendAxis);
}


/* LABELS */
function drawLabels(data) {
  // place the labels in their own group
  const labelGroup = bubblePlot.append('g').attr('id', 'labels');

  // create data join and enter selection
  const labels = labelGroup.selectAll('text')
    .data(data)
    .enter()
    .filter(d => d.label)
    .append('text');

  labels.text(d => d.name);

  labels.attr('x', d => scales.x(d.parQ1) + 20);
  labels.attr('y', d => scales.y(d.mobility) + 16);

  labels.attr('text-anchor', 'middle');
  labels.attr('dy', d => -(scales.r(d.meanK) + 2));
}


/*
* Draw the bubbles
*/
function drawBubbles(data) {

  data = data.filter(row => row.state === "CA");
  data.sort((a, b) => b.meanK - a.meanK);

  const bubbleGroup = bubblePlot.append('g').attr('id', 'bubbles');

  const bubbles = bubbleGroup
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
      .attr("cx", d => scales.x(d.parQ1))
      .attr("cy", d => scales.y(d.mobility))
      .attr("r", d => scales.r(d.meanK))
      .style("stroke", "white")
      .style("fill", d => scales.fill(d.tier));

      //drawLabels(data);
}


/*
 * Convert values as necessary and discard unused columns
 */
function parseBubbleData(row){
  let keep = {};

  keep.parQ1 = parseFloat(row["par_q1"]);
  keep.mobility = parseFloat(row["mr_kq5_pq1"]);
  keep.tier = parseInt(row["tier"]);
  keep.meanK = parseInt(row["k_mean"]);
  keep.state = row["state"];
  keep.name = row["name"];


  switch(row.name.toLowerCase()) {
    case 'glendale career college':
      keep.label = true;
      break;

    case 'united education institute':
      keep.label = true;
      break;

    case 'pasadena city college':
      keep.label = true;
      break;

    case 'california state university, los angeles':
      keep.label = true;
      break;

    case 'santa monica college':
      keep.label = true;
      break;

    case 'westwood college - los angeles':
      keep.label = true;
      break;

    case 'santa barbara business college':
      keep.label = true;
      break;

    case 'westwood college - south bay':
      keep.label = true;
      break;

    case 'imperial valley college':
      keep.label = true;
      break;

    case 'college of the desert':
      keep.label = true;
      break;

    case 'state center community college district':
      keep.label = true;
      break;

    case "mount st. mary's college":
      keep.label = true;
      break;

    case 'california state polytechnic university, pomona':
      keep.label = true;
      break;

    case 'mti college':
      keep.label = true;
      break;

    case 'art center college of design':
      keep.label = true;
      break;

    case 'san jose state university':
      keep.label = true;
      break;

    case 'musicians institute':
      keep.label = true;
      break;

    default:
      keep.label = false;
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
