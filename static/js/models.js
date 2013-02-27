//Backbone models
var COURSES_ROOT = '/api/v1/courses/';
var API_KEY = 'cdda4ae4833c0114005de5b5c4371bb8';
var NOPPA_COURSE_ROOT = 'http://noppa-api-dev.aalto.fi/api/v1/courses';

var CourseAttendance = Backbone.RelationalModel.extend({
  urlRoot: COURSES_ROOT,
  idAttribute: "course_id",
  url: function() {
    return this.urlRoot + this.id
  }
});

var CourseAttendances = Backbone.Collection.extend({
  url: COURSES_ROOT,
  model: CourseAttendance
});

var NoppaCourse = Backbone.Model.extend({
  urlRoot: NOPPA_COURSE_ROOT,
  idAttribute: "course_id"
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
