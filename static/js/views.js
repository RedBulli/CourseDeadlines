//Backbone views
var CourseListView = Backbone.View.extend({
  initialize: function() {
    this.template = Handlebars.compile($('#course_list_tmpl').html());
  },
  render: function() {
    this.$el.html(this.template({courses: this.collection.models}));
  }
});

var CourseSearchListView = Backbone.View.extend({
  initialize: function() {
    _.bindAll(this);
    this.template = Handlebars.compile($('#course_search_list_tmpl').html());
    this.collection.bind('render', this.render);
    this.collection.bind('renderDatalist', this.renderDatalist);
  },
  render: function() {
    this.$el.html(this.template({courses: this.collection.models}));
  },
  renderDatalist: function() {
    $('#courseDatalist').empty();
    this.collection.each(function(course) {
      $('#courseDatalist').append('<option value="' + course.name + '">');
    });
  }
});

var CourseDataListView = Backbone.View.extend({
  initialize: function() {
    _.bindAll(this);
    this.collection.bind('update', this.render);
  },
  render: function() {
    $('#courseDatalist').empty();
    this.collection.each(function(course) {
      $('#courseDatalist').append('<option value="' + course.name + '">');
    });
  }
});