from rest_framework import viewsets

from .models import Category, Post
from .serializers import (
    CategorySerializer,
    PostDetailSerializer,
    PostListSerializer,
)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = "slug"


class PostViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PostListSerializer
    lookup_field = "slug"
    filterset_fields = ["category__slug", "language"]
    search_fields = ["title", "excerpt", "body"]
    ordering_fields = ["created_at", "title"]

    def get_queryset(self):
        return (
            Post.objects.filter(is_published=True)
            .select_related("category")
            .prefetch_related("attachments")
        )

    def get_serializer_class(self):
        if self.action == "retrieve":
            return PostDetailSerializer
        return PostListSerializer
