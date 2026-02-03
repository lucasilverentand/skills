---
name: django-models
description: Designs Django models and ORM patterns. Use when creating Django models, defining relationships, or working with the Django ORM.
argument-hint: [model-name]
allowed-tools: [Read, Write, Edit, Bash, Glob, Grep]
---

# Django Models

Designs Django models with best practices.

## Your Task

1. **Identify entities**: Understand data requirements
2. **Design models**: Create model classes
3. **Add relationships**: Define foreign keys
4. **Create migrations**: Generate migration files
5. **Test**: Verify model behavior

## Model Example

```python
# models.py
from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid

class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    bio = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        ordering = ['-created_at']

class Post(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    content = models.TextField()
    published = models.BooleanField(default=False)
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='posts'
    )
    tags = models.ManyToManyField('Tag', related_name='posts', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['author', 'published']),
        ]

    def __str__(self):
        return self.title

class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.name
```

## QuerySet Examples

```python
# Get published posts by author
posts = Post.objects.filter(
    author=user,
    published=True
).select_related('author').prefetch_related('tags')

# Aggregate
from django.db.models import Count, Avg
stats = User.objects.annotate(
    post_count=Count('posts'),
).filter(post_count__gt=5)

# Create with related
post = Post.objects.create(
    title='Hello',
    content='World',
    author=user,
)
post.tags.add(tag1, tag2)
```

## Tips

- Use UUIDs for public-facing IDs
- Add indexes for query performance
- Use select_related and prefetch_related
- Keep business logic in model methods
