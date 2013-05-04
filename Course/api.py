from django.conf.urls import url
from tastypie.resources import ModelResource
from tastypie import fields
from models import Enrollment, Assignment
from tastypie.authentication import SessionAuthentication
from tastypie.authorization import Authorization, DjangoAuthorization
from tastypie.exceptions import Unauthorized
from django.contrib.auth.models import User


class UserObjectsOnlyAuthorization(Authorization):
    def detail_auth(self, object_list, bundle):
        if hasattr(bundle.obj, 'user'):
            user = bundle.obj.user
        elif hasattr(bundle.obj, 'enrollment'):
            user = bundle.obj.enrollment.user
        else:
            raise Unauthorized()
        if user == bundle.request.user:
            return True
        else:
            raise Unauthorized()

    def list_auth(self, object_list, bundle):
        return object_list.filter(user=bundle.request.user)

    def read_list(self, object_list, bundle):
        return self.list_auth(object_list, bundle)

    def read_detail(self, object_list, bundle):
        return self.detail_auth(object_list, bundle)

    def create_list(self, object_list, bundle):
        # Assuming their auto-assigned to ``user``.
        return object_list

    def create_detail(self, object_list, bundle):
        return self.detail_auth(object_list, bundle)

    def update_list(self, object_list, bundle):
        return self.list_auth(object_list, bundle)

    def update_detail(self, object_list, bundle):
        return self.detail_auth(object_list, bundle)

    def delete_list(self, object_list, bundle):
        return self.list_auth(object_list, bundle)

    def delete_detail(self, object_list, bundle):
        return self.detail_auth(object_list, bundle)


class EnrollmentResource(ModelResource):
    course_id = fields.CharField(attribute='course_id')
    noppa_course = fields.CharField(attribute='course_id')
    assignments = fields.ToManyField('Course.api.AssignmentResource', 'assignment_set', full=True, related_name='enrollment')

    def obj_create(self, bundle, request=None, **kwargs):
        bundle.obj.user = bundle.request.user
        bundle.obj.course_id = bundle.data.get('course_id')
        bundle.obj.save()
        return bundle

    class Meta:
        queryset = Enrollment.objects.all()
        list_allowed_methods = ['get', 'post']
        detail_allowed_methods = ['get', 'post', 'put', 'delete']
        resource_name = 'enrollments'
        authorization = UserObjectsOnlyAuthorization()


class AssignmentResource(ModelResource):
    enrollment = fields.ToOneField(EnrollmentResource, attribute='enrollment')
    name = fields.CharField(attribute='name')
    workload = fields.DecimalField(attribute='workload', null=True)
    highlight = fields.BooleanField(attribute='highlight')
    status = fields.CharField(attribute='status', null=True)
    
    def obj_create(self, bundle, request=None, **kwargs):
        res = EnrollmentResource()
        bundle.obj.enrollment = res.get_via_uri(bundle.data.get('enrollment'), bundle.request)
        bundle.obj.name = bundle.data.get('name')
        bundle.obj.workload = bundle.data.get('workload')
        bundle.obj.highlight = bundle.data.get('highlight')
        bundle.obj.status = bundle.data.get('status')
        bundle.obj.save()
        return bundle

    class Meta:
        queryset = Assignment.objects.all()
        list_allowed_methods = ['get', 'post']
        detail_allowed_methods = ['get', 'post', 'put', 'delete']
        resource_name = 'assignments'
        authorization = UserObjectsOnlyAuthorization()
