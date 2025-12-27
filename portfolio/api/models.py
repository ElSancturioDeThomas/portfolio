from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone


class Country(models.Model):
    """Countries visited or related to"""
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=2, blank=True, help_text="ISO country code (e.g., US, AU)")
    flag_emoji = models.CharField(max_length=10, blank=True, help_text="Flag emoji or icon")
    thoughts = models.CharField(max_length=50, blank=True, help_text="One word opinion about the country")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']
        verbose_name_plural = "Countries"

    def __str__(self):
        return self.name


class Project(models.Model):
    """Portfolio project model"""
    title = models.CharField(max_length=200)
    description = models.TextField()
    image = models.ImageField(upload_to='projects/', help_text="Project image (required)")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class Book(models.Model):
    """Books read (Library)"""
    title = models.CharField(max_length=200)
    author = models.CharField(max_length=200)
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        null=True,
        blank=True,
        help_text="Rating from 1-5"
    )
    cover_image = models.ImageField(upload_to='books/', help_text="Book cover image (required)")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} by {self.author}"


class Photo(models.Model):
    """Photos in the library"""
    title = models.CharField(max_length=200)
    image = models.ImageField(upload_to='photos/', help_text="Photo image (required)")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class Hobby(models.Model):
    """Hobbies and interests"""
    SOCIAL_CHOICES = [
        ('yes', 'Yes'),
        ('no', 'No'),
        ('maybe', 'Maybe'),
    ]
    
    name = models.CharField(max_length=100, unique=True)
    reason = models.CharField(max_length=200, blank=True, help_text="Why this hobby is important")
    social = models.CharField(max_length=10, choices=SOCIAL_CHOICES, default='maybe', help_text="Is this a social activity?")
    category = models.CharField(max_length=50, blank=True, help_text="e.g., Sports, Arts, Music")
    icon = models.CharField(max_length=100, blank=True, help_text="Icon class or name")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['category', 'name']
        verbose_name_plural = "Hobbies"

    def __str__(self):
        return self.name


class Skills(models.Model):
    """General skills and competencies"""
    
    CATEGORY_CHOICES = [
        ('Programming Languages', 'Programming Languages'),
        ('Soft', 'Soft'),
        ('Hard', 'Hard'),
        ('Spoken Languages', 'Spoken Languages'),
    ]

    name = models.CharField(max_length=100, unique=True)
    icon = models.ImageField(upload_to='skills/icons/', blank=True, null=True, help_text="Icon/image for this skill")
    category = models.CharField(
        max_length=50, 
        choices=CATEGORY_CHOICES, 
        blank=True,
        help_text="Select the category for this skill"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['category', 'name']
        verbose_name = "Skill"
        verbose_name_plural = "Skills"

    def __str__(self):
        return self.name


