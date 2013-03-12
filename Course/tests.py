from django.test import TestCase
from Course.models import Enrollment

class EnrollmentTest(TestCase):
    def test_construction(self):
        enrollment = Enrollment()
