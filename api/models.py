from django.db import models
from django.contrib.auth.hashers import make_password, check_password


class Member(models.Model):
    """
    Custom user model for social network members.
    """
    id = models.AutoField(primary_key=True)
    email = models.EmailField(unique=True, max_length=254)
    password = models.CharField(max_length=128)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    bio = models.TextField(blank=True)
    avatar = models.CharField(max_length=500, blank=True)
    city = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    # Required properties for DRF authentication compatibility
    @property
    def is_authenticated(self):
        return True

    @property
    def is_anonymous(self):
        return False

    def has_perm(self, perm, obj=None):
        """Required for DRF permission classes."""
        return True

    def has_module_perms(self, app_label):
        """Required for DRF permission classes."""
        return True

    def set_password(self, raw_password):
        """Hash and set the password."""
        self.password = make_password(raw_password)

    def check_password(self, raw_password):
        """Verify password against hash."""
        return check_password(raw_password, self.password)

    class Meta:
        db_table = 'members'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"


class Friendship(models.Model):
    """
    Model representing friendship between members.
    """
    member = models.ForeignKey(
        Member,
        on_delete=models.CASCADE,
        related_name='friendships'
    )
    friend = models.ForeignKey(
        Member,
        on_delete=models.CASCADE,
        related_name='friend_of'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'friendships'
        unique_together = ['member', 'friend']
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.member.email} -> {self.friend.email}"


class Post(models.Model):
    """
    Model representing user posts.
    """
    id = models.AutoField(primary_key=True)
    author = models.ForeignKey(
        Member,
        on_delete=models.CASCADE,
        related_name='posts'
    )
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'posts'
        ordering = ['-created_at']

    def __str__(self):
        return f"Post by {self.author.email} at {self.created_at}"


class Like(models.Model):
    """
    Model representing likes on posts.
    """
    member = models.ForeignKey(
        Member,
        on_delete=models.CASCADE,
        related_name='likes'
    )
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name='likes'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'likes'
        unique_together = ['member', 'post']
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.member.email} likes post {self.post.id}"


class Comment(models.Model):
    """
    Model representing comments on posts.
    """
    id = models.AutoField(primary_key=True)
    author = models.ForeignKey(
        Member,
        on_delete=models.CASCADE,
        related_name='comments'
    )
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name='comments'
    )
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'comments'
        ordering = ['created_at']

    def __str__(self):
        return f"Comment by {self.author.email} on post {self.post.id}"
