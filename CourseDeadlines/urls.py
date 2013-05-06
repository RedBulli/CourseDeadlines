from django.conf.urls import patterns, include, url
from django.views.generic import TemplateView
from tastypie.api import Api
from django.contrib import admin
from Course.api import EnrollmentResource, AssignmentResource

from Course.views import *

admin.autodiscover()

v1_api = Api(api_name='v1')
v1_api.register(EnrollmentResource())
v1_api.register(AssignmentResource())

urlpatterns = patterns('',
    url(r'^$', signup),
    url(r'^api/', include(v1_api.urls)),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^openid/', include('django_openid_auth.urls')),
    url(r'^logout/$', 'django.contrib.auth.views.logout', {'next_page': '/',}, name='logout'),
    url(r'^charts/', chart),
)
