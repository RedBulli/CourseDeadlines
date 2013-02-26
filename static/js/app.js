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
});
