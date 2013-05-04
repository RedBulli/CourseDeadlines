from django.db import models
from django.contrib.auth.models import User


class Enrollment(models.Model):
    user = models.ForeignKey(User)
    course_id = models.CharField(max_length=100)

    class Meta:
        unique_together = ("user", "course_id")

    def __unicode__(self):
        return u'%s: %s' % (self.user, self.course_id)

    def save(self):
        self.full_clean()
        super(Enrollment, self).save()


class Assignment(models.Model):
    enrollment = models.ForeignKey(Enrollment)
    name = models.CharField(max_length=500)
    status = models.CharField(max_length=7, null=True, blank=True)
    workload = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    highlight = models.BooleanField(default=False)

    class Meta:
        unique_together = ("enrollment", "name")

    def __unicode__(self):
        return u'%s: %s' % (self.enrollment, self.name)


class UserProfile(models.Model):
    user = models.OneToOneField(User)
    notify_email = models.EmailField(null=True, blank=True)
    notifications = models.BooleanField()
    
    def __unicode__(self):
        return u'%s' % (self.user)

def get_profile(self):
    return UserProfile.objects.get(user=self)

User.add_to_class('get_profile', get_profile)
