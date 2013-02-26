//Application logic
$(document).ready(function() {
  var courses = getMockCourses();
  var courseListView = new CourseListView(
    {collection: courses, el: '#courseList'}
  );
  courseListView.render();
});

function getMockCourses() {
  var courses = new Courses();
  for(var i=0;i<10;i++) {
    courses.add(createCourse("Course"+i));
  }
  return courses;
}

function createCourse(name) {
  var course = new Course();
  course.set('name', name);
  return course;
}
