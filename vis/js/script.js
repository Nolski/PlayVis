var width = Math.floor(parseFloat(window.getComputedStyle(document.querySelector('#chart')).width.replace('px', ''))),
    height = Math.floor(parseFloat(window.getComputedStyle(document.querySelector('#chart')).height.replace('px', ''))),
    nodes = [],
    links = [],
    linkNames = [],
    paused = false,
    menu = false,
    neighbors = false,
    curr_node = null;


var force = d3.layout.force()
    .size([width, height])
    .nodes(nodes)
    .links([])
    .linkStrength(1)
    .linkDistance(80)
    .charge(function (d) {
        return -300;
    })
    .on("tick", tick);

var svg = d3.select("#chart").append("svg")
    .attr("width", width)
    .attr("height", height)

svg.append("rect")
    .attr("width", width)
    .attr("height", height);

var node_names = {},
    link_names = {},
    node = svg.selectAll(".node"),
    link = svg.selectAll(".link");

var texts = svg.selectAll("text.label");

var min = 0,
    max = 0;

var colors = d3.scale.category10();

update();

document.getElementById('stop').addEventListener('click', function (event) {
    if (!paused) {
        window.clearInterval(window.id);
        d3.select('#stop')
          .html('Resume')
          .attr('class', 'btn btn-success');
    } else {
        window.id = window.setInterval(interval, 10);
        d3.select('#stop')
          .html('Pause')
          .attr('class', 'btn btn-danger');
    }

    paused = !paused;
});

document.getElementById('neighbors').addEventListener('click', function (event) {
    if (!neighbors) {
        showNeighbors(curr_node)
        d3.select('#neighbors').html('Show All Nodes');
    } else {
        unshowNeighbors()
        d3.select('#neighbors').html('Show Only Neighbors');
    }

    neighbors = !neighbors;
});

/**
 * Click event handler for slider tray on mobile
 * @param  {event} event 
 * @return {none}       none
 */
document.getElementById('up').addEventListener('click', function (event) {
    if (!menu) {
        var side = window.getComputedStyle(document.getElementsByClassName('side')[0]).height.replace('px', '');
        if(side < 450) {
            d3.select('.side')
              .transition()
              .style('margin-top', '-'+side+'px');
        } else {
            d3.select('.side')
              .transition()
              .style('margin-top', '-450px');
        }
        d3.select('#toggle')
          .attr('class', 'glyphicon glyphicon-chevron-down')
          .style('margin-left', '4px');
    } else {
        d3.select('.side')
          .transition()
          .style('margin-top', '0px');
        d3.select('#toggle')
          .attr('class', 'glyphicon glyphicon-chevron-up')
          .style('margin-left', '7px');
    }

    menu = !menu;
});

d3.json('output.json', function (error, json) { // ajax for the json and start the animation
    window.timeline = d3.scale.linear()
            .range([0, 100])
            .domain([0, json.length]);
    window.i = 0;
    window.json = json;
    window.id = window.setInterval(interval, 100);
});

function interval () {
    update();
    if (i >= json.length) {
        return;
    }
    
    var time_width = timeline(i);
    d3.select('#time')
        .attr('style', 'width: ' + time_width + '%');

    var d = json[i];

    if (d.current_char in node_names == false) { // if new character
        var node = { name: d.current_char, radius: 5, sentiment: d.sentiment, last_line: i, lines: 0 };
        
        nodes.push(node);
        node_names[d.current_char] = node;
    } else {
        node_names[d.current_char].radius += 0.1; // increment character size
        node_names[d.current_char].lines++;
    }

    var current_char = node_names[d.current_char];

    if (d.last_char != null) { //make sure our character is talking to someone
        if (d.last_char in node_names) { // Make sure the previous character is not null
            
            // HANDLE LINKING ////////////
            var currLink = {
                    source: current_char, 
                    target: node_names[d.last_char], 
                    state: 'inactive',
                    interactions: 1
                },
                linkName = current_char.name  +'-'+ node_names[d.last_char].name;

            var last_char = node_names[d.last_char];
            if (linkNames.indexOf(linkName) == -1) {
                linkNames.push(linkName)
                links.push(currLink); // create a link

                if (current_char['links'] == undefined){
                    current_char['links'] = [];
                }

                if (last_char['links'] == undefined){
                    last_char['links'] = [];
                }

                current_char['links'].push(currLink);
                last_char['links'].push(currLink);
            } else {
                var curr_index = findLink(currLink, current_char['links']);
                current_char['links'][curr_index].interactions++;
            }

            if (current_char['neighbors'] == undefined){
                current_char['neighbors'] = [];
            }

            current_char['neighbors'].push(currLink);

            // HANDLE SENTIMENT ///////////
            if (node_names[d.last_char].sentiment != undefined) { //add sentiment (or create sentiment)
                node_names[d.last_char].sentiment += d.sentiment;
            } else {
                 node_names[d.last_char].sentiment = d.sentiment;
            }
            
            if (node_names[d.last_char].sentiment > max) { // modify max sentiment
                max = node_names[d.last_char].sentiment;
            }

            if(node_names[d.last_char].sentiment < min) {// modify minsentiment
                min = node_names[d.last_char].sentiment;
            }
        }
    }   

    i++;
}

function showNeighbors(node) {
    old_nodes = nodes;
    old_links = links;
    nodes = [];
    links = [];

    svg.selectAll("text.label").remove();
    texts = texts.data(nodes);
    nodes.push(node);
    node.links.forEach(function (link) {
        if(link.source.name == node.name) {
            nodes.push(link.target);
            links.push(link);
        }
    });

    update();
}

function unshowNeighbors() {
    nodes = old_nodes;
    links = old_links;
    update();
}

function findLink (target, links) {
    var result = false,
        i = 0;
    links.forEach(function (link) {
        if (link.source.name==target.source.name && link.target.name==target.target.name) {
            result = i;
        }
        i++;
    });
    return result;
}

/**
 * This runs on every increment of the animation in d3.
 * Totally magical
 * @return {None} none
 */
function tick() {
    link.attr("x1", function (d) { return d.source.x; })
      .attr("y1", function (d) { return d.source.y; })
      .attr("x2", function (d) { return d.target.x; })
      .attr("y2", function (d) { return d.target.y; })
      .transition()
      .attr('style', function (d) {
          if (d.state == 'active') {
              return 'stroke: red; stroke-width:5px;';
          } else {
            return 'stroke: black;'
          }
      })
      .attr('opacity', function (d) {
          if (d.state == 'active') {
              return 0.7;
          } else {
            return 1;
          }
      });

    node.attr("cx", function (d) { return d.x; })
      .attr("cy", function (d) { return d.y; })
      .attr("r", function (d) { return d.radius })
      .attr("style", function (d) {
            var scale = d3.scale.linear()
                .range([0, 255])
                .domain([min, max]);
            var sent = scale(d.sentiment),
                g = Math.floor(sent),
                r = Math.floor(255 - sent);
            return("fill:rgb(" + r+", "+g+",0)");
        });
    if (texts != []) {
        texts.attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        })
        .text(function (d) {  return d.name + ' (' + d.sentiment + ')';  });
    };
}


/**
 * This function updates all of our data arrays which will change how the graph
 * is desplayed
 * @return {None} none
 */
function update() {
    link = link.data(links);
    link.enter().insert("line", ".node")
        .attr("class", "link");

    link.exit().remove();

    node = node.data(nodes);

    texts = texts.data(nodes);
        

    node.enter().insert("circle", ".cursor")
        .attr("class", "node")
        .attr("r", function (d) { return d.radius; })
        .style("fill", function(d) {
            var scale = d3.scale.linear()
                .range([0, 255])
                .domain([min, max]);
            var sent = scale(d.sentiment),
                r = sent,
                g = 255 - sent;

            return("rgb(" + r+", "+g+",0)");
        })
        .call(force.drag);
    node.exit().remove();

    node.on('mouseover', function (d) {
        node.active = true;
        
        d.links.forEach(function (link) {
            link.state = 'active';
        });
    });

    node.on('mouseout', function (d) {
        node.active = false;
        d.links.forEach(function (link) {
            link.state = 'inactive';
        });
    });

    node.on('click', function (d) {
        if (curr_node == null) {
            d3.select('#neighbors')
              .style('display', 'block');
        }
        curr_node = d;
        showData(d);
    });

    texts.enter().append("text")
        .attr("class", "label")
        .attr("fill", "black")
        .style("pointer-events", "none")
        .text(function (d) {  return d.name + d.sentiment;  });

    texts.exit().remove();
    force.start();
}

function showData(node) {
    console.log(node.links);
    var info_panel = d3.select('#info').html(''),
        table_head = '<thead><tr><th>Source</th><th>Target</th><th># of Interactions<th></tr></thead>';
    info_panel.append('p')
        .html('Name: <span class="name">' + node.name + "</span>")
    info_panel.append('p')
        .html('Lines: ' + node.lines)
    info_panel.append('table')
        .attr('class', 'table table-striped')
        .html(table_head)
          .append('tbody')
            .attr('id', 'links')
    
    node.links.forEach(function (link) {
        var text = '';
        text = link.source.name + '->' + link.target.name + ': ' + link.interactions + ' interactions';
        list = info_panel.select('#links')
          .append('tr');
        list.append('td')
            .html(link.source.name);
        list.append('td')
            .html(link.target.name);
        list.append('td')
            .html(link.interactions);
    })
    

}

function removeNode(node) {
    // loop through links and destroy them.
    for (var i = 0; i < node.links.length; i++) {
        var link = node.links[i];
        links.splice(links.indexOf(link), 1);
    }
    nodes.splice(nodes.indexOf(node), 1);
}

