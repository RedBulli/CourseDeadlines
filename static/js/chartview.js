google.load("visualization", "1", {
  packages: ["corechart"]
});

Date.prototype.getWeek = function() {
  var onejan = new Date(this.getFullYear(), 0, 1);
  return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 1) / 7);
}

var ChartView = Backbone.View.extend({
  initialize: function() {
    this.width = 2000;
    this.template = Handlebars.compile($("#landscape_tmpl").html());
  },
  render: function() {
    this.$el.html(this.template());
    this.bindChanges();
    this.drawChart();
  },
  bindChanges: function() {
    var _this = this;
    $('#myList, #rangeSelectionList').change(function() {
      _this.drawChart();
    });
  },
  drawChart: function(selectedValue, selectedDate) {
    var selectedValue = $('#myList').val();
    var selectedDate = $('#rangeSelectionList').val();
    if (selectedValue == 'Continuous') {
      this.drawLineChart(selectedDate, false);
    } else if (selectedValue == 'Timeline') {
      this.timelineHover();
      this.setTouchevents();
    } else {
      this.stackedBars(selectedDate, false);
    }
  },
  getDeadlinesJSON: function() {
    var deadlines = this.collection.getAssignments();
    var jsonList = [];
    var _this = this;
    $.each(deadlines, function(index, deadline) {
      var element = {};
      element.label = deadline.get('title');
      element.times = _this.dateToStartEnd(deadline.get('deadline'));
      jsonList.push(element);
    });
    return jsonList;
  },
  dateToStartEnd: function(dateString) {
    var date = new Date(Date.parse(dateString));
    return [{
      starting_time: date - 2000000000,
      ending_time: date
    }];
  },
  
  stackedBars: function(){
  
  function bumpLayer(n, o) {

    function bump(a) {
      var x = 1 / (.1 + Math.random()),
        y = 2 * Math.random() - .5,
        z = 10 / (.1 + Math.random());
        for (var i = 0; i < n; i++) {
          var w = (i / n - y) * z;
          a[i] += x * Math.exp(-w * w);
        }
      }
    var a = [], i;
    for (i = 0; i < n; ++i){
	  a[i] = o + o * Math.random();
	}
	
    for (i = 0; i < 5; ++i){
	  bump(a);
	}
    return a.map(function(d, i) { return {x: i, y: Math.max(0, d)}; });
  }

  function change() {
    clearTimeout(timeout);
    if (this.value === "grouped"){
	  transitionGrouped();
	}
    else{
	  transitionStacked();
	}
  }
  
  
    n = this.collection.size(), // number of layers
      m = 58, // number of samples per layer
      stack = d3.layout.stack(),
      layers = stack(d3.range(n).map(function() { return bumpLayer(m, .1); })),
      yGroupMax = d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d.y; }); }),
      yStackMax = d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); });
	
	
    var margin = {top: 40, right: 10, bottom: 20, left: 10},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

    var x = d3.scale.ordinal()
      .domain(d3.range(m))
      .rangeRoundBands([0, width], .08);

    var y = d3.scale.linear()
      .domain([0, yStackMax])
      .range([height, 0]);

    var color = d3.scale.linear()
      .domain([0, n - 1])
      .range(["#aad", "#556"]);

    var xAxis = d3.svg.axis()
      .scale(x)
      .tickSize(0)
      .tickPadding(6)
      .orient("bottom");

    var svg = d3.select("body").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var layer = svg.selectAll(".layer")
      .data(layers)
      .enter().append("g")
      .attr("class", "layer")
      .style("fill", function(d, i) { return color(i); });

    var rect = layer.selectAll("rect")
      .data(function(d) { return d; })
      .enter().append("rect")
      .attr("x", function(d) { return x(d.x); })
      .attr("y", height)
      .attr("width", x.rangeBand())
      .attr("height", 0);

    rect.transition()
      .delay(function(d, i) { return i * 10; })
      .attr("y", function(d) { return y(d.y0 + d.y); })
      .attr("height", function(d) { return y(d.y0) - y(d.y0 + d.y); });

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    d3.selectAll("input").on("change", change);

    var timeout = setTimeout(function() {
      d3.select("input[value=\"grouped\"]").property("checked", true).each(change);
      }, 2000);
	},
  


  
  
  timelineHover: function() {
    var chart = d3.timeline()
      .display("circle")
      .width(this.width)
      .stack()
      .margin({
      left: 200,
      right: 30,
      top: 0,
      bottom: 0
    })
      .tickFormat({
      format: d3.time.format("%d.%m. %H:%M"),
      tickTime: d3.time.hours,
      tickNumber: 24,
      tickSize: 6
    })
      .hover(function(d, i, datum) {
      // d is the current rendering object
      // i is the index during d3 rendering
      // datum is the id object

      var colors = chart.colors();
      //sdiv.find('.coloredDiv').css('background-color', colors(i))
    })
      .click(function(d, i, datum) {
      var div = $('#chart_holder');
      div.find("#info").html(datum.label + "<br />" + datum.times[0].deadline_label);
    })
      .scroll(function(x, scale) {
      $("#scrolled_date").text(scale.invert(x) + " to " + scale.invert(x + this.width));
    });

    var svg = d3.select("#chart_holder").append("svg").attr("width", this.width)
      .datum(this.getDeadlinesJSON()).call(chart);
  },
  setTouchevents: function() {
    $("#chart_holder #info circle").each(function() {
      $(this).bind("touchstart", function() {
        $(this).click();
      });
    });
  },
  drawLineChart: function(dateRange, useOldData) {
    var data = new google.visualization.DataTable();
    data.addColumn('date', 'date');
    this.collection.each(function(course) {
      data.addColumn('number', course.get('noppa_course').get('name'));
    });
    var firstDate = new Date();
    var lastDate;
    for (var i = 0; i < dateRange; i++) {
      lastDate = new Date(firstDate.getTime() + i * 24 * 60 * 60 * 1000);
      var rowData = [];
      rowData.push(lastDate);
      this.collection.each(function(course) {
        rowData.push(course.getWorkload(lastDate));
      });
      data.addRows([rowData]);
    }
    var options = {
      title: 'Course Work Load',
      isStacked: true,
      displayAnnotations: true,
      hAxis: {
        viewWindowMode: 'explicit',
        viewWindow: {
          min: firstDate,
          max: lastDate
        }
      },
      pointSize: 2
    };

    var chart = new google.visualization.AreaChart(document.getElementById('chart_div'));
    chart.draw(data, options);
  },
  drawColumnChart: function(dateRange, useOldData) {
    var mylist = document.getElementById("myList");
    console.log('mylist is: ' + mylist);

    var data = new google.visualization.DataTable();
    data.addColumn('number', 'week');
    this.collection.each(function(course) {
      data.addColumn('number', course.get('title'));
    });
    dateCounter = 1;
    monthCounter = 3;
    var alphaCounter = 0;
    var betaCounter = 0;
    var gammaCounter = 0;
    var deltaCounter = 0;
    var previousWeek = 0;
    for (var i = 0; i < 30; i++) {
      courseSelector = Math.floor((Math.random() * 4) + 1);
      dateCounter = dateCounter + Math.floor((Math.random() * 4) + 1);
      var date = new Date(2013, monthCounter, dateCounter);
      var week = date.getWeek();
      if (week > previousWeek) {
        previousWeek = week;
        var alphaCounter = 0;
        var betaCounter = 0;
        var gammaCounter = 0;
        var deltaCounter = 0;
      }
      switch (courseSelector) {
        case 1:
          alphaCounter++;
          data.addRows([
            [week, alphaCounter, betaCounter, gammaCounter, deltaCounter]
          ]);
          console.log('case 1');
          break;
        case 2:
          betaCounter++;
          data.addRows([
            [week, alphaCounter, betaCounter, gammaCounter, deltaCounter]
          ]);
          console.log('case 2');
          break;
        case 3:
          gammaCounter++;
          data.addRows([
            [week, alphaCounter, betaCounter, gammaCounter, deltaCounter]
          ]);
          console.log('case 3');
          break;
        case 4:
          deltaCounter++;
          data.addRows([
            [week, alphaCounter, betaCounter, gammaCounter, deltaCounter]
          ]);
          console.log('case 4');
          break;
      }

      if (dateCounter > 30) {
        dateCounter = dateCounter - 30;
        monthCounter++;
      }
    }
    var options = {
      title: 'Course Work Load',
      isStacked: true,
      displayAnnotations: true
    };

    var chart = new google.visualization.ColumnChart(document.getElementById('chart_div'));
    chart.draw(data, options);
  }
});