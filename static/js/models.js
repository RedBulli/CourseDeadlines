//Backbone models
var ENROLLMENTS_ROOT = '/api/v1/enrollments/';
var ASSIGNMENTS_ROOT = '/api/v1/assignments/';
var DEADLINES_ROOT = '/api/v1/deadlines/';
var API_KEY = 'cdda4ae4833c0114005de5b5c4371bb8';
var NOPPA_COURSE_ROOT = 'http://noppa-api-dev.aalto.fi/api/v1/courses';
var NOPPA_ASSIGNMENT_ROOT = 'http://noppa-api-dev.aalto.fi/api/v1/courses';
var NOPPA_TEST_ROOT = 'http://noppa-api-dev.aalto.fi/api/v1/courses';

function truncateDate(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

var CourseEnrollment = Backbone.RelationalModel.extend({
  urlRoot: ENROLLMENTS_ROOT,
  relations: [{
    type: Backbone.HasOne,
    key: 'noppa_course',
    relatedModel: 'NoppaCourse',
    includeInJSON: 'noppa_course',
    reverseRelation: {
      type: Backbone.HasOne,
      key: 'enrollment',
      includeInJSON: false
    }
  }, {
    type: Backbone.HasMany,
    key: 'assignments',
    relatedModel: 'Assignment',
    includeInJSON: false,
    reverseRelation: {
      key: 'enrollment',
      includeInJSON: Backbone.Model.prototype.idAttribute
    }
  }],
  fetchNoppaCourse: function(options) {
    options || (options = {});
    options.dataType = 'jsonp';
    options.data = {
      key: API_KEY
    };
    return this.fetchRelated('noppa_course', options);
  },
  getOrCreateSavedAssignment: function(name) {
    var assignment = this.get('assignments').findWhere({
      name: name
    });
    if (!assignment) {
      assignment = new Assignment({
        enrollment: this,
        name: name
      });
    }
    return assignment;
  },
  getWorkloadForAssignments: function(assignments) {
    var sum = 0;
    var _this = this;
    $.each(assignments, function(index, assignment) {
      var savedAssignment = _this.getOrCreateSavedAssignment(assignment.get('title'));
      if (savedAssignment.get('status') == null || savedAssignment.get('status') == 'Todo') {
        sum += parseInt(savedAssignment.get('workload'));
      }
    });
    return sum;
  },
  getWorkload: function(date) {
    var assignments = _.filter(this.getFutureAssignments(), function(assignment) {
      var thisDate = assignment.getDateObjectDeadline();
      return ((thisDate.getFullYear() === date.getFullYear()) && (thisDate.getMonth() === date.getMonth()) && (thisDate.getDate() === date.getDate()));
    });
    return this.getWorkloadForAssignments(assignments);
  },
  getWeeklyWorkload: function(date) {
    var assignments = _.filter(this.getFutureAssignments(), function(assignment) {
      var thisDate = assignment.getDateObjectDeadline();
      return ((thisDate.getFullYear() === date.getFullYear()) && (thisDate.getWeek() === date.getWeek()));
    });
    return this.getWorkloadForAssignments(assignments);
  },
  getMonthlyWorkload: function(date) {
    var assignments = _.filter(this.getFutureAssignments(), function(assignment) {
      var thisDate = assignment.getDateObjectDeadline();
      return ((thisDate.getFullYear() === date.getFullYear()) && (thisDate.getMonth() === date.getMonth()));
    });
    return this.getWorkloadForAssignments(assignments);
  },
  getFutureAssignments: function() {
    var allAssignments = this.get('noppa_course').get('assignments');
    return allAssignments.filter(function(assignment) {
      return (assignment.getDateObjectDeadline() >= new Date());
    });
  }
});

var CourseEnrollments = Backbone.Collection.extend({
  url: ENROLLMENTS_ROOT,
  model: CourseEnrollment,
  addCourse: function(course_id, callback) {
    var _this = this;
    var enrollment = new CourseEnrollment({
      course_id: course_id,
      noppa_course: course_id
    });
    enrollment.save(enrollment.attributes, {
      success: function() {
        enrollment.fetchNoppaCourse({
          success: function() {
            enrollment.get('noppa_course').fetchAssignments({
              success: function() {
                _this.add(enrollment);
                _this.trigger('render');
                callback();
              }
            });
          }
        });
      }
    });
  },
  getAssignments: function() {
    var assignments = [];
    this.each(function(enrollment) {
      assignments = _.union(assignments, enrollment.getFutureAssignments());
    });
    return assignments;
  },
  getAssignmentsGroupedByDate: function() {
    var assignments = this.getAssignments();
    var dates = {};
    $.each(assignments, function(index, assignment) {
      var time = truncateDate(assignment.getDateObjectDeadline()).getTime();
      if (dates.hasOwnProperty(time)) {
        dates[time].push(assignment);
      } else {
        dates[time] = [assignment];
      }
    });
    var dateArray = [];
    $.each(dates, function(date, assignments) {
      var dateObj = new Date(parseInt(date));
      dateArray.push({
        date: dateObj,
        dateString: dateObj.toLocaleDateString('fi'),
        time: dateObj.getTime(),
        assignments: assignments.sort(function(a, b) {
          return a.getDateObjectDeadline() > b.getDateObjectDeadline();
        })
      });
    });
    return dateArray.sort(function(a, b) {
      return a.date > b.date;
    });
  },
});

var Assignment = Backbone.RelationalModel.extend({
  urlRoot: ASSIGNMENTS_ROOT,
  defaults: {
    "workload": 1,
    "highlight": false
  },
  relations: [{
    type: Backbone.HasOne,
    key: 'noppa_assignment',
    relatedModel: 'NoppaAssignment',
    includeInJSON: true,
    reverseRelation: {
      type: Backbone.HasOne,
      key: 'savedAssignment',
      includeInJSON: false
    }
  }]
});

var NoppaAssignment = Backbone.RelationalModel.extend({
  idAttribute: "title",
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
  getOrCreateSavedAssignment: function() {
    return this.get('course').get('enrollment').getOrCreateSavedAssignment(this.get('title'));
  },
  updateAssignment: function(workload, highlight) {
    var assignment = this.getOrCreateSavedAssignment();
    assignment.set('workload', workload);
    assignment.set('highlight', highlight);
    assignment.save();
  },
  customToJSON: function() {
    var json = this.toJSON();
    var date = this.getDateObjectDeadline();
    json.customDate = date;
    json.courseName = this.get('course').get('name');
    json.localeTimeString = new Date(Date.parse(this.get('deadline'))).toLocaleTimeString('fi');
    return json;
  },
  getDateObjectDeadline: function() {
    return new Date(Date.parse(this.get('deadline')));

  }
});

var NoppaAssignments = Backbone.Collection.extend({
  model: NoppaAssignment,
  fetchAll: function(options) {
    options || (options = {});
    options.dataType = 'jsonp';
    options.data = {
      key: API_KEY
    };
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
  url: function() {
    return NOPPA_COURSE_ROOT + '/' + this.get('course_id');
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
    if (enrollments.where({
      course_id: this.get('course_id')
    }).length > 0) {
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
      options.data = {
        key: API_KEY,
        search: name
      };
      options.success = function(collection) {
        allCourses.set(collection.models, {
          remove: false
        });
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
    } else {
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