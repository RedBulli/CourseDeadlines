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
      this.drawColumnChart(selectedDate, false);
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
    var date = new Date();
    for (var i = 0; i < dateRange; i++) {
      date = new Date(date.getTime() + i * 24 * 60 * 60 * 1000);
      var rowData = [];
      rowData.push(date);
      this.collection.each(function(course) {
        rowData.push(course.getWorkload(date));
      });
      data.addRows([rowData]);
    }
    var today = new Date();
    var nextRange = new Date();
    nextRange.setDate(nextRange.getDate() + parseInt(dateRange));
    var options = {
      title: 'Course Work Load',
      isStacked: true,
      displayAnnotations: true,
      hAxis: {
        viewWindowMode: 'explicit',
        viewWindow: {
          min: today,
          max: nextRange
        }
      }
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