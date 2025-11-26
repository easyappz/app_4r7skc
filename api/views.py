from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import Member, Post, Comment, Like, Friendship
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    MemberSerializer,
    MemberUpdateSerializer,
    PostSerializer,
    PostCreateSerializer,
    CommentSerializer,
    CommentCreateSerializer
)
from .authentication import (
    CookieAuthentication,
    IsAuthenticatedMember,
    set_auth_cookie,
    clear_auth_cookie
)


class RegisterView(APIView):
    """
    API endpoint for member registration.
    """
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        """Register a new member."""
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            member = serializer.save()
            response_data = {
                'id': member.id,
                'email': member.email,
                'first_name': member.first_name,
                'last_name': member.last_name,
                'created_at': member.created_at
            }
            return Response(response_data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """
    API endpoint for member login.
    """
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        """Authenticate member and set session cookie."""
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            
            try:
                member = Member.objects.get(email=email)
                if member.check_password(password):
                    response_data = {
                        'id': member.id,
                        'email': member.email,
                        'first_name': member.first_name,
                        'last_name': member.last_name
                    }
                    response = Response(response_data, status=status.HTTP_200_OK)
                    set_auth_cookie(response, member.id)
                    return response
            except Member.DoesNotExist:
                pass
            
            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    """
    API endpoint for member logout.
    """
    authentication_classes = [CookieAuthentication]
    permission_classes = [IsAuthenticatedMember]

    def post(self, request):
        """End current session and clear cookie."""
        response = Response(
            {'message': 'Successfully logged out'},
            status=status.HTTP_200_OK
        )
        clear_auth_cookie(response)
        return response


class MeView(APIView):
    """
    API endpoint to get current member information.
    """
    authentication_classes = [CookieAuthentication]
    permission_classes = [IsAuthenticatedMember]

    def get(self, request):
        """Retrieve current member information."""
        serializer = MemberSerializer(request.user, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class MemberListView(APIView):
    """
    API endpoint to search and list members.
    """
    authentication_classes = [CookieAuthentication]
    permission_classes = [IsAuthenticatedMember]

    def get(self, request):
        """Search members by name or email."""
        search_query = request.query_params.get('search', '')
        
        members = Member.objects.all()
        
        if search_query:
            members = members.filter(
                Q(first_name__icontains=search_query) |
                Q(last_name__icontains=search_query) |
                Q(email__icontains=search_query)
            )
        
        serializer = MemberSerializer(
            members,
            many=True,
            context={'request': request}
        )
        return Response(serializer.data, status=status.HTTP_200_OK)


class MemberDetailView(APIView):
    """
    API endpoint to get or update member profile.
    """
    authentication_classes = [CookieAuthentication]
    permission_classes = [IsAuthenticatedMember]

    def get(self, request, id):
        """Retrieve member profile by ID."""
        member = get_object_or_404(Member, id=id)
        serializer = MemberSerializer(member, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, id):
        """Update member profile (only own profile)."""
        member = get_object_or_404(Member, id=id)
        
        # Check if user is updating their own profile
        if request.user.id != member.id:
            return Response(
                {'error': 'Cannot update other member\'s profile'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = MemberUpdateSerializer(
            member,
            data=request.data,
            partial=True,
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save()
            response_serializer = MemberSerializer(
                member,
                context={'request': request}
            )
            return Response(response_serializer.data, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class FriendToggleView(APIView):
    """
    API endpoint to add or remove friend.
    """
    authentication_classes = [CookieAuthentication]
    permission_classes = [IsAuthenticatedMember]

    def post(self, request, id):
        """Toggle friendship with another member."""
        friend = get_object_or_404(Member, id=id)
        
        # Check if trying to add self as friend
        if request.user.id == friend.id:
            return Response(
                {'error': 'Cannot add yourself as friend'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if friendship exists
        friendship = Friendship.objects.filter(
            member=request.user,
            friend=friend
        ).first()
        
        if friendship:
            # Remove friendship
            friendship.delete()
            return Response(
                {
                    'is_friend': False,
                    'message': 'Friend removed'
                },
                status=status.HTTP_200_OK
            )
        else:
            # Add friendship
            Friendship.objects.create(
                member=request.user,
                friend=friend
            )
            return Response(
                {
                    'is_friend': True,
                    'message': 'Friend added'
                },
                status=status.HTTP_200_OK
            )


class PostListCreateView(APIView):
    """
    API endpoint to list news feed and create posts.
    """
    authentication_classes = [CookieAuthentication]
    permission_classes = [IsAuthenticatedMember]

    def get(self, request):
        """Get news feed (posts from friends and own posts)."""
        # Get list of friend IDs
        friend_ids = Friendship.objects.filter(
            member=request.user
        ).values_list('friend_id', flat=True)
        
        # Get posts from friends and own posts
        posts = Post.objects.filter(
            Q(author=request.user) | Q(author_id__in=friend_ids)
        ).order_by('-created_at')
        
        serializer = PostSerializer(
            posts,
            many=True,
            context={'request': request}
        )
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        """Create a new post."""
        serializer = PostCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            post = serializer.save()
            response_serializer = PostSerializer(
                post,
                context={'request': request}
            )
            return Response(
                response_serializer.data,
                status=status.HTTP_201_CREATED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PostDetailView(APIView):
    """
    API endpoint to get or delete a specific post.
    """
    authentication_classes = [CookieAuthentication]
    permission_classes = [IsAuthenticatedMember]

    def get(self, request, id):
        """Retrieve a specific post by ID."""
        post = get_object_or_404(Post, id=id)
        serializer = PostSerializer(post, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, id):
        """Delete own post."""
        post = get_object_or_404(Post, id=id)
        
        # Check if user is the author
        if post.author.id != request.user.id:
            return Response(
                {'error': 'Cannot delete other member\'s post'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        post.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class PostLikeView(APIView):
    """
    API endpoint to toggle like on a post.
    """
    authentication_classes = [CookieAuthentication]
    permission_classes = [IsAuthenticatedMember]

    def post(self, request, id):
        """Like or unlike a post."""
        post = get_object_or_404(Post, id=id)
        
        # Check if like exists
        like = Like.objects.filter(
            member=request.user,
            post=post
        ).first()
        
        if like:
            # Unlike
            like.delete()
            likes_count = Like.objects.filter(post=post).count()
            return Response(
                {
                    'is_liked': False,
                    'likes_count': likes_count,
                    'message': 'Post unliked'
                },
                status=status.HTTP_200_OK
            )
        else:
            # Like
            Like.objects.create(
                member=request.user,
                post=post
            )
            likes_count = Like.objects.filter(post=post).count()
            return Response(
                {
                    'is_liked': True,
                    'likes_count': likes_count,
                    'message': 'Post liked'
                },
                status=status.HTTP_200_OK
            )


class CommentListCreateView(APIView):
    """
    API endpoint to list and create comments on a post.
    """
    authentication_classes = [CookieAuthentication]
    permission_classes = [IsAuthenticatedMember]

    def get(self, request, id):
        """Get all comments for a specific post."""
        post = get_object_or_404(Post, id=id)
        comments = Comment.objects.filter(post=post).order_by('created_at')
        serializer = CommentSerializer(
            comments,
            many=True,
            context={'request': request}
        )
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, id):
        """Create a new comment on a post."""
        post = get_object_or_404(Post, id=id)
        
        serializer = CommentCreateSerializer(
            data=request.data,
            context={'request': request, 'post_id': post.id}
        )
        
        if serializer.is_valid():
            comment = serializer.save()
            response_serializer = CommentSerializer(
                comment,
                context={'request': request}
            )
            return Response(
                response_serializer.data,
                status=status.HTTP_201_CREATED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CommentDeleteView(APIView):
    """
    API endpoint to delete a comment.
    """
    authentication_classes = [CookieAuthentication]
    permission_classes = [IsAuthenticatedMember]

    def delete(self, request, id):
        """Delete own comment."""
        comment = get_object_or_404(Comment, id=id)
        
        # Check if user is the author
        if comment.author.id != request.user.id:
            return Response(
                {'error': 'Cannot delete other member\'s comment'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        comment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
