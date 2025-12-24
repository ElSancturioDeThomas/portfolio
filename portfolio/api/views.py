from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Project, Skills, ProgrammingLanguage, Book, Country


def index(request):
    """Home page view with brief description"""
    import time
    
    # Get all countries from Country model with flag emojis
    countries_visited = Country.objects.all().order_by('name')
    
    context = {
        'timestamp': int(time.time()),
        'countries_visited': countries_visited
    }
    return render(request, 'portfolio/index.html', context)


def projects_view(request):
    """Projects page view"""
    projects = Project.objects.all().order_by('-created_at')
    context = {
        'projects': projects
    }
    return render(request, 'portfolio/projects.html', context)


def skills_view(request):
    """Skills page view - includes both skills and programming languages"""
    skills = Skills.objects.all().order_by('category', '-proficiency_level', 'name')
    languages = ProgrammingLanguage.objects.all().order_by('-proficiency_level', 'name')
    context = {
        'skills': skills,
        'languages': languages
    }
    return render(request, 'portfolio/skills.html', context)


def books_view(request):
    """Books page view"""
    books = Book.objects.all().order_by('-read_date', '-created_at')
    context = {
        'books': books
    }
    return render(request, 'portfolio/books.html', context)


def photos_view(request):
    """Photos page view - displays images from projects"""
    project_photos = Project.objects.exclude(image='').order_by('-created_at')
    context = {
        'project_photos': project_photos
    }
    return render(request, 'portfolio/photos.html', context)


@api_view(['GET'])
def hello_world(request):
    """Simple API endpoint to test Django-React integration."""
    return Response({
        'message': 'Hello from Django!',
        'status': 'success'
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
def projects_list(request):
    """Get list of all projects"""
    projects = Project.objects.all()
    data = [{
        'id': p.id,
        'title': p.title,
        'description': p.description,
        'technologies': p.technologies,
        'featured': p.featured
    } for p in projects]
    return Response({'count': len(data), 'results': data})


@api_view(['GET'])
def skills_list(request):
    """Get list of all skills"""
    skills = Skills.objects.all()
    data = [{
        'id': s.id,
        'name': s.name,
        'category': s.category,
        'proficiency_level': s.proficiency_level
    } for s in skills]
    return Response({'count': len(data), 'results': data})


@api_view(['GET'])
def programming_languages_list(request):
    """Get list of all programming languages"""
    languages = ProgrammingLanguage.objects.all()
    data = [{
        'id': l.id,
        'name': l.name,
        'proficiency_level': l.proficiency_level,
        'years_experience': float(l.years_experience) if l.years_experience else None
    } for l in languages]
    return Response({'count': len(data), 'results': data})


@api_view(['GET'])
def books_list(request):
    """Get list of all books"""
    books = Book.objects.all()
    data = [{
        'id': b.id,
        'title': b.title,
        'author': b.author,
        'rating': b.rating
    } for b in books]
    return Response({'count': len(data), 'results': data})
