from django.db import models


class Course(models.Model):
    course_id = models.CharField(max_length=100, primary_key=True)

    def __unicode__(self):
        return u'%s' % (self.course_id)

    def save(self):
        self.full_clean()
        super(Course, self).save()
