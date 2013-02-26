from django.test import TestCase
from Course.models import Course

class CourseTest(TestCase):
    def test_construction(self):
        course = Course()
