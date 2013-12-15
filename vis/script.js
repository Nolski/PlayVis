var width = window.innerWidth,
    height = window.innerHeight,
    nodes = [],
    links = [],
    linkNames = [];

var force = d3.layout.force()
    .size([width, height])
    .nodes(nodes)
    .links([])
    .linkStrength(1)
    .linkDistance(110)
    .charge(function (d) {
        if(d.status == 'active') {
            return -600;
        } else {
            return -300;
        }
    })
    .on("tick", tick);

var svg = d3.select("body").append("svg")
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

d3.json('output.json', function (error, json) {
    var timeline = d3.scale.linear()
            .range([0, 100])
            .domain([0, json.length]);
    var i = 0;
    window.id = window.setInterval(function () {
        update();
        if (i >= json.length) {
            return;
        }
        
        var time_width = timeline(i);
        d3.select('#time')
            .attr('style', 'width: ' + time_width + '%');

        var d = json[i];
    
        if (d.current_char in node_names == false) { // if new character
            var node = { name: d.current_char, lines: 5, sentiment: d.sentiment, last_line: i };
            
            nodes.push(node);
            node_names[d.current_char] = node;
        } else {
            node_names[d.current_char].lines += 0.1; // increment character size
        }

        var current_char = node_names[d.current_char];

        if (d.last_char != null) { //make sure our character is talking to someone
            if (d.last_char in node_names) { // Make sure the previous character is not null
                
                // HANDLE LINKING ////////////
                var currLink = {
                        source: current_char, 
                        target: node_names[d.last_char], 
                        style: 'inactive'
                    },
                    linkName = current_char.name  +'-'+ node_names[d.last_char].name;

                if (linkNames.indexOf(linkName) == -1) {
                    linkNames.push(linkName)
                    links.push(currLink); // create a link

                    if (current_char['links'] == undefined){
                        current_char['links'] = [];
                    }

                    current_char['links'].push(currLink);
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
    }, 1);
});


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
      .attr("r", function (d) { return d.lines })
      .attr("style", function (d) {
            var scale = d3.scale.linear()
                .range([0, 255])
                .domain([min, max]);
            var sent = scale(d.sentiment),
                g = Math.floor(sent),
                r = Math.floor(255 - sent);
            return("fill:rgb(" + r+", "+g+",0)");
        });

    texts.attr("transform", function (d) {
        return "translate(" + d.x + "," + d.y + ")";
    })
    .text(function (d) {  return d.name + ' (' + d.sentiment + ')';  });
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

    node = node.data(nodes);

    texts = texts.data(force.nodes());
        

    node.enter().insert("circle", ".cursor")
        .attr("class", "node")
        .attr("r", function (d) { return d.lines; })
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

    node.exit()
        .transition()
        .attr("x",320)
        .each("end",function() { 
        d3.select(this).       // so far, as above
            remove();            // we delete the object instead 
        });

    node.on('mouseover', function (d) {
        node.active = true;
        // TODO: Display some information or something on the node
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

    texts.enter().append("text")
        .attr("class", "label")
        .attr("fill", "black")
        .style("pointer-events", "none")
        .text(function (d) {  return d.name + d.sentiment;  });


    force.start();
}

