

// http://blog.thomsonreuters.com/index.php/mobile-patent-suits-graphic-of-the-day/
var links = [
  {source: "Microsoft", target: "Amazon", type: "licensing"},
  {source: "Microsoft", target: "HTC", type: "licensing"},
  {source: "Samsung", target: "Apple", type: "suit"},
  {source: "Motorola", target: "Apple", type: "suit"},
  {source: "Nokia", target: "Apple", type: "resolved"},
  {source: "HTC", target: "Apple", type: "suit"},
  {source: "Kodak", target: "Apple", type: "suit"},
  {source: "Microsoft", target: "Barnes & Noble", type: "suit"},
  {source: "Microsoft", target: "Foxconn", type: "suit"},
  {source: "Oracle", target: "Google", type: "suit"},
  {source: "Apple", target: "HTC", type: "suit"},
  {source: "Microsoft", target: "Inventec", type: "suit"},
  {source: "Samsung", target: "Kodak", type: "resolved"},
  {source: "LG", target: "Kodak", type: "resolved"},
  {source: "RIM", target: "Kodak", type: "suit"},
  {source: "Sony", target: "LG", type: "suit"},
  {source: "Kodak", target: "LG", type: "resolved"},
  {source: "Apple", target: "Nokia", type: "resolved"},
  {source: "Qualcomm", target: "Nokia", type: "resolved"},
  {source: "Apple", target: "Motorola", type: "suit"},
  {source: "Microsoft", target: "Motorola", type: "suit"},
  {source: "Motorola", target: "Microsoft", type: "suit"},
  {source: "Huawei", target: "ZTE", type: "suit"},
  {source: "Ericsson", target: "ZTE", type: "suit"},
  {source: "Kodak", target: "Samsung", type: "resolved"},
  {source: "Apple", target: "Samsung", type: "suit"},
  {source: "Kodak", target: "RIM", type: "suit"},
  {source: "Nokia", target: "Qualcomm", type: "suit"}
];

var nodes = {};

// Compute the distinct nodes from the links.
links.forEach(function(link) {
  link.source = nodes[link.source] || (nodes[link.source] = {name: link.source});
  link.target = nodes[link.target] || (nodes[link.target] = {name: link.target});
});

console.log('nodes', nodes, 'links', links);

var w = 1280,
    h = 800;

var force = d3.layout.force()
    .nodes(d3.values(nodes))
    .links(links)
    .size([w, h])
    .linkDistance(80)
    .charge(-500)
    .on("tick", tick)
    .start();

var svg = d3.select("#chart").append("svg:svg")
    .attr("width", w)
    .attr("height", h);

var path = svg.append("svg:g").selectAll("path")
    .data(force.links())
  .enter().append("svg:path")
    .attr("class", function(d) { return "link " + d.type; })
    .attr("marker-end", function(d) { return "url(#" + d.type + ")"; });

var circle = svg.append("svg:g").selectAll("circle")
    .data(force.nodes())
  .enter().append("svg:circle")
    .attr("r", 8)
    .call(force.drag);

var text = svg.append("svg:g").selectAll("g")
    .data(force.nodes())
  .enter().append("svg:g");

// A copy of the text with a thick white stroke for legibility.
text.append("svg:text")
    .attr("x", 12)
    .attr("y", ".31em")
    .attr("class", "shadow")
    .text(function(d) { return d.name; });

text.append("svg:text")
    .attr("x", 12)
    .attr("y", ".31em")
    .text(function(d) { return d.name; });

console.log(nodes);

// Use elliptical arc path segments to doubly-encode directionality.
function tick() {
  path.attr("d", function(d) {
    var dx = d.target.x - d.source.x,
        dy = d.target.y - d.source.y,
        dr = Math.sqrt(dx * dx + dy * dy);
    
    path.attr('stroke', 'red');
    path.attr('stroke-width', 3);
    path.attr('fill-opacity', 0);
    path.attr('class', 'connection');

    return "M" + d.source.x + "," + d.source.y + "L" + d.target.x + "," + d.target.y;
  });

  circle.attr("transform", function(d) {
    return "translate(" + d.x + "," + d.y + ")";
  });

  text.attr("transform", function(d) {
    return "translate(" + d.x + "," + d.y + ")";
  });
}

    