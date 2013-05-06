from django.contrib.auth.decorators import login_required
from django.http import Http404, HttpResponse, HttpResponseRedirect
from django.shortcuts import render_to_response, get_object_or_404, render
from models import *
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.shortcuts import redirect

from django.db import IntegrityError


def signup(request):
    return render(request, "index.html")
  
def chart(request):
    user = request.user
    if user.is_authenticated():
        user_profile = request.user.get_profile()
        return render(request, "charts.html", {"user_profile" : user_profile})
    else:
        raise Http404