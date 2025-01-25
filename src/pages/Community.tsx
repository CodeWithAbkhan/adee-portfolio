import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Upload, Link as LinkIcon, Image as ImageIcon, FileText, Check, Loader, X, ThumbsUp, ThumbsDown, MessageCircle, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Community() {
  const [session, setSession] = useState(null);
  const [posts, setPosts] = useState([]);
  const [file, setFile] = useState(null);
  const [link, setLink] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [showComments, setShowComments] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate('/signin');
      }
    });

    const fetchPosts = async () => {
      try {
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select(`
            *,
            profiles:user_id (
              id,
              username,
              avatar_url,
              is_verified
            ),
            post_reactions (
              id,
              type,
              user_id
            ),
            comments (
              id,
              content,
              created_at,
              user_id,
              profiles:user_id (
                username,
                avatar_url,
                is_verified
              )
            )
          `)
          .order('created_at', { ascending: false });

        if (postsError) throw postsError;
        setPosts(postsData || []);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchPosts();

    const postsSubscription = supabase
      .channel('public:posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, fetchPosts)
      .subscribe();

    const reactionsSubscription = supabase
      .channel('public:post_reactions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'post_reactions' }, fetchPosts)
      .subscribe();

    const commentsSubscription = supabase
      .channel('public:comments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, fetchPosts)
      .subscribe();

    return () => {
      postsSubscription.unsubscribe();
      reactionsSubscription.unsubscribe();
      commentsSubscription.unsubscribe();
    };
  }, [navigate]);

  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > 50 * 1024 * 1024) {
      alert('File size must be less than 50MB');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(selectedFile.type)) {
      alert('Only images (JPEG, PNG, GIF) are allowed');
      return;
    }

    setFile(selectedFile);
    
    const preview = URL.createObjectURL(selectedFile);
    setPreviewUrl(preview);

    return () => URL.revokeObjectURL(preview);
  };

  const handlePost = async () => {
    if (!session || (!file && !link && !content)) {
      alert('Please add some content to your post');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      let fileUrl = null;
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('community-files')
          .upload(`public/${fileName}`, file, {
            cacheControl: '3600',
            upsert: true,
            onUploadProgress: (progress) => {
              const percentage = (progress.loaded / progress.total) * 100;
              setUploadProgress(Math.round(percentage));
            },
          });

        if (uploadError) throw uploadError;
        fileUrl = `public/${fileName}`;
      }

      const { error: postError } = await supabase.from('posts').insert({
        user_id: session.user.id,
        content: content || link || null,
        file_url: fileUrl,
        type: file ? 'file' : link ? 'link' : 'text'
      });

      if (postError) throw postError;
      
      setFile(null);
      setLink('');
      setContent('');
      setPreviewUrl(null);
      setShowCreatePost(false);
      setUploadProgress(0);
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Error creating post. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleReaction = async (postId, type) => {
    if (!session) return;

    try {
      const { data: existingReaction } = await supabase
        .from('post_reactions')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', session.user.id)
        .single();

      if (existingReaction) {
        if (existingReaction.type === type) {
          // Remove reaction if clicking the same type
          await supabase
            .from('post_reactions')
            .delete()
            .eq('id', existingReaction.id);
        } else {
          // Update reaction type if different
          await supabase
            .from('post_reactions')
            .update({ type })
            .eq('id', existingReaction.id);
        }
      } else {
        // Add new reaction
        await supabase
          .from('post_reactions')
          .insert({
            post_id: postId,
            user_id: session.user.id,
            type
          });
      }
    } catch (error) {
      console.error('Error handling reaction:', error);
    }
  };

  const handleComment = async (postId) => {
    if (!session || !newComment[postId]?.trim()) return;

    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: session.user.id,
          content: newComment[postId]
        });

      if (error) throw error;
      setNewComment({ ...newComment, [postId]: '' });
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const getFilePreview = (post) => {
    if (post.type !== 'file' || !post.file_url) return null;

    const fileUrl = supabase.storage
      .from('community-files')
      .getPublicUrl(post.file_url)
      .data.publicUrl;

    return (
      <div className="relative group">
        <img
          src={fileUrl}
          alt="Shared content"
          className="w-full rounded-lg shadow-lg transition-transform duration-300 group-hover:scale-[1.02]"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = 'https://via.placeholder.com/800x400?text=Image+Not+Found';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
      </div>
    );
  };

  const getAvatarUrl = (profile) => {
    if (!profile?.avatar_url) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.username || 'User')}&background=random`;
    }
    return supabase.storage
      .from('avatars')
      .getPublicUrl(profile.avatar_url)
      .data.publicUrl;
  };

  const getUserReaction = (post) => {
    if (!session) return null;
    return post.post_reactions?.find(r => r.user_id === session.user.id)?.type;
  };

  const getReactionCount = (post, type) => {
    return post.post_reactions?.filter(r => r.type === type).length || 0;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Community
            </h1>
            <button
              onClick={() => setShowCreatePost(true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-md"
            >
              Share Post
            </button>
          </div>

          {/* Post Creation Modal */}
          {showCreatePost && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-xl transform transition-all">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Create a Post
                  </h2>
                  <button
                    onClick={() => {
                      setShowCreatePost(false);
                      setPreviewUrl(null);
                      setFile(null);
                    }}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  {/* Text Content */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      What's on your mind?
                    </label>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                      rows={4}
                      placeholder="Share your thoughts..."
                    />
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Add an Image
                    </label>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center justify-center px-6 py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:border-indigo-500 hover:bg-indigo-50 transition-all cursor-pointer group">
                        <Upload className="h-5 w-5 mr-2 text-gray-500 group-hover:text-indigo-500" />
                        Choose Image
                        <input
                          type="file"
                          className="hidden"
                          onChange={handleFileUpload}
                          accept="image/*"
                        />
                      </label>
                      {file && (
                        <span className="text-sm text-gray-500">
                          {file.name}
                        </span>
                      )}
                    </div>
                    {previewUrl && (
                      <div className="mt-4 relative">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="max-h-48 rounded-lg"
                        />
                        <button
                          onClick={() => {
                            setPreviewUrl(null);
                            setFile(null);
                          }}
                          className="absolute top-2 right-2 bg-white/90 p-1 rounded-full hover:bg-white transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Link Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Or Share a Link
                    </label>
                    <input
                      type="url"
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                    />
                  </div>

                  <div className="flex justify-end space-x-4 mt-6">
                    <button
                      onClick={() => {
                        setShowCreatePost(false);
                        setPreviewUrl(null);
                        setFile(null);
                      }}
                      className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePost}
                      disabled={isUploading || (!file && !link && !content)}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                    >
                      {isUploading ? (
                        <div className="flex items-center">
                          <Loader className="w-5 h-5 mr-2 animate-spin" />
                          {uploadProgress > 0 ? `${uploadProgress}%` : 'Processing...'}
                        </div>
                      ) : (
                        'Post'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Posts List */}
          <div className="space-y-8">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center mb-6">
                    <div className="relative">
                      <img
                        src={getAvatarUrl(post.profiles)}
                        alt="Avatar"
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-50"
                      />
                      {post.profiles.is_verified && (
                        <div className="absolute -bottom-2 -right-1 bg-blue-500 text-white rounded-full p-0.5 flex items-center">
                          <Check className="w-3 h-3" />
                          <span className="text-xs ml-0.5 mr-1">Verified</span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-lg text-gray-900">
                        {post.profiles.username}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(post.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  {post.content && post.type !== 'link' && (
                    <p className="text-gray-800 mb-6 leading-relaxed">
                      {post.content}
                    </p>
                  )}

                  {post.type === 'file' && (
                    <div className="mb-4">
                      {getFilePreview(post)}
                    </div>
                  )}

                  {post.type === 'link' && (
                    <a
                      href={post.content}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-50 text-indigo-600 hover:bg-indigo-50 transition-colors group"
                    >
                      <LinkIcon className="w-5 h-5 mr-2 transition-transform group-hover:scale-110" />
                      <span className="truncate max-w-md">{post.content}</span>
                    </a>
                  )}

                  {/* Reactions and Comments Section */}
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-6">
                      <button
                        onClick={() => handleReaction(post.id, 'like')}
                        className={`flex items-center space-x-2 ${
                          getUserReaction(post) === 'like'
                            ? 'text-green-600'
                            : 'text-gray-500 hover:text-green-600'
                        } transition-colors`}
                      >
                        <ThumbsUp className="w-5 h-5" />
                        <span>{getReactionCount(post, 'like')}</span>
                      </button>

                      <button
                        onClick={() => handleReaction(post.id, 'dislike')}
                        className={`flex items-center space-x-2 ${
                          getUserReaction(post) === 'dislike'
                            ? 'text-red-600'
                            : 'text-gray-500 hover:text-red-600'
                        } transition-colors`}
                      >
                        <ThumbsDown className="w-5 h-5" />
                        <span>{getReactionCount(post, 'dislike')}</span>
                      </button>

                      <button
                        onClick={() => setShowComments({ ...showComments, [post.id]: !showComments[post.id] })}
                        className="flex items-center space-x-2 text-gray-500 hover:text-indigo-600 transition-colors"
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span>{post.comments?.length || 0}</span>
                      </button>
                    </div>

                    {/* Comments Section */}
                    {showComments[post.id] && (
                      <div className="mt-4 space-y-4">
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={newComment[post.id] || ''}
                            onChange={(e) => setNewComment({ ...newComment, [post.id]: e.target.value })}
                            placeholder="Write a comment..."
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                          <button
                            onClick={() => handleComment(post.id)}
                            disabled={!newComment[post.id]?.trim()}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                          >
                            Post
                          </button>
                        </div>

                        <div className="space-y-4 mt-4">
                          {post.comments?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map((comment) => (
                            <div key={comment.id} className="flex space-x-3">
                              <img
                                src={getAvatarUrl(comment.profiles)}
                                alt="Commenter"
                                className="w-8 h-8 rounded-full"
                              />
                              <div className="flex-1 bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-medium">{comment.profiles.username}</span>
                                    {comment.profiles.is_verified && (
                                      <div className="bg-blue-500 text-white rounded-full p-0.5 flex items-center">
                                        <Check className="w-3 h-3" />
                                        <span className="text-xs mx-1">Verified</span>
                                      </div>
                                    )}
                                  </div>
                                  {session?.user?.id === comment.user_id && (
                                    <button
                                      onClick={() => handleDeleteComment(comment.id)}
                                      className="text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                                <p className="text-gray-700 mt-1">{comment.content}</p>
                                <span className="text-xs text-gray-500 mt-1">
                                  {new Date(comment.created_at).toLocaleDateString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Community;