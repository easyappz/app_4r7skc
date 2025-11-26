from rest_framework import serializers
from api.models import Member, Post, Comment, Friendship, Like


class RegisterSerializer(serializers.Serializer):
    """
    Serializer for member registration.
    """
    email = serializers.EmailField(max_length=254)
    password = serializers.CharField(min_length=8, write_only=True)
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)

    def validate_email(self, value):
        """Check if email is already in use."""
        if Member.objects.filter(email=value).exists():
            raise serializers.ValidationError("A member with this email already exists.")
        return value

    def create(self, validated_data):
        """Create a new member with hashed password."""
        member = Member(
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name']
        )
        member.set_password(validated_data['password'])
        member.save()
        return member


class LoginSerializer(serializers.Serializer):
    """
    Serializer for member login.
    """
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class MemberSerializer(serializers.ModelSerializer):
    """
    Serializer for full member information.
    """
    friends_count = serializers.SerializerMethodField()
    is_friend = serializers.SerializerMethodField()

    class Meta:
        model = Member
        fields = [
            'id',
            'email',
            'first_name',
            'last_name',
            'bio',
            'avatar',
            'city',
            'created_at',
            'friends_count',
            'is_friend'
        ]
        read_only_fields = ['id', 'created_at']

    def get_friends_count(self, obj):
        """Get the count of friends for this member."""
        return Friendship.objects.filter(member=obj).count()

    def get_is_friend(self, obj):
        """Check if current user is friends with this member."""
        request = self.context.get('request')
        if not request or not hasattr(request, 'user') or not request.user.is_authenticated:
            return False
        
        current_user = request.user
        if current_user.id == obj.id:
            return False
        
        return Friendship.objects.filter(
            member=current_user,
            friend=obj
        ).exists()


class MemberUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating member profile.
    """
    class Meta:
        model = Member
        fields = ['first_name', 'last_name', 'bio', 'avatar', 'city', 'email']

    def validate_email(self, value):
        """Check if email is already in use by another member."""
        instance = self.instance
        if instance and Member.objects.filter(email=value).exclude(id=instance.id).exists():
            raise serializers.ValidationError("A member with this email already exists.")
        return value


class PostSerializer(serializers.ModelSerializer):
    """
    Serializer for posts with full information.
    """
    author = MemberSerializer(read_only=True)
    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            'id',
            'author',
            'content',
            'created_at',
            'likes_count',
            'comments_count',
            'is_liked'
        ]
        read_only_fields = ['id', 'author', 'created_at']

    def get_likes_count(self, obj):
        """Get the count of likes for this post."""
        return Like.objects.filter(post=obj).count()

    def get_comments_count(self, obj):
        """Get the count of comments for this post."""
        return Comment.objects.filter(post=obj).count()

    def get_is_liked(self, obj):
        """Check if current user liked this post."""
        request = self.context.get('request')
        if not request or not hasattr(request, 'user') or not request.user.is_authenticated:
            return False
        
        return Like.objects.filter(
            member=request.user,
            post=obj
        ).exists()


class PostCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating a new post.
    """
    class Meta:
        model = Post
        fields = ['content']

    def create(self, validated_data):
        """Create a new post with the current user as author."""
        request = self.context.get('request')
        validated_data['author'] = request.user
        return super().create(validated_data)


class CommentSerializer(serializers.ModelSerializer):
    """
    Serializer for comments with full information.
    """
    author = MemberSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'author', 'content', 'created_at']
        read_only_fields = ['id', 'author', 'created_at']


class CommentCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating a new comment.
    """
    class Meta:
        model = Comment
        fields = ['content']

    def create(self, validated_data):
        """Create a new comment with the current user as author."""
        request = self.context.get('request')
        post_id = self.context.get('post_id')
        
        validated_data['author'] = request.user
        validated_data['post_id'] = post_id
        
        return super().create(validated_data)
