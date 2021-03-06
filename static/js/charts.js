﻿google.load("visualization", "1", {
  packages: ["corechart"]
});
var data;
var width = 2000;

var labelTestData = [{
  label: "tik.kand",
  times: [{
    "deadline_label": "kandin palautus",
    "starting_time": 1355759900000,
    "ending_time": 1355759900000
  }, {
    "starting_time": 1355774400000,
    "ending_time": 1355774400000
  }]
}, {
  label: "Tfy-3.1253",
  times: [{
    "starting_time": 1355761900000,
    "ending_time": 1355761900000
  }, ]
}, {
  label: "Tfy-3.1254",
  times: [{
    "starting_time": 1355761900000,
    "ending_time": 1355761900000
  }, ]
}, {
  label: "Mat-1.1720",
  times: [{
    "starting_time": 1355763910000,
    "ending_time": 1355763910000
  }]
}, {
  label: "T-110.2100",
  times: [{
    "starting_time": 1355763910000,
    "ending_time": 1355763910000
  }]
}, ];


function drawChart() {
  var mylist = document.getElementById("myList");
  var selectedValue = mylist.options[mylist.selectedIndex].text;
  //var selectedValue = 'Continuous';
  var rangeSelectionList = document.getElementById("rangeSelectionList");
  var selectedDate = rangeSelectionList.options[rangeSelectionList.selectedIndex].value;
  //var selectedDate = 7;
  console.log('selectedDate: ' + selectedDate);
  if (selectedValue == 'Continuous') {
    drawLineChart(selectedDate, false);
  } else if (selectedValue == 'Timeline') {
    timelineHover();
    setTouchevents();
  } else {
    drawColumnChart(selectedDate, false);
  }
}

function timelineHover() {
  var chart = d3.timeline()
    .display("circle")
    .width(2000)
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
    $("#scrolled_date").text(scale.invert(x) + " to " + scale.invert(x + width));
  });

  var svg = d3.select("#chart_holder").append("svg").attr("width", width)
    .datum(labelTestData).call(chart);
}

function setTouchevents() {
  $("#chart_holder #info circle").each(function() {
    $(this).bind("touchstart", function() {
      $(this).click();
    });
  });
}

function drawSameChart() {
  var mylist = document.getElementById("myList");
  var selectedValue = mylist.options[mylist.selectedIndex].text;
  var rangeSelectionList = document.getElementById("rangeSelectionList");
  var selectedDate = rangeSelectionList.options[rangeSelectionList.selectedIndex].value;
  console.log('selectedDate: ' + selectedDate);
  if (selectedValue == 'Continuous') {
    this.drawLineChart(selectedDate, true);
  } else {
    this.drawColumnChart(selectedDate, true);
  }
}

function drawLineChart(dateRange, useOldData) {
  var mylist = document.getElementById("myList");
  console.log('mylist is: ' + mylist);
  if (!useOldData) {
    data = new google.visualization.DataTable();
    data.addColumn('date', 'date');
    data.addColumn('number', 'tfy-3.1253');
    data.addColumn('number', 'mat-125.4254');
    data.addColumn('number', 't-106.1200');
    data.addColumn('number', 'tik.kand');
    var counter = 0;
    dateCounter = 1;
    monthCounter = 3;
    var alphaCounter = 0;
    var betaCounter = 0;
    var gammaCounter = 0;
    var deltaCounter = 0;
    var previousWeek = 0;
    for (var i = 0; i < 30; i++) {
      courseSelector = Math.floor((Math.random() * 4) + 1);
      counter++;
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
            [new Date(2013, monthCounter, dateCounter), alphaCounter, betaCounter, gammaCounter, deltaCounter]
          ]);
          console.log('case 1');
          break;
        case 2:
          betaCounter++;
          data.addRows([
            [new Date(2013, monthCounter, dateCounter), alphaCounter, betaCounter, gammaCounter, deltaCounter]
          ]);
          console.log('case 2');
          break;
        case 3:
          gammaCounter++;
          data.addRows([
            [new Date(2013, monthCounter, dateCounter), alphaCounter, betaCounter, gammaCounter, deltaCounter]
          ]);
          console.log('case 3');
          break;
        case 4:
          deltaCounter++;
          data.addRows([
            [new Date(2013, monthCounter, dateCounter), alphaCounter, betaCounter, gammaCounter, deltaCounter]
          ]);
          console.log('case 4');
          break;
      }

      if (dateCounter > 30) {
        dateCounter = dateCounter - 30;
        monthCounter++;
      }
      console.log('month counter: ' + monthCounter + 'date counter: ' + dateCounter + 'counter' + counter);
    }
  }
  var today = new Date();
  var nextRange = new Date();
  console.log('dateRange: ' + dateRange);
  nextRange.setDate(nextRange.getDate() + parseInt(dateRange));
  console.log('today: ' + today + 'nextRange: ' + nextRange);
  console.log('today: ' + today + 'nextRange: ' + nextRange);
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
}


/*
 * Draws a column Chart
 */

function drawColumnChart(dateRange, useOldData) {
  var mylist = document.getElementById("myList");
  console.log('mylist is: ' + mylist);

  data = new google.visualization.DataTable();
  data.addColumn('number', 'week');
  data.addColumn('number', 'tfy-3.1253');
  data.addColumn('number', 'mat-125.4254');
  data.addColumn('number', 't-106.1200');
  data.addColumn('number', 'tik.kand');
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

Date.prototype.getWeek = function() {
  var onejan = new Date(this.getFullYear(), 0, 1);
  return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 1) / 7);
}