//Backbone models
var COURSES_ROOT = '/api/v1/courses/';

var Course = Backbone.RelationalModel.extend({
  urlRoot: COURSES_ROOT
});

var Courses = Backbone.Collection.extend({
  model: Course,
  urlRoot: COURSES_ROOT
});