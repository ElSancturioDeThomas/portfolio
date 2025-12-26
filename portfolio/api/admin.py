from django.contrib import admin
from .models import (
    Country, Project, Book, Hobby,
    SpokenLanguage, Skills, Post
)


@admin.register(Country)
class CountryAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'thoughts', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name', 'code', 'thoughts']


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['title', 'featured', 'start_date', 'end_date', 'created_at']
    list_filter = ['featured', 'start_date', 'created_at']
    search_fields = ['title', 'description', 'technologies']
    date_hierarchy = 'created_at'
    prepopulated_fields = {}


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'project', 'read_date', 'rating', 'created_at']
    list_filter = ['rating', 'read_date', 'created_at']
    search_fields = ['title', 'author', 'isbn']
    raw_id_fields = ['project']
    date_hierarchy = 'read_date'


@admin.register(Hobby)
class HobbyAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'reason', 'social', 'created_at']
    list_filter = ['category', 'social', 'created_at']
    search_fields = ['name', 'reason', 'category']


@admin.register(SpokenLanguage)
class SpokenLanguageAdmin(admin.ModelAdmin):
    list_display = ['name', 'proficiency_level', 'is_native', 'created_at']
    list_filter = ['proficiency_level', 'is_native', 'created_at']
    search_fields = ['name']


@admin.register(Skills)
class SkillsAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'created_at']
    list_filter = ['category', 'created_at']
    search_fields = ['name', 'description']


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ['title', 'status', 'published_date', 'created_at', 'updated_at']
    list_filter = ['status', 'published_date', 'created_at']
    search_fields = ['title', 'content', 'tags']
    prepopulated_fields = {'slug': ('title',)}
    date_hierarchy = 'published_date'
