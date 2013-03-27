//Application logic

var courseEnrollments;
var allCourses;
var organizations = [];

$(document).ready(function() {
  fetchAllCourses();
  addBootstrapClasses();
  bindUiActions();
  initializeCourseEnrollments();
});

function fetchAllCourses() {
  allCourses = new NoppaCourses();
  var orgUrl = 'http://noppa-api-dev.aalto.fi/api/v1/organizations?key=cdda4ae4833c0114005de5b5c4371bb8&callback=?';
  $.getJSON(orgUrl, function(data) {
    $.each(data, function(index, value) {
      organizations.push(value.org_id);
    });
    fetchCoursesFromOrganization(organizations.shift());
  });
}

function fetchCoursesFromOrganization(organization) {
  if (organization != undefined) {
    var courseUrl = 'http://noppa-api-dev.aalto.fi/api/v1/courses?org_id='+organization+'&key=cdda4ae4833c0114005de5b5c4371bb8&callback=?';
    $.getJSON(courseUrl, function(data) {
      allCourses.update(data, {remove: false});
      fetchCoursesFromOrganization(organizations.shift());
    });
  }
  else {
    var datalistView = new CourseDataListView({collection: allCourses});
    datalistView.render();
  }
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
  var searchResults = new CourseEnrollments();
  var searchResultsView = new CourseSearchListView({collection: searchResults, el: '#searchResults'});
  $('#courseNameSearch').bind('input', function(event) {
    searchResults.models = allCourses.search($(this).val());
    searchResultsView.render();
  });
}

function addBootstrapClasses() {
  $('#newCourseModal').addClass('modal hide fade');
}
