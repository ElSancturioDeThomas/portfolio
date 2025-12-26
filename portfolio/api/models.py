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
    technologies = models.CharField(max_length=500, help_text="Comma-separated list of technologies")
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    project_link = models.URLField(max_length=500, blank=True, null=True)
    github_link = models.URLField(max_length=500, blank=True, null=True)
    image = models.ImageField(upload_to='projects/', blank=True, null=True)
    featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class Book(models.Model):
    """Books read (Library)"""
    project = models.ForeignKey(
        Project,
        on_delete=models.SET_NULL,
        related_name='books',
        null=True,
        blank=True
    )
    title = models.CharField(max_length=200)
    author = models.CharField(max_length=200)
    isbn = models.CharField(max_length=20, blank=True)
    read_date = models.DateField(null=True, blank=True)
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        null=True,
        blank=True,
        help_text="Rating from 1-5"
    )
    review = models.TextField(blank=True)
    cover_image = models.ImageField(upload_to='books/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-read_date', '-created_at']

    def __str__(self):
        return f"{self.title} by {self.author}"


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


class SpokenLanguage(models.Model):
    """Languages spoken"""
    PROFICIENCY_LEVELS = [
        ('native', 'Native'),
        ('fluent', 'Fluent'),
        ('conversational', 'Conversational'),
        ('basic', 'Basic'),
    ]

    name = models.CharField(max_length=50, unique=True)
    proficiency_level = models.CharField(max_length=20, choices=PROFICIENCY_LEVELS)
    is_native = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-is_native', 'name']

    def __str__(self):
        native_str = " (Native)" if self.is_native else ""
        return f"{self.name} - {self.get_proficiency_level_display()}{native_str}"


class Skills(models.Model):
    """General skills and competencies"""

    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=50, blank=True)
    icon = models.CharField(max_length=100, blank=True, help_text="Icon class or name")
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['category', 'name']
        verbose_name = "Skill"
        verbose_name_plural = "Skills"

    def __str__(self):
        return self.name


class Post(models.Model):
    """Blog posts or portfolio posts"""
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
    ]

    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    content = models.TextField()
    excerpt = models.TextField(max_length=500, blank=True, help_text="Short summary")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='draft')
    featured_image = models.ImageField(upload_to='posts/', blank=True, null=True)
    published_date = models.DateTimeField(null=True, blank=True)
    tags = models.CharField(max_length=200, blank=True, help_text="Comma-separated tags")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-published_date', '-created_at']

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if self.status == 'published' and not self.published_date:
            self.published_date = timezone.now()
        super().save(*args, **kwargs)
