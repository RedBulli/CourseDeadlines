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
        

class userProfileManager(models.Manager):
    def create_profile(self, user, notifyEmail, notifications):
        userProfile = self.create(user=user, notifyEmail = notifyEmail, notifications = notifications)
        return userProfile

class UserProfile(models.Model):
    user = models.ForeignKey(User, unique=True)
    notifyEmail = models.EmailField("notifyemail", blank=True)
    notifications = models.BooleanField(default='True')
    
    objects = userProfileManager()