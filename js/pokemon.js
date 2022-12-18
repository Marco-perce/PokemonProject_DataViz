
const ctx = {
    w: 1080,
    h: 500,
    tot_pokemon : 800,
    all_types : ["Fire","Water","Grass","Bug","Electric","Normal","Ice","Fighting","Rock","Ground","Flying","Psychic","Poison","Ghost","Fairy","Dragon","Dark","Steel"],
    filter_generations : 0,
    filter_type : ["Fire","Water","Grass","Bug","Electric","Normal","Ice","Fighting","Rock","Ground","Flying","Psychic","Poison","Ghost","Fairy","Dragon","Dark","Steel"],
    color_type : ["#f44336", "#008CBA", "#4CAF50", "#6fbd09", "#fffb00", "#858585", "#00ffea", "#d36206", "#57300d", "#813c03", "#abfcff", "#852570", "#a200ff", "#35203f", "#ff00ff", "#ffa600", "#1a1919", "#3a3a39"],
    legendary: true,
    same_type: true,
    color_generation : "#66cafc",
    writing_color: ['white', 'white', 'white', 'white', 'black', 'white', 'black', 'white', 'white', 'white', 'black', 'white', 'white', 'white', 'white', 'white', 'white', 'white', ],
    svg: undefined,
    pok_index_to_matrix_position: undefined,
    matrix_position_to_csv_position: undefined,
    pokemon: undefined,
    combat: undefined,
    combat_length:0,
    filtered: undefined,
    tooltip: undefined,
    tspan_name: undefined,
    tspan_index: undefined,
    tspan_types: undefined,
    current_type: undefined,
    real_index_png: undefined,
  }

function clean_index(){
    ctx.real_index_png = new Array(ctx.tot_pokemon + 1);
    i=1;
    j=0;
    d3.csv("pokemon.csv", function(pokemon){
      var name = pokemon.Name;
      console.log(typeof name)
      if ((name.split(" ").length>1)&&(name.split(" ")[0]=="Mega")){
        if (name.split(" ").length>2){
          if (name.split(" ")[2]=="X"){
            ctx.real_index_png[j] = (i-1)+"-mega-x"
          }else{
            ctx.real_index_png[j] = (i-1)+"-mega-y"
          }
        }else{ctx.real_index_png[j] = (i-1)+"-mega"}
      }else{
        ctx.real_index_png[j] = i
        i++
      }
      j++
    })
};

  var setvalue = function(i){
    if (ctx.filter_type[i].length == 0){
        ctx.filter_type[i] = ctx.all_types[i];
        const btn = document.getElementById(ctx.all_types[i]);
        btn.style.backgroundColor = ctx.color_type[i];
        btn.style.color = ctx.writing_color[i];
    }else{
        ctx.filter_type[i] = "";
        const btn = document.getElementById(ctx.all_types[i]);
        btn.style.backgroundColor = 'grey';
        btn.style.color = 'black';
    }
    createGraph(ctx.svg);
};

var setgeneration = function(i){
    if (ctx.filter_generations == i){
    }else{
      var btn = document.getElementById(ctx.filter_generations+1);
      btn.style.backgroundColor = "grey";
      ctx.filter_generations = i;
      btn = document.getElementById(i+1);
      btn.style.backgroundColor = "white";
    }
    createGraph(ctx.svg);
};

var setlegendary = function(){
  if (ctx.legendary){
    ctx.legendary = false;
    const btn = document.getElementById("legendaires");
    btn.style.backgroundColor = "grey";
    btn.value = "legendaires: non";
  }else{
    ctx.legendary = true;
    const btn = document.getElementById("legendaires");
    btn.style.backgroundColor = "white";
    btn.value = "legendaires: oui";

  }
  createGraph(ctx.svg);
}

var setsametype = function(){
  if (ctx.same_type){
    ctx.same_type = false;
    const btn = document.getElementById("same_type");
    btn.style.backgroundColor = "grey";
    btn.value = "non";
  }else{
    ctx.legendary = true;
    const btn = document.getElementById("same_type");
    btn.style.backgroundColor = "white";
    btn.value = "oui";

  }
  createGraph(ctx.svg);
}
var test_same_type = function(combat, pokemons){
  if (ctx.same_type){
    return true
  }
  if (pokemons[ctx.matrix_position_to_csv_position[ctx.pok_index_to_matrix_position[combat.First_pokemon]]].types[0]==pokemons[ctx.matrix_position_to_csv_position[ctx.pok_index_to_matrix_position[combat.Second_pokemon]]].types[0]){
    return false
  }
  return true
}

var test_leg= function(pokemon){
  if (ctx.legendary){
    return true
  }
  if (pokemon["legendary"]=="False"){
    return true
  }
  return false
}

function test_type(data, filter_type){
    return (filter_type.includes(data["types"][0]))
}

function is_not_filtered(data, pok_index_to_matrix_position){
    if (typeof pok_index_to_matrix_position[parseInt(data["First_pokemon"])] == typeof 0
        && typeof pok_index_to_matrix_position[parseInt(data["Second_pokemon"])] == typeof 0){
            return true
    }else{
        return false
    }
}

function reformate(pokemon){
    var types = pokemon["types"].substring(2,pokemon["types"].length-2);
    if (types.includes(",")){
        types_splited = types.split("', '");
    }else{
        types_splited = Array(types);
    }
    pokemon["types"] = types_splited;
}

function fill_matrix(n_pokemon, filter_type, filter_generations){
    ctx.pok_index_to_matrix_position = new Array(n_pokemon+1);
    ctx.matrix_position_to_csv_position = new Array(n_pokemon + 1);
    ctx.pokemon = new Array (n_pokemon+1);
    ctx.combat = new Array(50003)
    var nb_filtered_pokemon=0;
    var i = 0;
    var matrix = d3.csv("pokemon_formated.csv", function (pokemon){
        reformate(pokemon);
        ctx.pokemon[i] = pokemon
        if (test_type(pokemon, filter_type) &&
            (filter_generations + 1 == parseInt(pokemon["generation"])) &&
            test_leg(pokemon)){
            ctx.pok_index_to_matrix_position[parseInt(pokemon["index"])] = nb_filtered_pokemon;
            nb_filtered_pokemon++;
            ctx.matrix_position_to_csv_position[nb_filtered_pokemon-1] = i;
            };
          i++;
    }).then(function(){
        var matrix = new Array(nb_filtered_pokemon);
        for(var i=0; i<nb_filtered_pokemon; i++){
            matrix[i] = new Array(nb_filtered_pokemon);
            for (var j=0; j<nb_filtered_pokemon; j++ ){
                matrix[i][j] = 0
            }
        }
        ctx.combat_length = 0
        d3.csv("combats.csv", function (data){
            if (is_not_filtered(data, ctx.pok_index_to_matrix_position)){
              if (test_same_type(data, ctx.pokemon)){
            matrix = fill_cell(data, matrix, ctx.pok_index_to_matrix_position);
            ctx.combat[ctx.combat_length] = data
            ctx.combat_length++
          }
        }})
        return matrix
    })
    return matrix

}

function fill_cell(combat, matrix, pok_index_to_matrix_position){
    var pok1 = pok_index_to_matrix_position[parseInt(combat["First_pokemon"])];
    var pok2 = pok_index_to_matrix_position[parseInt(combat["Second_pokemon"])];
    if (pok1 == pok_index_to_matrix_position[parseInt(combat["Winner"])]){
        matrix[pok1][pok2] = 2;
        matrix[pok2][pok1] = 1;
    }else{
        matrix[pok1][pok2] = 2;
        matrix[pok2][pok1] = 1;
    }
    return matrix
}

function onmouseovered(d) {
  var filtered = new Array(ctx.tot_pokemon+1)
  for(var i = 0; i<ctx.combat_length; i++){
    if (ctx.combat[i] == undefined){
    }else if (d["target"]["__data__"]["index"]== ctx.pok_index_to_matrix_position[parseInt(ctx.combat[i].First_pokemon)] || d["target"]["__data__"]["index"]== ctx.pok_index_to_matrix_position[parseInt(ctx.combat[i].Second_pokemon)]){
      filtered[ctx.combat[i].First_pokemon] = true
      filtered[ctx.combat[i].Second_pokemon] = true
    }
  }
  d3.selectAll('.ribbon')
      .filter(function(l) {return(l.target.index === d["target"]["__data__"]["index"]||l.source.index===d["target"]["__data__"]["index"])==false})
      .attr("opacity", 0);

  d3.selectAll('.node')
    .filter(function(l){return (filtered[ctx.pok_index_to_matrix_position.indexOf(l.index)]==undefined)})
    .attr("opacity",0);
  var tspan = document.getElementsByClassName("tooltip");
  tspan[0].textContent="Pokemon:"
  var tspan = document.getElementsByClassName("name");
  tspan[0].textContent="name : " + ctx.pokemon[ctx.matrix_position_to_csv_position[parseInt(d["target"]["__data__"]["index"])]].name
  var tspan = document.getElementsByClassName("index");
  tspan[0].textContent="index : " + (ctx.real_index_png[ctx.pokemon[ctx.matrix_position_to_csv_position[parseInt(d["target"]["__data__"]["index"])]].index-1])
  var tspan = document.getElementsByClassName("types");
  tspan[0].textContent="types : " + ctx.pokemon[ctx.matrix_position_to_csv_position[parseInt(d["target"]["__data__"]["index"])]].types
  var image = d3.select("svg").append("image");
  image.attr("href", "/PokemonProject_DataViz/image_pokemon/"+(ctx.real_index_png[ctx.pokemon[ctx.matrix_position_to_csv_position[parseInt(d["target"]["__data__"]["index"])]].index-1])+".png")
  image.attr("opacity", 0.5);
  image.attr("width", "300px");
  image.attr("height", "300px");
  image.attr("x", -150);
  image.attr("y", -150);
  }

function type_text(d){
    if(ctx.pokemon[ctx.matrix_position_to_csv_position[d.index]].types[0] == ctx.current_type){
      return '';
    }
    else{
      ctx.current_type = ctx.pokemon[ctx.matrix_position_to_csv_position[d.index]].types[0];
      if(d.startAngle < Math.PI){return `${ctx.current_type} ↓`;}
      else{return `↑ ${ctx.current_type}`;}
  }
  }


function onmouseouted(d) {
  var filtered = new Array(ctx.tot_pokemon+1)
  for(var i = 0; i<ctx.combat_length; i++){
    if (ctx.combat[i] == undefined){
    }else if (d["target"]["__data__"]["index"]== ctx.pok_index_to_matrix_position[parseInt(ctx.combat[i].First_pokemon)] || d["target"]["__data__"]["index"]== ctx.pok_index_to_matrix_position[parseInt(ctx.combat[i].Second_pokemon)]){
      filtered[ctx.combat[i].First_pokemon] = true
      filtered[ctx.combat[i].Second_pokemon] = true
    }else{}
  }
  d3.selectAll('.ribbon')
      .filter(function(l) {return(l.target.index === d["target"]["__data__"]["index"]||l.source.index===d["target"]["__data__"]["index"])==false})
      .attr("opacity", 1);

  d3.selectAll('.node')
    .filter(function(l){return (filtered[ctx.pok_index_to_matrix_position.indexOf(l.index)]==undefined)})
    .attr("opacity",1);

  var tspan = document.getElementsByClassName("tooltip");
  tspan[0].textContent=""
  var tspan = document.getElementsByClassName("name");
  tspan[0].textContent=""
  var tspan = document.getElementsByClassName("index");
  tspan[0].textContent=""
  var tspan = document.getElementsByClassName("types");
  tspan[0].textContent=""
  d3.selectAll("image").remove();

}

function launch(){
  ctx.svg = d3.select("#main").append("svg");
  ctx.svg.attr("transform", "translate(0,20)");
  ctx.svg.attr("viewBox", [-ctx.w / 2, -ctx.h / 2, ctx.w, ctx.h]);
  createGraph(ctx.svg);
}

function color(index, pokemon){
  var colors = ["#FF5733", "#33C0FF", "#4ADC38", "#C7ED3E", "#F8FF0C",  "#CBCBBE", "#00ffea", "#C95116",  "#C8793D","#F0B037", "#A6DBF2", "#F08EF4", "#A358DE","#593B70", "#D9198A", "#502DD3", "#3E3E3E", "#E5E5E5"]
  var names =  ["Fire","Water", "Grass", "Bug", "Electric", "Normal","Ice","Fighting","Rock","Ground","Flying","Psychic", "Poison", "Ghost", "Fairy", "Dragon", "Dark", "Steel"]
  var types = pokemon[ctx.matrix_position_to_csv_position[index]].types;
  var type = types.split("'")[1]
  return colors[names.indexOf(type)]
}

function color_ribbon(d, pokemon){
  var colors = ["#FF5733", "#33C0FF", "#4ADC38", "#C7ED3E", "#F8FF0C",  "#CBCBBE", "#00ffea", "#C95116",  "#C8793D","#F0B037", "#A6DBF2", "#F08EF4", "#A358DE","#593B70", "#D9198A", "#502DD3", "#3E3E3E", "#E5E5E5"]
  var names =  ["Fire","Water", "Grass", "Bug", "Electric", "Normal","Ice","Fighting","Rock","Ground","Flying","Psychic", "Poison", "Ghost", "Fairy", "Dragon", "Dark", "Steel"]
  var types = pokemon[ctx.matrix_position_to_csv_position[d.source.index]].types;
  var type = types.split("'")[1]
  return colors[names.indexOf(type)]
}

function createGraph(svg){
  svg.selectAll("*").remove();

  // create the svg area
  fill_matrix(ctx.tot_pokemon, ctx.filter_type, ctx.filter_generations).then(function(matrix){

  d3.csv("pokemon_formated.csv").then(function (pokemon){

  outerRadius = Math.min(ctx.w, ctx.h) * 0.5 - 50
  innerRadius = outerRadius - 10

  // formatValue = d3.format(".1~%")

  var ribbon = d3.ribbon()
      .radius(innerRadius - 1)
      .padAngle(0)

  var arc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)

  var chord = d3.chord()
      .padAngle(0)
      .sortSubgroups(d3.descending)
      .sortChords(d3.descending)

  var chords = chord(matrix)

  const group = svg.append("g")
    .attr("font-size", 10)
    .attr("font-family", "sans-serif")
  .selectAll("g")
  .data(chords.groups)
  .join("g");

  // Draw the contour
  group.append("path")
    .attr("fill", function(d){return color(d.index,pokemon)})
    .attr("d", arc)
    .attr("class", "node")
    .attr('id', function(d,i){return ctx.pokemon[ctx.matrix_position_to_csv_position[i]].index})
    .attr("name", function(d,i){return ctx.pokemon[ctx.matrix_position_to_csv_position[i]].name})
    .attr("type", function(d,i){return ctx.pokemon[ctx.matrix_position_to_csv_position[i]].types})

    group.append("text")
      .each(d => (d.angle = (d.startAngle + d.endAngle) / 2))
      .attr("dy", "0.35em")
      .attr("transform", d => `
        rotate(${(d.angle * 180 / Math.PI - 90)})
        translate(${outerRadius + 5})
        ${d.angle > Math.PI ? "rotate(180)" : ""}
      `)
      .attr("text-anchor", d => d.angle > Math.PI ? "end" : null)
      .text(function(d){return type_text(d)});

  // Draw the links
  svg.append("g")
    // Create the links
    .selectAll("path")
    .data(chords)
    .join("path")
    .attr("d", ribbon)
    .attr("class", "ribbon")
    .attr("fill-opacity", 0.9) // Fix the opacity of the link
    .attr("fill", function(d) {return color_ribbon(d, pokemon)}) // Fill the links
  let node = document.getElementsByClassName("node") 
  for(i=0;i<node.length; i++){
    node[i].addEventListener("mouseenter", function( event ) {
      onmouseovered(event)
    })
    node[i].addEventListener("mouseleave", function( event ) {
      onmouseouted(event)
    })

  };
  var tooltip = svg.append("text");
  tooltip.attr("class", 'tooltip');
  tooltip.attr("x", -ctx.w/2 + 40);
  tooltip.attr("y", -ctx.h/2 + 50);

  var tspan_name = svg.append("text");
  tspan_name.attr("class", 'name');
  tspan_name.attr("x", -ctx.w/2 + 40);
  tspan_name.attr("y", -ctx.h/2 + 75);

  var tspan_index = svg.append("text");
  tspan_index.attr("class", 'index');
  tspan_index.attr("x", -ctx.w/2 + 40);
  tspan_index.attr("y", -ctx.h/2 + 95);

  var tspan_types = svg.append("text");
  tspan_types.attr("class", 'types');
  tspan_types.attr("x", -ctx.w/2 + 40);
  tspan_types.attr("y", -ctx.h/2 + 115);

})
})
  clean_index()
  console.log(ctx.real_index_png)
};