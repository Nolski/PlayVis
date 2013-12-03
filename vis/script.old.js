var w = 840,
        h = 500;
var svg = d3.select("#chart").append("svg:svg")
    .attr("width", w)
    .attr("height", h);

var force,
    nodes,
    node_array = [],
    links,
    i = 0;

d3.json('output.json', function (error, json) {
    force = d3.layout.force()
        .nodes([])
        .size([w, h])
        .linkDistance(80)
        .charge(-500)
        .on("tick", tick)
        .start();

    nodes = force.nodes();
    links = force.links();

    path = svg.append("svg:g").selectAll("path")
        .data(force.links())
      .enter().append("svg:path")
        .attr("class", function(d) { return "link " + d.type; })
        .attr("marker-end", function(d) { return "url(#" + d.type + ")"; });

    circle = svg.append("svg:g").selectAll("circle")
        .data(force.nodes())
      .enter().append("svg:circle")
        .attr("r", 8)
        .call(force.drag);
    
    node_array = force.nodes();

    var id = window.setInterval(function () {
        if(i == 10) {
            window.clearInterval(id);
        }
        var d = json[i];
        if( d.changed && d.current_char != null && d.last_char != null) {
            links.push({
                "source": d.current_char,
                "target": d.last_char,
                "sentiment": d.sentiment
            });
        }

        links.forEach(function (link) {
            if(link.source == undefined || link.target == undefined) {
                return;
            } 
            
            if(nodes[link.source.name] != undefined) {
                link.source = nodes[link.source];
            } else {
                nodes[link.source] = {name: link.source, x: 0, y: 0};
                node_array.push(nodes[link.source]);
            }

            if(nodes[link.target.name] != undefined) {
                link.target = nodes[link.target];
            } else {
                nodes[link.target] = {name: link.target, x: 0, y: 0};
                node_array.push(nodes[link.target]);
            }
            console.log(nodes);
        });
        force.nodes(d3.values(nodes))
            .links(links);
        update();
        i++;
    }, 300);
});

function update() {
    return;
    path = svg.append("svg:g").selectAll("path")
          .data(force.links())
        .enter().append("svg:path")
          .attr("class", function(d) { return "link " + d.type; })
          .attr("market-end", function(d) { return "url*#" + d.type + ")"});

    circle = svg.append("svg:g").selectAll("circle")
          .data(force.nodes())
        .enter().append("svg:circle")
          .attr("r", 8)
          .call(force.drag);

    force.start();
}

// Use elliptical arc path segments to doubly-encode directionality.
function tick() {
    path.attr("d", function(d) {
        var dx = d.target.x - d.source.x,
            dy = d.target.y - d.source.y,
            dr = Math.sqrt(dx * dx + dy * dy);

        return "M" + d.source.x + "," + d.source.y + d.target.x + "," + d.target.y;
    });

    path.attr("d", function(d) {
    var dx = d.target.x - d.source.x,
        dy = d.target.y - d.source.y,
        dr = Math.sqrt(dx * dx + dy * dy);
        return "M" + d.source.x + "," + d.source.y + "L" + d.target.x + "," + d.target.y;
    });

    path.attr('stroke', 'red');
    path.attr('stroke-width', 3);
    path.attr('fill-opacity', 0);
    path.attr('class', 'connection');
    circle.attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")";
    });
}