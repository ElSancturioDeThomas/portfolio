from django.shortcuts import render
from django.core.cache import cache
from django.conf import settings
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Project, Skills, Book, Country, Post, Hobby, SpokenLanguage
import requests
import json


def get_github_contributions():
    """Fetch GitHub contributions using GraphQL API"""
    # Check cache first
    cached_data = cache.get('github_contributions')
    if cached_data:
        return cached_data
    
    # Get GitHub token from settings
    token = getattr(settings, 'GITHUB_TOKEN', None)
    username = getattr(settings, 'GITHUB_USERNAME', 'ElSancturioDeThomas')
    
    if not token:
        return {'weeks': [], 'total_contributions': 0}
    
    # GraphQL query
    query = """
    query {
      user(login: "%s") {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionLevel
                contributionCount
                date
              }
            }
          }
        }
      }
    }
    """ % username
    
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.post(
            "https://api.github.com/graphql",
            json={'query': query},
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            if 'data' in data and 'user' in data['data']:
                user_data = data['data']['user']['contributionsCollection']
                calendar_data = user_data['contributionCalendar']
                weeks = calendar_data['weeks']
                total_contributions = calendar_data.get('totalContributions', 0)
                
                result = {
                    'weeks': weeks,
                    'total_contributions': total_contributions
                }
                
                # Cache for 1 hour
                cache.set('github_contributions', result, 3600)
                return result
    except Exception as e:
        print(f"Error fetching GitHub contributions: {e}")
    
    return {'weeks': [], 'total_contributions': 0}


def index(request):
    """Home page view with brief description"""
    import time
    
    # Get all countries from Country model with flag emojis
    countries_visited = Country.objects.all().order_by('name')
    
    # Get published posts, ordered by published date
    posts = Post.objects.filter(status='published').order_by('-published_date', '-created_at')
    
    # Get all hobbies, ordered by category
    hobbies = Hobby.objects.all().order_by('category', 'name')
    
    # Get GitHub contributions
    github_data = get_github_contributions()
    
    context = {
        'timestamp': int(time.time()),
        'countries_visited': countries_visited,
        'posts': posts,
        'hobbies': hobbies,
        'github_weeks': github_data.get('weeks', []),
        'github_total': github_data.get('total_contributions', 0)
    }
    return render(request, 'portfolio/index.html', context)


def skills_view(request):
    """Skills page view"""
    import time
    skills = Skills.objects.all().order_by('category', 'name')
    spoken_languages = SpokenLanguage.objects.all().order_by('-is_native', 'name')
    context = {
        'timestamp': int(time.time()),
        'skills': skills,
        'spoken_languages': spoken_languages
    }
    return render(request, 'portfolio/skills.html', context)


def library_view(request):
    """Library page view - combines Projects, Books, Photos, and Posts"""
    import time
    projects = Project.objects.all().order_by('-created_at')
    books = Book.objects.all().order_by('-read_date', '-created_at')
    project_photos = Project.objects.exclude(image='').order_by('-created_at')
    # Get published posts, ordered by published date
    posts = Post.objects.filter(status='published').order_by('-published_date', '-created_at')
    context = {
        'timestamp': int(time.time()),
        'projects': projects,
        'books': books,
        'project_photos': project_photos,
        'posts': posts
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


@api_view(['GET'])
def hobbies_json(request):
    """Get hobbies as JSON"""
    hobbies = Hobby.objects.all().order_by('category', 'name')
    data = [{
        'id': h.id,
        'name': h.name,
        'reason': h.reason,
        'category': h.category,
        'social': h.social,
        'icon': h.icon,
        'created_at': h.created_at.isoformat() if h.created_at else None
    } for h in hobbies]
    return Response({'hobbies': data, 'count': len(data)})


@csrf_exempt
def create_hobby(request):
    """Create a new hobby"""
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Method not allowed'}, status=405)
    
    # Check if user is authenticated
    if not request.user.is_authenticated:
        return JsonResponse({'success': False, 'error': 'Authentication required'}, status=401)
    
    try:
        data = json.loads(request.body)
        name = data.get('name', '').strip()
        
        if not name:
            return JsonResponse({'success': False, 'error': 'Name is required'}, status=400)
        
        # Check if hobby with same name already exists
        if Hobby.objects.filter(name=name).exists():
            return JsonResponse({'success': False, 'error': 'Hobby with this name already exists'}, status=400)
        
        hobby = Hobby.objects.create(
            name=name,
            reason=data.get('reason', ''),
            category=data.get('category', ''),
            icon=data.get('icon', ''),
            social=data.get('social', 'maybe')
        )
        
        return JsonResponse({
            'success': True,
            'message': 'Hobby created successfully',
            'hobby': {
                'id': hobby.id,
                'name': hobby.name,
                'reason': hobby.reason,
                'category': hobby.category,
                'social': hobby.social,
                'icon': hobby.icon
            }
        })
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@csrf_exempt
def create_country(request):
    """Create a new country"""
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Method not allowed'}, status=405)
    
    # Check if user is authenticated
    if not request.user.is_authenticated:
        return JsonResponse({'success': False, 'error': 'Authentication required'}, status=401)
    
    try:
        data = json.loads(request.body)
        name = data.get('name', '').strip()
        
        if not name:
            return JsonResponse({'success': False, 'error': 'Name is required'}, status=400)
        
        # Check if country with same name already exists
        if Country.objects.filter(name=name).exists():
            return JsonResponse({'success': False, 'error': 'Country with this name already exists'}, status=400)
        
        country = Country.objects.create(
            name=name,
            code=data.get('code', '').strip().upper()[:2] if data.get('code') else '',
            flag_emoji=data.get('flag_emoji', '').strip()[:10] if data.get('flag_emoji') else '',
            thoughts=data.get('thoughts', '').strip()[:50] if data.get('thoughts') else ''
        )
        
        return JsonResponse({
            'success': True,
            'message': 'Country created successfully',
            'country': {
                'id': country.id,
                'name': country.name,
                'code': country.code,
                'flag_emoji': country.flag_emoji,
                'thoughts': country.thoughts
            }
        })
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@csrf_exempt
def secret_login(request):
    """Handle secret login authentication"""
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Method not allowed'}, status=405)
    
    try:
        data = json.loads(request.body)
        username = data.get('username', '')
        password = data.get('password', '')
        
        if not username or not password:
            return JsonResponse({'success': False, 'error': 'Username and password required'}, status=400)
        
        # Authenticate user
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            # Login successful
            login(request, user)
            return JsonResponse({
                'success': True,
                'message': 'Login successful',
                'redirect_url': '/admin/'
            })
        else:
            # Invalid credentials
            return JsonResponse({
                'success': False,
                'error': 'Invalid username or password'
            }, status=401)
            
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)
