from django.urls import path
from . import views

urlpatterns = [
    path('hello/', views.hello_world, name='hello_world'),
    path('projects/', views.projects_list, name='projects_list'),
    path('projects/create/', views.create_project, name='create_project'),
    path('skills/', views.skills_list, name='skills_list'),
    path('skills/create/', views.create_skill, name='create_skill'),
    path('books/', views.books_list, name='books_list'),
    path('books/create/', views.create_book, name='create_book'),
    path('photos/create/', views.create_photo, name='create_photo'),
    path('hobbies/', views.hobbies_json, name='hobbies_json'),
    path('hobbies/create/', views.create_hobby, name='create_hobby'),
    path('countries/create/', views.create_country, name='create_country'),
    path('secret-login/', views.secret_login, name='secret_login'),
]
