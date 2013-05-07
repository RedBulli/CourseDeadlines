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
    this.googleColumnChart($('#myList').val());
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
      var dateObject = new Date(firstDate.getFullYear(), firstDate.getMonth(lastDate+1));
      lastDate = dateObject.getMonth();
      var rowData = [];
      rowData.push(lastDate+1);
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