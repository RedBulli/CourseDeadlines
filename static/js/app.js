//Application logic

var courseEnrollments;
var allCourses;
var searchCourses;
var organizations = [];
var latestSearch;

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
      var size = collection.size();
      var callbackCount = 0;
      collection.each(function(course) {
        course.fetchNoppaCourse({success: function() {
          course.get('noppa_course').fetchAssignments({success: function() {
            callbackCount++;
            if (size == callbackCount) {
              var courseEnrollmentsView = new CourseEnrollmentsView(
                {collection: courseEnrollments, el: '#courseList'}
              );
              courseEnrollmentsView.render();
            }
          }});
        }});
      });
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
  $('#searchResults').empty();
  latestSearch = $('#courseNameSearch').val();
  var spinner = new Spinner(spinnerOptions).spin(document.getElementById('searchResults'));
  searchCourses.search(latestSearch, allCourses);
}

function addBootstrapClasses() {
  $('#newCourseModal').addClass('modal hide fade');
  $('#courseSearchForm button').addClass('btn');
  $('#courseSearchForm button').click(function(e) {
    e.preventDefault();
    courseNameSearch();
  });
}

var spinnerOptions = {
  lines: 17, // The number of lines to draw
  length: 9, // The length of each line
  width: 3, // The line thickness
  radius: 12, // The radius of the inner circle
  corners: 0.9, // Corner roundness (0..1)
  rotate: 0, // The rotation offset
  direction: 1, // 1: clockwise, -1: counterclockwise
  color: '#000', // #rgb or #rrggbb
  speed: 1.3, // Rounds per second
  trail: 38, // Afterglow percentage
  shadow: false, // Whether to render a shadow
  hwaccel: false, // Whether to use hardware acceleration
  className: 'spinner', // The CSS class to assign to the spinner
  zIndex: 2e9, // The z-index (defaults to 2000000000)
  top: 'auto', // Top position relative to parent in px
  left: 'auto' // Left position relative to parent in px
};

