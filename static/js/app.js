//Application logic
COURSE_SEARCH_URL = 'http://noppa-api-dev.aalto.fi/api/v1/courses?key=cdda4ae4833c0114005de5b5c4371bb8&search=';
var noppaCourseList = {};
var searchedNames = [];

$(document).ready(function() {
  var search = new Search();
  var courses = new Courses();
  courses.fetch({
    success: function(collection) {
      var courseListView = new CourseListView(
        {collection: courses, el: '#courseList'}
      );
      courseListView.render();
    }
  });
  $('#newCourseModal').addClass('modal hide fade');
  $('#courseNameSearch').bind('keyup', function(event) {
    search.search($(this).val());
  });
});

var Search = function() {
  var _this = this;
  _this.ajax = null;
  _this.search = function(name) {
    if (name.length > 0 && $.inArray(name, searchedNames) == -1) {
      searchedNames.push(name);
      _this.ajax = $.getJSON(COURSE_SEARCH_URL+name+'&callback=?', function(data) {
        $.each(data, function(index, course) {
          noppaCourseList[course.course_id] = course;
        });
        updateDatalist();
      });
    }
  };
  return _this;
}

function updateDatalist() {
  $('#courseDatalist').empty();
  $.each(noppaCourseList, function(index, course) {
    $('#courseDatalist').append('<option value="' + course.name + '">');
  });
}
