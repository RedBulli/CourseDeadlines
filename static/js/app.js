//Application logic
$(document).ready(function() {
  var courses = new Courses();
  courses.fetch({
    success: function(collection) {
      var courseListView = new CourseListView(
        {collection: courses, el: '#courseList'}
      );
      courseListView.render();
    }
  });
  var allCourses = new NoppaCourses();
  var searchCourses = new NoppaCourses();
  $('#newCourseModal').addClass('modal hide fade');
  $('#courseNameSearch').bind('keyup', function(event) {
    searchCourses.search($(this).val(), allCourses);
  });
  var searchListView = new CourseSearchListView(
    {collection: searchCourses, el: '#searchResults'}
  );
  var datalistView = new CourseDataListView({collection: allCourses});
});
