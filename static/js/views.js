//Backbone views

var DeadlineView = Backbone.View.extend({
  initialize: function() {
    _.bindAll(this, 'render');
    this.template = Handlebars.compile($('#deadline_tmpl').html());
  },
  render: function() {
    var savedAssignment = this.model.getOrCreateSavedAssignment();
    if (savedAssignment.get('status') == 'Deleted') {
      return this;
    }
    var done = (savedAssignment.get('status') == 'Done');
    var element = $(this.template({
      deadline: this.model.customToJSON(),
      savedAssignment: savedAssignment,
      done: done
    }));
    if (!this.$el.is(':empty')) {
      this.$el.html(element);
    } else {
      this.$el = element;
      this.parentEl.append(element);
    }
    this.bindClicks();
    return this;
  },
  bindClicks: function() {
    var _this = this;
    this.$el.find('.oneDeadline').not('.dlButtons').click(function(event) {
      var editDeadlineView = new EditDeadlineView({
        el: '#editDeadlineModal',
        model: _this.model
      });
      editDeadlineView.render();
      $('#myModal').modal();
    });
    var savedAssignment = this.model.getOrCreateSavedAssignment();
    this.$el.find('.doneButton').click(function(event) {
      savedAssignment.set('status', 'Done');
      savedAssignment.save();
      _this.render();
    });
    this.$el.find('.undoButton').click(function(event) {
      savedAssignment.set('status', 'Todo');
      savedAssignment.save();
      _this.render();
    });
    this.$el.find('.trashButton').click(function(event) {
      savedAssignment.set('status', 'Deleted');
      savedAssignment.save();
      _this.$el.remove();
    });
  }
});

var CourseEnrollmentsView = Backbone.View.extend({
  initialize: function() {
    _.bindAll(this, 'render');
    this.template = Handlebars.compile($('#course_list_tmpl').html());
    this.collection.bind('add', this.render);
    this.collection.bind('change', this.render);
  },
  render: function() {
    this.$el = $('#' + this.id);
    var dateGroups = this.collection.getAssignmentsGroupedByDate();
    this.$el.html(this.template({
      dates: dateGroups
    }));
    var _this = this;
    $.each(dateGroups, function(index, object) {
      var el = $('#assignments_day_' + object.time);
      $.each(object.assignments, function(index, assignment) {
        var dlv = new DeadlineView({
          model: assignment
        });
        dlv.parentEl = el;
        dlv.render();
      });
    });
    return this;
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
    this.$el.html(this.template({
      courses: json
    }));
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

var PortraitLandscapeSwitchView = Backbone.View.extend({
  initialize: function() {
    this.portrait_template = Handlebars.compile($("#portrait_tmpl").html());
    this.lastOrientation;
    this.first_template = Handlebars.compile($("#first_use_tmpl").html());
    var _this = this;
    window.addEventListener("resize", function() {
      if (_this.lastOrientation != _this.is_landscape()) {
        _this.render();
      }
    }, false);
  },
  is_landscape: function() {
    return (window.innerHeight <= window.innerWidth);
  },
  render: function(landscape) {
    if (this.landscapeView.collection.size() == 0) {
      this.$el.html(this.first_template);
    } 
    else {
      if (landscape != undefined) {
        if (landscape == 'landscape') {
          this.renderLandscape();
        }
        else {
          this.renderPortrait();
        }
      }
      else {
        this.lastOrientation = this.is_landscape();
        if (this.lastOrientation) {
          this.renderLandscape();
        } else {
          this.renderPortrait();
        }
      }
    }
    this.bindSwitch();
  },
  bindSwitch: function() {
    var _this = this;
    $('#toGraph').click(function(event) {
      _this.render('landscape');
    });
    $('#toList').click(function(event) {
      _this.render('portrait');
    });
  },
  renderPortrait: function() {
    this.$el.html(this.portrait_template);
    this.courseView.render();
  },
  renderLandscape: function() {
    this.landscapeView.render();
  }
});

var EditDeadlineView = Backbone.View.extend({
  initialize: function() {
    this.template = Handlebars.compile($("#edit_deadlines_tmpl").html());
  },
  render: function() {
    var savedAssignment = this.model.getOrCreateSavedAssignment();
    this.$el.html(this.template({
      deadline: this.model.customToJSON(),
      savedAssignment: savedAssignment
    }));
    this.bindClicks();
  },
  bindClicks: function() {
    var _this = this;
    this.$el.find('.save_deadline').click(function(event) {
      var formData = _this.$el.find('.settings').serializeObject();
      var workload = null;
      var highlight = false;
      if (formData.workload != null && formData.workload != undefined && formData.workload.length != 0) {
        workload = parseInt(formData.workload);
      }
      if (formData.highlight == 'true') {
        highlight = true;
      } else {
        highlight = false;
      }
      _this.model.updateAssignment(workload, highlight);
    });
  }
});