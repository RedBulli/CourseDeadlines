//Backbone models
var ENROLLMENTS_ROOT = '/api/v1/enrollments/';
var DEADLINES_ROOT = '/api/v1/deadlines/';
var API_KEY = 'cdda4ae4833c0114005de5b5c4371bb8';
var NOPPA_COURSE_ROOT = 'http://noppa-api-dev.aalto.fi/api/v1/courses';
var NOPPA_ASSIGNMENT_ROOT = 'http://noppa-api-dev.aalto.fi/api/v1/courses';
var NOPPA_TEST_ROOT = 'http://noppa-api-dev.aalto.fi/api/v1/courses';

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

var NoppaAssignment = Backbone.RelationalModel.extend({
});

var NoppaAssignments = Backbone.Collection.extend({
  model: NoppaAssignment,
  fetchAll: function(options) {
    options || (options = {});
    options.dataType = 'jsonp';
    options.data = {key: API_KEY};
    return this.fetch(options);
  }
});

var NoppaCourse = Backbone.Model.extend({
  urlRoot: NOPPA_COURSE_ROOT,
  idAttribute: 'course_id',
  fetchAssignments: function(options) {
    var assignments = new NoppaAssignments();
    assignments.urlRoot = this.url + 'assignments/';
    assignments.fetchAll();
  },
});

var NoppaCourses = Backbone.Collection.extend({
  model: NoppaCourse,
  urlRoot: NOPPA_COURSE_ROOT,
  searches: {},
  search: function(name, allCourses, options) {
    var _this = this;
    if (name.length == 0) {
      return;
    }
    if (!(name in _this.searches)) {
      _this.searches[name] = [];
      options || (options = {});
      var data = (options.data || {});
      options.dataType = 'jsonp';
      options.data = {key: API_KEY, search: name};
      options.success = function(collection) {
        allCourses.update(collection.models, {remove: false});
        allCourses.trigger('update');
        _this.searches[name] = collection.models;
        _this.trigger('render');
      };
      return Backbone.Collection.prototype.fetch.call(this, options);
    }
    else {
      _this.models = this.searches[name];
      _this.trigger('render');
    }
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
