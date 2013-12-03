var width = 960,
    height = 500;

var force = d3.layout.force()
    .size([width, height])
    .nodes([{}])
    .linkDistance(150)
    .charge(-1000)
    .on("tick", tick);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)

svg.append("rect")
    .attr("width", width)
    .attr("height", height);

var nodes = force.nodes(),
    links = force.links(),
    node_names = {},
    link_names = {},
    node = svg.selectAll(".node"),
    link = svg.selectAll(".link");

var text = svg.append("svg:g").selectAll("g")
    .data(nodes);
var colors = d3.scale.category10();
update();

d3.json('output.json', function (error, json) {
    var i = 0;
    window.id = window.setInterval(function () {
        var d = json[i];
        if(d.changed){
            if (d.current_char in node_names == false) {
                var node = { name: d.current_char, lines: 5 },
                    n = nodes.push(node);
                node_names[d.current_char] = node;
            } else {
                node_names[d.current_char].lines += 0.1;
            }
            if([d.current_char, d.last_char] in link_names == false) {
                if (d.last_char != null) {
                    if (d.last_char in node_names)
                        links.push({source: node_names[d.current_char], target: node_names[d.last_char]});
                }
            }
        }
        i++;
        update();
    }, 1);
});

function tick() {
    link.attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

    node.attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })
      .attr("dx", function(d) { return d.x; })
      .attr("dy", function(d) { return d.y; })
      .attr("r", function (d) { return d.lines });
}

function update() {
    link = link.data(links);

    link.enter().insert("line", ".node")
        .attr("class", "link");

    node = node.data(nodes);

    node.enter().insert("text")
        .text(function(d) { return d.name })
        .attr("class", "node");

    node.enter().insert("circle", ".cursor")
        .attr("class", "node")
        .attr("r", function (d) { return d.lines; })
        .style("fill", function(d, i) { return colors(i); })
        .call(force.drag)

    force.start();
}