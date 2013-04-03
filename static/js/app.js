//Application logic

var courseEnrollments;
var allCourses;
var searchCourses;
var organizations = [];

$(document).ready(function() {
  addBootstrapClasses();
  initializeCourseEnrollments();
  initializeNoppaCourses();
  bindUiActions();
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
    var searchValue = $(this).val();
    if (searchValue.length > 2) {
      courseNameSearch();
    }
  });
  $('#courseNameSearch').keypress(function(e) {
    if(e.which == 13) {
      e.preventDefault();
      courseNameSearch();
    }
  });
}

function courseNameSearch() {
  searchCourses.search($('#courseNameSearch').val(), allCourses);
}

function addBootstrapClasses() {
  $('#newCourseModal').addClass('modal hide fade');
  $('#courseSearchForm button').addClass('btn');
  $('#courseSearchForm button').click(function(e) {
    e.preventDefault();
    courseNameSearch();
  });
}
