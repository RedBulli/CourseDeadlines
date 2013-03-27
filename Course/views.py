from django.contrib.auth.decorators import login_required
from django.http import Http404, HttpResponse
from django.shortcuts import render_to_response, get_object_or_404, render
from models import *
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User

from django.db import IntegrityError


def signup(request):
    
    user = request.user
    if user.is_authenticated():
        
        if (request.method == "POST"):
            notifyEmail = request.POST.get("notifyEmail")
            notifications = True
            if not request.POST.get("notifications") == "Allow":
                notifications = False
            if notifyEmail:
                user_profile = UserProfile.objects.create_profile(user, notifyEmail, notifications)
            else:
                notifyEmail = user.email
                user_profile = UserProfile.objects.create_profile(user, notifyEmail, notifications)
            return render(request, "index.html", {"name" : user.username, "email" : user.email, "notifyEmail" : notifyEmail, "notifications" : notifications})
        
        try: #not first time
            user_profile = request.user.get_profile()
            notifyEmail = user_profile.notifyEmail
            return render(request, "index.html", {"name" : user.username, "email" : user.email, "notifyEmail" : notifyEmail})
        except UserProfile.DoesNotExist: #first time
            return render(request, "firstLogin.html", {"name" : user.username, "email" : user.email})
                
        
    return render(request, "index.html")
       

        
