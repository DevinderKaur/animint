// Define functions to render linked interactive plots using d3.

// Another script should define e.g.
// <script>
//   var plot = new animint("#plot","plot.json");
// </script>


// Constructor for animint Object.
function animint(to_select, json_file, svg_width, svg_height){
    var element = d3.select(to_select);
    this.element = element;
    var Selectors = {};
    this.Selectors = Selectors;
    var Plots = {};
    this.Plots = Plots;
    var Geoms = {};
    this.Geoms = Geoms;
    var SVGs = {};
    this.SVGs = SVGs;
    var getcol = function(v_name){
	return function(d){return d[v_name];};
    }
    var add_geom = function(g_name, g_info){
	d3.csv(g_info.data, function(error, response){
	    var nest = d3.nest();
	    for(var aes_name in g_info.subset){
		var v_name = g_info.subset[aes_name];
		//alert(aes_name+" "+g_info.classed+" "+v_name);
		nest.key(getcol(v_name));
	    }
	    g_info.data = nest.map(response);
	    Geoms[g_name] = g_info;
	    update_geom(g_name);
	});
    }
    var add_plot = function(p_name, p_info){
	var svg = element.append("svg")
	    .attr("id",p_name)
	    .attr("height",svg_height)
	    .attr("width",svg_width)
	;
	svg.x = d3.scale.linear()
	    .domain(p_info.ranges.x)
	    .range([0,svg.attr("width")]);
	svg.y = d3.scale.linear()
	    .domain(p_info.ranges.y)
	    .range([svg.attr("height"),0]);
	p_info.geoms.forEach(function(g_name){
	    SVGs[g_name] = svg;
	});
	Plots[p_name] = p_info;
    }
    var add_selector = function(s_name, s_info){
	Selectors[s_name] = s_info;
    }
    var update_geom = function(g_name){
	var svg = SVGs[g_name];
	var g_info = Geoms[g_name];
	var data = g_info.data;
	for(aes_name in g_info.subset){
	    if(aes_name != "group"){
		var v_name = g_info.subset[aes_name];
		var value = Selectors[v_name].selected;
		data = data[value];
	    }
	}
	var aes = g_info.aes;
	var toX = function(d){
	    return svg.x(d[aes.x]);
	}
	var toY = function(d){
	    return svg.y(d[aes.y]);
	}
	var elements = svg.selectAll("."+g_info.classed);
	if(g_info.geom == "line"){
	    // we need to use a path.
	    var kv = d3.entries(d3.keys(data));
	    var lineThing = d3.svg.line()
		.x(toX)
		.y(toY)
	    ;
	    elements.data(kv)
		.enter()
		.append("path")
		.attr("d",function(d){
		    var one_group = data[d.value];
		    return lineThing(one_group);
		})
	    ;
	}
    }
    var update_selector = function(v_name, value){
	Selectors[v_name].selected = value;
	Selectors[v_name].hilite.forEach(update_geom);
	Selectors[v_name].subset.forEach(update_geom);
    }
    
    // Download the main description of the interactive plot.
    d3.json(json_file,function(error, response){
	// Add plots.
	for(var p_name in response.plots){
	    add_plot(p_name, response.plots[p_name]);
	}
	// Add selectors.
	for(var s_name in response.selectors){
	    add_selector(s_name, response.selectors[s_name]);
	}
	// Add geoms and construct nest operators.
	for(var g_name in response.geoms){
	    add_geom(g_name, response.geoms[g_name]);
	}
    });
}