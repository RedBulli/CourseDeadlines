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
    this.lastSelection;
    this.template = Handlebars.compile($("#landscape_tmpl").html());
    _.bindAll(this, 'render');
    this.collection.bind('add', this.render);
  },
  render: function() {
    this.$el.html(this.template());
    this.bindChanges();
    if (this.lastSelection) {
      $('#myList').val(this.lastSelection);
    }
    this.drawChart(this.lastSelection);
  },
  bindChanges: function() {
    var _this = this;
    $('#myList, #rangeSelectionList').change(function() {
      _this.lastSelection = $('#myList').val();
      _this.drawChart(_this.lastSelection);
    });
  },
  drawChart: function(selectedValue, selectedDate) {
    if (selectedValue == 'timeLine') {
      this.timelineHover()
    } else {
      var val = $('#myList').val();
      if (selectedValue) {
        val = selectedValue;
      }
      this.googleColumnChart(val);
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
      starting_time: date,
      ending_time: date
    }];
  },
  getDailyData: function() {
    var data = new google.visualization.DataTable();
    var firstDate = new Date();
    var lastDate;
    data.addColumn('date', 'date');
    this.collection.each(function(course) {
      data.addColumn('number', course.get('noppa_course').get('name'));
    });
    for (var i = 0; i < 7; i++) {
      lastDate = new Date(firstDate.getTime() + i * 24 * 60 * 60 * 1000);
      var rowData = [];
      rowData.push(lastDate);
      this.collection.each(function(course) {
        rowData.push(course.getWorkload(lastDate));
      });
      data.addRows([rowData]);
    }
    return data;
  },
  getWeeklyData: function() {
    var data = new google.visualization.DataTable();
    var firstDate = new Date();
    var lastDate;
    data.addColumn('number', 'week');
    this.collection.each(function(course) {
      data.addColumn('number', course.get('noppa_course').get('name'));
    });
    for (var i = 0; i < 7; i++) {
      var dateObject = new Date(firstDate.getTime() + i * 7 * 24 * 60 * 60 * 1000);
      lastDate = dateObject.getWeek();
      var rowData = [];
      rowData.push(lastDate);
      this.collection.each(function(course) {
        rowData.push(course.getWeeklyWorkload(dateObject));
      });
      data.addRows([rowData]);
    }
    return data;
  },
  getMonthlyData: function() {
    var data = new google.visualization.DataTable();
    var firstDate = new Date();
    var lastDate;
    data.addColumn('number', 'month');
    this.collection.each(function(course) {
      data.addColumn('number', course.get('noppa_course').get('name'));
    });
    for (var i = 0; i < 7; i++) {
      var dateObject = new Date(firstDate.getFullYear(), firstDate.getMonth(lastDate + 1));
      lastDate = dateObject.getMonth();
      var rowData = [];
      rowData.push(lastDate + 1);
      this.collection.each(function(course) {
        rowData.push(course.getMonthlyWorkload(dateObject));
      });
      data.addRows([rowData]);
    }
    return data;
  },
  googleColumnChart: function(group) {
    var data;
    var title;
    if (group == 'daily') {
      data = this.getDailyData();
      title = 'Date';
    } else if (group == 'weekly') {
      data = this.getWeeklyData();
      title = 'Week';
    } else {
      data = this.getMonthlyData();
      title = 'Month';
    }
    new google.visualization.ColumnChart(document.getElementById('chart_div')).
    draw(data, {
      title: "Assignments workload",
      width: 600,
      height: 400,
      hAxis: {
        title: title
      },
      isStacked: true
    });
  },

  timelineHover: function() {
    var chart = d3.timeline()
      .display("circle")
      .width(2000)
      .stack()
      .margin({
      left: 250,
      right: 30,
      top: 0,
      bottom: 0
    })
      .tickFormat({
      format: d3.time.format("%d.%m"),
      tickTime: d3.time.days,
      tickNumber: 3,
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
      var div = $('#chart_div');
      div.find("#info").html(datum.label + "<br />" + datum.times[0].deadline_label);
    })
      .scroll(function(x, scale) {
      $("#scrolled_date").text(scale.invert(x) + " to " + scale.invert(x + this.width));
    });

    $('#chart_div').html("");
    $('#chart_div').css('width', '98%');
    $('#chart_div').css('overflow', 'hidden');
    var svg = d3.select("#chart_div").append("svg").attr("width", this.width)
      .datum(this.getDeadlinesJSON()).call(chart);
  $('#chart_div').find('svg:first').draggable({ axis: "x" });
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
});