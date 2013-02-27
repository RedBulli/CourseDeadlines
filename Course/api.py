from tastypie.resources import ModelResource
from tastypie.authorization import Authorization
from models import Course


class CourseResource(ModelResource):
    class Meta:
        queryset = Course.objects.all()
        resource_name = 'courses'
        include_resource_uri = False
        authorization = Authorization()
