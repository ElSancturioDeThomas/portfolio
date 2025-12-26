from django.urls import path
from . import views

urlpatterns = [
    path('hello/', views.hello_world, name='hello_world'),
    path('projects/', views.projects_list, name='projects_list'),
    path('skills/', views.skills_list, name='skills_list'),
    path('books/', views.books_list, name='books_list'),
    path('hobbies/', views.hobbies_json, name='hobbies_json'),
]
