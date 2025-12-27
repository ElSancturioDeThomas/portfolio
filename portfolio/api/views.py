from django.shortcuts import render
from django.core.cache import cache
from django.conf import settings
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse, HttpResponse
from django.contrib.staticfiles import finders
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Project, Skills, Book, Country, Hobby, Photo
import requests
import json
import os


def get_github_contributions():
    """Fetch GitHub contributions using GraphQL API"""
    import logging
    logger = logging.getLogger(__name__)
    
    # Check cache first
    cached_data = cache.get('github_contributions')
    if cached_data:
        logger.debug("Returning cached GitHub contributions")
        return cached_data
    
    # Get GitHub token from settings
    token = getattr(settings, 'GITHUB_TOKEN', None)
    username = getattr(settings, 'GITHUB_USERNAME', 'ElSancturioDeThomas')
    
    if not token:
        logger.warning("GitHub token not configured - contributions will not be displayed")
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
        
        # Handle different HTTP status codes
        if response.status_code == 200:
            data = response.json()
            
            # Check for GraphQL errors (even with 200 status)
            if 'errors' in data:
                error_messages = [err.get('message', 'Unknown error') for err in data['errors']]
                logger.error(f"GitHub GraphQL API errors: {', '.join(error_messages)}")
                # Don't cache errors - return empty but don't cache
                return {'weeks': [], 'total_contributions': 0}
            
            # Check if data structure is valid
            if 'data' in data and data['data'] and 'user' in data['data']:
                user_data = data['data']['user']
                
                # Check if user exists (might be None if user not found)
                if user_data is None:
                    logger.error(f"GitHub user '{username}' not found")
                    return {'weeks': [], 'total_contributions': 0}
                
                contributions_collection = user_data.get('contributionsCollection')
                if not contributions_collection:
                    logger.error(f"No contributions collection found for user '{username}'")
                    return {'weeks': [], 'total_contributions': 0}
                
                calendar_data = contributions_collection.get('contributionCalendar', {})
                weeks = calendar_data.get('weeks', [])
                total_contributions = calendar_data.get('totalContributions', 0)
                
                if not weeks:
                    logger.warning(f"No contribution weeks found for user '{username}'")
                    return {'weeks': [], 'total_contributions': 0}
                
                result = {
                    'weeks': weeks,
                    'total_contributions': total_contributions
                }
                
                # Cache for 1 hour only if we got valid data
                cache.set('github_contributions', result, 3600)
                logger.info(f"Successfully fetched GitHub contributions: {total_contributions} total")
                return result
            else:
                logger.error(f"Invalid response structure from GitHub API: {data}")
                return {'weeks': [], 'total_contributions': 0}
                
        elif response.status_code == 401:
            logger.error("GitHub API authentication failed - token may be invalid or expired")
            return {'weeks': [], 'total_contributions': 0}
        elif response.status_code == 403:
            logger.error("GitHub API access forbidden - token may lack required permissions")
            return {'weeks': [], 'total_contributions': 0}
        elif response.status_code == 429:
            logger.warning("GitHub API rate limit exceeded - will retry after cache expires")
            # Return empty but don't cache, so it retries sooner
            return {'weeks': [], 'total_contributions': 0}
        else:
            logger.error(f"GitHub API returned status {response.status_code}: {response.text[:200]}")
            return {'weeks': [], 'total_contributions': 0}
            
    except requests.exceptions.Timeout:
        logger.error("GitHub API request timed out")
        return {'weeks': [], 'total_contributions': 0}
    except requests.exceptions.RequestException as e:
        logger.error(f"GitHub API request failed: {e}")
        return {'weeks': [], 'total_contributions': 0}
    except Exception as e:
        logger.exception(f"Unexpected error fetching GitHub contributions: {e}")
        return {'weeks': [], 'total_contributions': 0}


def favicon_view(request):
    """Serve favicon at root path for browser compatibility"""
    favicon_path = finders.find('portfolio/assets/TigerFavicon32x32.png')
    if favicon_path:
        with open(favicon_path, 'rb') as f:
            return HttpResponse(f.read(), content_type='image/png')
    return HttpResponse(status=404)


def index(request):
    """Home page view with brief description"""
    import time
    import logging
    from django.db import DatabaseError
    
    logger = logging.getLogger(__name__)
    
    # Get all countries from Country model with flag emojis
    # Wrap in try/except to handle database connection issues gracefully
    try:
        countries_visited = Country.objects.all().order_by('name')
    except (DatabaseError, Exception) as e:
        logger.error(f"Error fetching countries: {e}")
        countries_visited = []
    
    # Get all hobbies, ordered by category
    try:
        hobbies = Hobby.objects.all().order_by('category', 'name')
    except (DatabaseError, Exception) as e:
        logger.error(f"Error fetching hobbies: {e}")
        hobbies = []
    
    # Get GitHub contributions (already has error handling)
    try:
        github_data = get_github_contributions()
    except Exception as e:
        logger.error(f"Error fetching GitHub contributions: {e}")
        github_data = {'weeks': [], 'total_contributions': 0}
    
    context = {
        'timestamp': int(time.time()),
        'countries_visited': countries_visited,
        'hobbies': hobbies,
        'github_weeks': github_data.get('weeks', []),
        'github_total': github_data.get('total_contributions', 0)
    }
    return render(request, 'portfolio/index.html', context)


def skills_view(request):
    """Skills page view"""
    import time
    import logging
    from itertools import groupby
    from django.db import DatabaseError
    
    logger = logging.getLogger(__name__)
    
    # Get all skills ordered by category and name
    try:
        skills = Skills.objects.all().order_by('category', 'name')
    except (DatabaseError, Exception) as e:
        logger.error(f"Error fetching skills: {e}")
        skills = []
    
    # Group skills by category
    skills_by_category = {}
    for skill in skills:
        category = skill.category or 'Uncategorized'
        if category not in skills_by_category:
            skills_by_category[category] = []
        skills_by_category[category].append(skill)
    
    # Define the order of categories
    category_order = [
        'Programming Languages',
        'Soft',
        'Hard',
        'Spoken Languages'
    ]
    
    # Sort categories according to the defined order
    ordered_categories = []
    for cat in category_order:
        if cat in skills_by_category:
            ordered_categories.append((cat, skills_by_category[cat]))
    
    # Add any uncategorized or other categories not in the list
    for cat, skill_list in skills_by_category.items():
        if cat not in category_order:
            ordered_categories.append((cat, skill_list))
    
    context = {
        'timestamp': int(time.time()),
        'skills_by_category': ordered_categories,
    }
    return render(request, 'portfolio/skills.html', context)


def library_view(request):
    """Library page view - combines Projects, Books, Photos, and Posts"""
    import time
    import logging
    from django.template.loader import render_to_string
    from django.db import DatabaseError
    
    logger = logging.getLogger(__name__)
    
    # Get section from query parameter, default to 'projects'
    section = request.GET.get('section', 'projects')
    
    # Validate section
    valid_sections = ['projects', 'books', 'photos']
    if section not in valid_sections:
        section = 'projects'
    
    # Fetch data from Django with error handling
    try:
        projects = Project.objects.all().order_by('-created_at')
    except (DatabaseError, Exception) as e:
        logger.error(f"Error fetching projects: {e}")
        projects = []
    
    try:
        books = Book.objects.all().order_by('-created_at')
    except (DatabaseError, Exception) as e:
        logger.error(f"Error fetching books: {e}")
        books = []
    
    try:
        photos = Photo.objects.all().order_by('-created_at')
    except (DatabaseError, Exception) as e:
        logger.error(f"Error fetching photos: {e}")
        photos = []
    
    context = {
        'timestamp': int(time.time()),
        'projects': projects,
        'books': books,
        'photos': photos,
        'active_section': section,  # Pass active section to template
    }
    
    # If AJAX request, return just the section HTML
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        # Render just the section content
        section_html = render_to_string('portfolio/library_section.html', {
            'section': section,
            'projects': projects,
            'books': books,
            'photos': photos,
            'user': request.user,
        })
        return JsonResponse({'html': section_html})
    
    # Normal request - return full page
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
def create_project(request):
    """Create a new project"""
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Method not allowed'}, status=405)
    
    # Check if user is authenticated
    if not request.user.is_authenticated:
        return JsonResponse({'success': False, 'error': 'Authentication required'}, status=401)
    
    try:
        title = request.POST.get('title', '').strip()
        description = request.POST.get('description', '').strip()
        image = request.FILES.get('image', None)
        
        if not title:
            return JsonResponse({'success': False, 'error': 'Title is required'}, status=400)
        
        if not description:
            return JsonResponse({'success': False, 'error': 'Description is required'}, status=400)
        
        if not image:
            return JsonResponse({'success': False, 'error': 'Image is required'}, status=400)
        
        # Create project
        project = Project.objects.create(
            title=title,
            description=description,
            image=image
        )
        
        return JsonResponse({
            'success': True,
            'message': 'Project created successfully',
            'project': {
                'id': project.id,
                'title': project.title,
                'description': project.description,
            }
        })
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@csrf_exempt
def create_book(request):
    """Create a new book"""
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Method not allowed'}, status=405)
    
    # Check if user is authenticated
    if not request.user.is_authenticated:
        return JsonResponse({'success': False, 'error': 'Authentication required'}, status=401)
    
    try:
        title = request.POST.get('title', '').strip()
        author = request.POST.get('author', '').strip()
        rating = request.POST.get('rating', '')
        cover_image = request.FILES.get('cover_image', None)
        
        if not title:
            return JsonResponse({'success': False, 'error': 'Title is required'}, status=400)
        
        if not author:
            return JsonResponse({'success': False, 'error': 'Author is required'}, status=400)
        
        if not cover_image:
            return JsonResponse({'success': False, 'error': 'Cover image is required'}, status=400)
        
        # Create book
        book = Book.objects.create(
            title=title,
            author=author,
            rating=int(rating) if rating else None,
            cover_image=cover_image
        )
        
        return JsonResponse({
            'success': True,
            'message': 'Book created successfully',
            'book': {
                'id': book.id,
                'title': book.title,
                'author': book.author,
                'rating': book.rating,
            }
        })
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@csrf_exempt
def create_photo(request):
    """Create a new photo"""
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Method not allowed'}, status=405)
    
    # Check if user is authenticated
    if not request.user.is_authenticated:
        return JsonResponse({'success': False, 'error': 'Authentication required'}, status=401)
    
    try:
        title = request.POST.get('title', '').strip()
        image = request.FILES.get('image', None)
        
        if not title:
            return JsonResponse({'success': False, 'error': 'Title is required'}, status=400)
        
        if not image:
            return JsonResponse({'success': False, 'error': 'Image is required'}, status=400)
        
        # Create photo
        photo = Photo.objects.create(
            title=title,
            image=image
        )
        
        return JsonResponse({
            'success': True,
            'message': 'Photo created successfully',
            'photo': {
                'id': photo.id,
                'title': photo.title,
            }
        })
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@csrf_exempt
def create_skill(request):
    """Create a new skill"""
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Method not allowed'}, status=405)
    
    # Check if user is authenticated
    if not request.user.is_authenticated:
        return JsonResponse({'success': False, 'error': 'Authentication required'}, status=401)
    
    try:
        # Handle both JSON (legacy) and FormData (with file upload)
        if request.content_type and 'application/json' in request.content_type:
            data = json.loads(request.body)
            name = data.get('name', '').strip()
            category = data.get('category', '')
            icon = None
        else:
            # FormData with file upload
            name = request.POST.get('name', '').strip()
            category = request.POST.get('category', '')
            icon = request.FILES.get('icon', None)
        
        if not name:
            return JsonResponse({'success': False, 'error': 'Name is required'}, status=400)
        
        # Check if skill with same name already exists (case-insensitive)
        if Skills.objects.filter(name__iexact=name).exists():
            return JsonResponse({'success': False, 'error': 'Skill with this name already exists'}, status=400)
        
        skill = Skills.objects.create(
            name=name,
            category=category,
            icon=icon
        )
        
        return JsonResponse({
            'success': True,
            'message': 'Skill created successfully',
            'skill': {
                'id': skill.id,
                'name': skill.name,
                'category': skill.category,
                'has_icon': bool(skill.icon)
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
