//Application logic

var courseEnrollments;
var allCourses;

$(document).ready(function() {
  addBootstrapClasses();
  bindUiActions();
  initializeCourseEnrollments();
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

function initializeCourseEnrollments() {
  courseEnrollments = new CourseEnrollments();
  courseEnrollments.fetch({
    success: function(collection) {
      var courseEnrollmentsView = new CourseEnrollmentsView(
        {collection: courseEnrollments, el: '#courseList'}
      );
      courseEnrollmentsView.render();
    }
  });
}

function bindUiActions() {
  $('#courseNameSearch').bind('input', function(event) {
    searchCourses.search($(this).val(), allCourses);
  });
}

function addBootstrapClasses() {
  $('#newCourseModal').addClass('modal hide fade');
}
