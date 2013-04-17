//Backbone views
var CourseEnrollmentsView = Backbone.View.extend({
  initialize: function() {
    _.bindAll(this, 'render');
    this.template = Handlebars.compile($('#course_list_tmpl').html());
    this.collection.bind('add', this.render);
  },
  render: function() {
    var _this = this;
    this.$el.html(this.template({courses: this.collection.models}));
    $('.removeCourse').click(function(event) {
      event.preventDefault();
      _this.collection.get($(this).attr('href')).destroy();
      _this.render();
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
    var _this = this;
    var json = this.collection.customToJSON(courseEnrollments);
    this.$el.html(this.template({courses: json}));
    $('.attendCourse').click(function() {
      courseEnrollments.addCourse($(this).val(), function() {
        _this.render();
      });
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
