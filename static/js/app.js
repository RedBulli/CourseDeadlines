//Application logic

var courseAttendances;
var allCourses;

$(document).ready(function() {
  addBootstrapClasses();
  bindUiActions();
  initializeCourseAttendances();
  initializeNoppaCourses();
});

function initializeNoppaCourses() {
  allCourses = new NoppaCourses();
  searchCourses = new NoppaCourses();
  var searchListView = new CourseSearchListView(
    {collection: searchCourses, el: '#searchResults'}
  );
  var datalistView = new CourseDataListView({collection: allCourses});
}

function initializeCourseAttendances() {
  courseAttendances = new CourseAttendances();
  courseAttendances.fetch({
    success: function(collection) {
      var courseAttendancesView = new CourseAttendancesView(
        {collection: courseAttendances, el: '#courseList'}
      );
      courseAttendancesView.render();
    }
  });
}

function bindUiActions() {
  $('#courseNameSearch').bind('keyup', function(event) {
    searchCourses.search($(this).val(), allCourses);
  });
}

function addBootstrapClasses() {
  $('#newCourseModal').addClass('modal hide fade');
}