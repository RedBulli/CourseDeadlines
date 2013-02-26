from django.conf.urls import patterns, include, url
from django.views.generic import TemplateView
from tastypie.api import Api
from django.contrib import admin
from Course.api import CourseResource


admin.autodiscover()

v1_api = Api(api_name='v1')
v1_api.register(CourseResource())

urlpatterns = patterns('',
    # Examples:
    url(r'^$', TemplateView.as_view(template_name="index.html")),
    url(r'^api/', include(v1_api.urls)),
    # url(r'^$', 'CourseDeadlines.views.home', name='home'),
    # url(r'^CourseDeadlines/', include('CourseDeadlines.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),
)
