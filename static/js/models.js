//Backbone models
var ENROLLMENTS_ROOT = '/api/v1/enrollments/';
var DEADLINES_ROOT = '/api/v1/deadlines/';
var API_KEY = 'cdda4ae4833c0114005de5b5c4371bb8';
var NOPPA_COURSE_ROOT = 'http://noppa-api-dev.aalto.fi/api/v1/courses';
var NOPPA_ASSIGNMENT_ROOT = 'http://noppa-api-dev.aalto.fi/api/v1/courses';
var NOPPA_TEST_ROOT = 'http://noppa-api-dev.aalto.fi/api/v1/courses';

var CourseEnrollment = Backbone.RelationalModel.extend({
  urlRoot: ENROLLMENTS_ROOT,
  relations: [{
    type: Backbone.HasOne,
    key: 'noppa_course',
    relatedModel: 'NoppaCourse',
    includeInJSON: 'noppa_course'
  }],
  fetchNoppaCourse: function(options) {
    options || (options = {});
    options.dataType = 'jsonp';
    options.data = {key: API_KEY};
    return this.fetchRelated('noppa_course', options);
  }
});

var CourseEnrollments = Backbone.Collection.extend({
  url: ENROLLMENTS_ROOT,
  model: CourseEnrollment,
  addCourse: function(course_id, callback) {
    var _this = this;
    var enrollment = new CourseEnrollment({course_id: course_id, noppa_course: course_id});
    enrollment.save(enrollment.attributes, {success: function() {
      enrollment.fetchNoppaCourse({success: function() {
        enrollment.get('noppa_course').fetchAssignments({success: function() {
          _this.add(enrollment);
          _this.trigger('render');
          callback();
        }});
      }});
    }});
  }
});

var NoppaAssignment = Backbone.RelationalModel.extend({
  relations: [{
    type: Backbone.HasOne,
    key: 'course',
    relatedModel: 'NoppaCourse',
    includeInJSON: Backbone.Model.prototype.idAttribute,
    reverseRelation: {
      key: 'assignments',
      includeInJSON: false
    }
  }],
});

var NoppaAssignments = Backbone.Collection.extend({
  model: NoppaAssignment,
  fetchAll: function(options) {
    options || (options = {});
    options.dataType = 'jsonp';
    options.data = {key: API_KEY};
    return this.fetch(options);
  },
  parse: function(response) {
    var collection = [];
    var course = this.course;
    $.each(response, function(index, value) {
      var assignment = new NoppaAssignment(value);
      assignment.set('course', course);
      collection.push(assignment);
    });
    return collection;
  }
});

var NoppaCourse = Backbone.RelationalModel.extend({
  url: function () {
    return NOPPA_COURSE_ROOT + '/' +this.get('course_id');
  },
  idAttribute: 'course_id',
  fetchAssignments: function(options) {
    var assignments = new NoppaAssignments();
    assignments.course = this;
    assignments.urlRoot = this.url() + '/assignments/';
    assignments.fetchAll(options);
  },
});

var NoppaSearchCourse = Backbone.Model.extend({
  urlRoot: NOPPA_COURSE_ROOT,
  idAttribute: 'course_id',
  customToJSON: function(enrollments) {
    var json = this.toJSON();
    var enrolled = false;
    if (enrollments.where({course_id: this.get('course_id')}).length > 0) {
      enrolled = true;
    }
    json.enrolled = enrolled;
    return json;
  }
});

var NoppaCourses = Backbone.Collection.extend({
  model: NoppaSearchCourse,
  urlRoot: NOPPA_COURSE_ROOT,
  searches: {},
  customToJSON: function(enrollments) {
    var json = [];
    this.each(function(course) {
      json.push(course.customToJSON(enrollments));
    });
    return json;
  },
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
        if (name === latestSearch) {
          _this.trigger('render');
        }
      };
      options.error = function() {
        console.log("ERRORI");
      }
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
      var course = new NoppaSearchCourse(value);
      course.id = value.course_id;
      collection.push(course);
    });
    return collection;
  }
});

