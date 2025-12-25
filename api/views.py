from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Project, Skills, Book, Country, Post, Hobby, SpokenLanguage


def index(request):
    """Home page view with brief description"""
    import time
    
    # Get all countries from Country model with flag emojis
    countries_visited = Country.objects.all().order_by('name')
    
    # Get published posts, ordered by published date
    posts = Post.objects.filter(status='published').order_by('-published_date', '-created_at')
    
    # Get all hobbies, ordered by category
    hobbies = Hobby.objects.all().order_by('category', 'name')
    
    context = {
        'timestamp': int(time.time()),
        'countries_visited': countries_visited,
        'posts': posts,
        'hobbies': hobbies
    }
    return render(request, 'portfolio/index.html', context)


def skills_view(request):
    """Skills page view"""
    skills = Skills.objects.all().order_by('category', 'name')
    spoken_languages = SpokenLanguage.objects.all().order_by('-is_native', 'name')
    context = {
        'skills': skills,
        'spoken_languages': spoken_languages
    }
    return render(request, 'portfolio/skills.html', context)


def library_view(request):
    """Library page view - combines Projects, Books, and Photos"""
    projects = Project.objects.all().order_by('-created_at')
    books = Book.objects.all().order_by('-read_date', '-created_at')
    project_photos = Project.objects.exclude(image='').order_by('-created_at')
    context = {
        'projects': projects,
        'books': books,
        'project_photos': project_photos
    }
    return render(request, 'portfolio/library.html', context)


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
        'description': s.description
    } for s in skills]
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
