from django.conf.urls import url
from tastypie.resources import ModelResource
from tastypie import fields
from models import Enrollment
from tastypie.authentication import SessionAuthentication
from tastypie.authorization import Authorization, DjangoAuthorization
from tastypie.exceptions import Unauthorized
from django.contrib.auth.models import User


class UserObjectsOnlyAuthorization(Authorization):
    def read_list(self, object_list, bundle):
        # This assumes a ``QuerySet`` from ``ModelResource``.
        return object_list.filter(user=bundle.request.user)

    def read_detail(self, object_list, bundle):
        if  bundle.obj.user == bundle.request.user:
            return True
        else:
            raise Unauthorized()

    def create_list(self, object_list, bundle):
        # Assuming their auto-assigned to ``user``.
        return object_list

    def create_detail(self, object_list, bundle):
        return True

    def update_list(self, object_list, bundle):
        return object_list.filter(user=bundle.request.user)

    def update_detail(self, object_list, bundle):
        return bundle.obj.user == bundle.request.user

    def delete_list(self, object_list, bundle):
        return object_list.filter(user=bundle.request.user)

    def delete_detail(self, object_list, bundle):
        return bundle.obj.user == bundle.request.user


class EnrollmentResource(ModelResource):
    class Meta:
        queryset = Enrollment.objects.all()
        resource_name = 'enrollments'
        authentication = SessionAuthentication()
        authorization = UserObjectsOnlyAuthorization()
