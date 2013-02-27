//Backbone views
var CourseAttendancesView = Backbone.View.extend({
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
  },
  render: function() {
    this.$el.html(this.template({courses: this.collection.models}));
    $('.attendCourse').click(function() {
      var courseAttendace = new CourseAttendance({course_id: $(this).val()});
      courseAttendace.save();
      courseAttendances.add(courseAttendace);
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
      $('#courseDatalist').append('<option value="' + course.get('name') + '">');
    });
  }
});