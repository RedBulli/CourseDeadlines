//Backbone views
var CourseEnrollmentsView = Backbone.View.extend({
  initialize: function() {
    _.bindAll(this, 'render');
    this.template = Handlebars.compile($('#course_list_tmpl').html());
    this.collection.bind('add', this.render);
  },
  render: function() {
    this.$el.html(this.template({courses: this.collection.models}));
    $('.removeCourse').click(function() {
      return false;
    });
  }
});

var CourseSearchListView = Backbone.View.extend({
  initialize: function() {
    _.bindAll(this, 'render');
    this.template = Handlebars.compile($('#course_search_list_tmpl').html());
    this.collection.bind('render', this.render);
  },
  render: function() {
    this.$el.html(this.template({courses: this.collection.models}));
    $('.attendCourse').click(function() {
      courseEnrollments.addCourse($(this).val());
    });
  }
});

var CourseDataListView = Backbone.View.extend({
  initialize: function() {
    _.bindAll(this, 'render');
    this.collection.bind('update', this.render);
  },
  render: function() {
    $('#courseDatalist').empty();
    this.collection.each(function(course) {
      $('#courseDatalist').append('<option value="' + course.get('name') + '">');
    });
  }
});
