from django.contrib.auth.decorators import login_required
from django.http import Http404, HttpResponse, HttpResponseRedirect
from django.shortcuts import render_to_response, get_object_or_404, render
from models import *
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.shortcuts import redirect

from django.db import IntegrityError


def signup(request):
    
    user = request.user
    if user.is_authenticated():
        
        if (request.method == "POST"):
            notifyEmail = request.POST.get("notifyEmail")
            if not request.POST.get("settings"):
                user_profile = UserProfile()
                user_profile.user = user
            else:
                user_profile = request.user.get_profile()
            if notifyEmail:
                user_profile.notify_email = notifyEmail
            else:
                user_profile.notify_email = user.email
            if not request.POST.get("notifications") == "Allow":
                user_profile.notifications = False
            else:
                user_profile.notifications = True
            user_profile.save()
            return HttpResponseRedirect("/")
            
        try:
            user_profile = request.user.get_profile()
            return render(request, "index.html", {"user_profile" : user_profile})
        except UserProfile.DoesNotExist:
            return render(request, "firstLogin.html")
                
        
    return render(request, "index.html")

def settings(request):
    user = request.user
    if user.is_authenticated():
        user_profile = request.user.get_profile()
        return render(request, "settings.html", {"user_profile" : user_profile})
    else:
        raise Http404
        

def chart(request):
    user = request.user
    if user.is_authenticated():
        user_profile = request.user.get_profile()
        return render(request, "charts.html", {"user_profile" : user_profile})
    else:
        raise Http404