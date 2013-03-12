from django.conf.urls import url
from tastypie.resources import ModelResource
from tastypie import fields
from models import Enrollment
from tastypie.authentication import SessionAuthentication
from tastypie.authorization import Authorization, DjangoAuthorization
from django.contrib.auth.models import User
import logging

# Get an instance of a logger
logger = logging.getLogger(__name__)

class OwnAuthorization(Authorization):
    def is_authorized(self, request, object=None):
        logger.info("kfskjf")
        if request.user.is_authenticated():
            return True
        else:
            return False
 
    def apply_limits(self, request, object_list=None):
        logger.info("kf2skj2f")
        if request and request.method in ('GET', 'DELETE'):  # 1.
            return object_list.filter(user=request.user)
 
        if isinstance(object_list, Bundle):  # 2.
            bundle = object_list # for clarity, lets call it a bundle            
            bundle.data['user'] = {'pk': request.user.pk}  # 3.
            return bundle
 
        return []  # 4.

class UserResource(ModelResource):
    class Meta:
        list_allowed_methods = ['get']
        queryset = User.objects.all()
        resource_name = 'user'
        authentication = SessionAuthentication()
        authorization = DjangoAuthorization()

class EnrollmentResource(ModelResource):
    course_id = fields.CharField(attribute='course_id')
    user = fields.ToOneField(UserResource, 'user')

    class Meta:
        queryset = Enrollment.objects.all()
        resource_name = 'enrollments'
        authentication = SessionAuthentication()
        authorization = OwnAuthorization()

    def obj_create(self, bundle, request=None, **kwargs):
        logger.info("kfskjf")
        return super(EnrollmentResource, self).obj_create(bundle, request, user=request.user)

    def apply_authorization_limits(self, request, object_list):
        logger.info("kfskjf")
        return object_list.filter(user=request.user)
