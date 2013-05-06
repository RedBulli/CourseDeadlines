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
    _.bindAll(this, 'render');
    this.collection.bind('add', this.render);
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
    //var selectedDate = $('#rangeSelectionList').val();
    if (selectedValue == 'Continuous') {
      this.drawLineChart(30, false);
    } else {
      this.googleColumnChart();
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
  googleColumnChart: function() {
    var data = new google.visualization.DataTable();
    data.addColumn('date', 'date');
    this.collection.each(function(course) {
      data.addColumn('number', course.get('noppa_course').get('name'));
    });
    var firstDate = new Date();
    var lastDate;
    for (var i = 0; i < 7; i++) {
      lastDate = new Date(firstDate.getTime() + i * 24 * 60 * 60 * 1000);
      var rowData = [];
      rowData.push(lastDate);
      this.collection.each(function(course) {
        rowData.push(course.getWorkload(lastDate));
      });
      data.addRows([rowData]);
    }
    new google.visualization.ColumnChart(document.getElementById('chart_div')).
    draw(data, {
      title: "Assignments workload",
      width: 600,
      height: 400,
      hAxis: {
        title: "Date"
      },
      isStacked: true
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
});