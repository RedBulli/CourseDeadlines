from django.contrib import admin
from Course.models import Enrollment, Assignment


admin.site.register(Enrollment)
admin.site.register(Assignment)