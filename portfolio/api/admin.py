from django.contrib import admin
from django import forms
from .models import (
    Country, Project, Book, Hobby,
    Skills, Photo
)


class ProjectAdminForm(forms.ModelForm):
    """Custom form to make skills required"""
    class Meta:
        model = Project
        fields = '__all__'
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['skills'].required = True


@admin.register(Country)
class CountryAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'thoughts', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name', 'code', 'thoughts']


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    form = ProjectAdminForm
    list_display = ['title', 'created_at']
    list_filter = ['created_at', 'skills']
    search_fields = ['title', 'description']
    filter_horizontal = ['skills']  # Better UI for ManyToMany
    date_hierarchy = 'created_at'
    prepopulated_fields = {}


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'rating', 'created_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['title', 'author']
    date_hierarchy = 'created_at'


@admin.register(Photo)
class PhotoAdmin(admin.ModelAdmin):
    list_display = ['title', 'created_at']
    list_filter = ['created_at']
    search_fields = ['title']
    date_hierarchy = 'created_at'


@admin.register(Hobby)
class HobbyAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'reason', 'social', 'created_at']
    list_filter = ['category', 'social', 'created_at']
    search_fields = ['name', 'reason', 'category']


@admin.register(Skills)
class SkillsAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'created_at']
    list_filter = ['category', 'created_at']
    search_fields = ['name', 'description']


