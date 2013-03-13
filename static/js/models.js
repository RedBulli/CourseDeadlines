//Backbone models
var ENROLLMENTS_ROOT = '/api/v1/enrollments/';
var API_KEY = 'cdda4ae4833c0114005de5b5c4371bb8';
var NOPPA_COURSE_ROOT = 'http://noppa-api-dev.aalto.fi/api/v1/courses';

var CourseEnrollment = Backbone.RelationalModel.extend({
  urlRoot: ENROLLMENTS_ROOT
});

var CourseEnrollments = Backbone.Collection.extend({
  url: ENROLLMENTS_ROOT,
  model: CourseEnrollment,
  addCourse: function(course_id) {
    var _this = this;
    var enrollment = new CourseEnrollment({course_id: course_id});
    enrollment.save(enrollment.attributes, {success: function() {
      _this.add(enrollment);
    }});
    this.trigger('render');
  }
});

var NoppaCourse = Backbone.Model.extend({
  urlRoot: NOPPA_COURSE_ROOT,
  idAttribute: 'course_id'
});

var NoppaCourses = Backbone.Collection.extend({
  model: NoppaCourse,
  urlRoot: NOPPA_COURSE_ROOT,
  searches: {},
  search: function (name) {
    return this.filter(function(course) {
      return course.get('name').toLowerCase().indexOf(name.toLowerCase()) != -1;
    });
  },
  parse: function(response) {
    var collection = [];
    $.each(response, function(index, value) {
      var course = new NoppaCourse(value);
      course.id = value.course_id;
      collection.push(course);
    });
    return collection;
  }
});
