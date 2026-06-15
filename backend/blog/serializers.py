from rest_framework import serializers

from .models import Attachment, Category, Post


class CategorySerializer(serializers.ModelSerializer):
    post_count = serializers.IntegerField(source="posts.count", read_only=True)

    class Meta:
        model = Category
        fields = ["id", "name", "name_fa", "slug", "description", "icon", "post_count"]


class AttachmentSerializer(serializers.ModelSerializer):
    file = serializers.FileField(use_url=True)

    class Meta:
        model = Attachment
        fields = ["id", "kind", "title", "file", "order"]


class PostListSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)

    class Meta:
        model = Post
        fields = [
            "id", "title", "slug", "category", "language",
            "excerpt", "cover_image", "source_url", "created_at",
        ]


class PostDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    attachments = AttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = Post
        fields = [
            "id", "title", "slug", "category", "language", "excerpt",
            "body", "cover_image", "source_url", "attachments",
            "created_at", "updated_at",
        ]
