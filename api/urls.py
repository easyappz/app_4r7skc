from django.urls import path
from .views import (
    RegisterView,
    LoginView,
    LogoutView,
    MeView,
    MemberListView,
    MemberDetailView,
    FriendToggleView,
    PostListCreateView,
    PostDetailView,
    PostLikeView,
    CommentListCreateView,
    CommentDeleteView
)

urlpatterns = [
    # Authentication endpoints
    path('auth/register', RegisterView.as_view(), name='register'),
    path('auth/login', LoginView.as_view(), name='login'),
    path('auth/logout', LogoutView.as_view(), name='logout'),
    path('auth/me', MeView.as_view(), name='me'),
    
    # Members endpoints
    path('members', MemberListView.as_view(), name='member-list'),
    path('members/<int:pk>', MemberDetailView.as_view(), name='member-detail'),
    path('members/<int:pk>/friend', FriendToggleView.as_view(), name='friend-toggle'),
    
    # Posts endpoints
    path('posts', PostListCreateView.as_view(), name='post-list-create'),
    path('posts/<int:pk>', PostDetailView.as_view(), name='post-detail'),
    path('posts/<int:pk>/like', PostLikeView.as_view(), name='post-like'),
    
    # Comments endpoints
    path('posts/<int:pk>/comments', CommentListCreateView.as_view(), name='comment-list-create'),
    path('comments/<int:pk>', CommentDeleteView.as_view(), name='comment-delete'),
]
