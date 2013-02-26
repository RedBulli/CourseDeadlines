//Backbone views
var CourseListView = Backbone.View.extend({
  initialize: function() {
    this.template = Handlebars.compile($('#course_list_tmpl').html());
  },
  render: function() {
    this.$el.html(this.template({courses: this.collection.models}));
  }
});
