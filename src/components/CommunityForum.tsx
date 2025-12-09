import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { MessageSquare, Plus, ThumbsUp, Pin, Lock, Eye, Clock } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface Thread {
  id: string;
  title: string;
  content: string;
  user_id: string;
  category_id: string;
  is_pinned: boolean;
  is_locked: boolean;
  view_count: number;
  reply_count: number;
  created_at: string;
  profiles?: {
    full_name: string;
  };
}

interface Post {
  id: string;
  content: string;
  user_id: string;
  thread_id: string;
  like_count: number;
  created_at: string;
  profiles?: {
    full_name: string;
  };
}

export default function CommunityForum() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [showNewThread, setShowNewThread] = useState(false);
  const [loading, setLoading] = useState(true);
  const [threadTitle, setThreadTitle] = useState('');
  const [threadContent, setThreadContent] = useState('');
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchThreads(selectedCategory.id);
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedThread) {
      fetchPosts(selectedThread.id);
      incrementViewCount(selectedThread.id);
    }
  }, [selectedThread]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('forum_categories')
        .select('*')
        .order('order_index');

      if (error) throw error;
      setCategories(data || []);
      if (data && data.length > 0) {
        setSelectedCategory(data[0]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchThreads = async (categoryId: string) => {
    try {
      const { data, error } = await supabase
        .from('forum_threads')
        .select(`
          *,
          profiles:user_id (full_name)
        `)
        .eq('category_id', categoryId)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setThreads(data || []);
    } catch (error) {
      console.error('Error fetching threads:', error);
    }
  };

  const fetchPosts = async (threadId: string) => {
    try {
      const { data, error } = await supabase
        .from('forum_posts')
        .select(`
          *,
          profiles:user_id (full_name)
        `)
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const incrementViewCount = async (threadId: string) => {
    try {
      const { error } = await supabase
        .from('forum_threads')
        .update({ view_count: (selectedThread?.view_count || 0) + 1 })
        .eq('id', threadId);

      if (error) throw error;
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  const createThread = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase
        .from('forum_threads')
        .insert({
          category_id: selectedCategory?.id,
          user_id: user?.id,
          title: threadTitle,
          content: threadContent
        });

      if (error) throw error;

      setThreadTitle('');
      setThreadContent('');
      setShowNewThread(false);
      if (selectedCategory) {
        fetchThreads(selectedCategory.id);
      }
    } catch (error) {
      console.error('Error creating thread:', error);
    }
  };

  const createPost = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase
        .from('forum_posts')
        .insert({
          thread_id: selectedThread?.id,
          user_id: user?.id,
          content: replyContent
        });

      if (error) throw error;

      await supabase
        .from('forum_threads')
        .update({
          reply_count: (selectedThread?.reply_count || 0) + 1,
          last_reply_at: new Date().toISOString()
        })
        .eq('id', selectedThread?.id);

      setReplyContent('');
      if (selectedThread) {
        fetchPosts(selectedThread.id);
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-blue-400" />
          Community Forum
        </h2>
        <p className="text-slate-400 mt-1">Connect with fellow traders and share insights</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="space-y-3">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                setSelectedCategory(category);
                setSelectedThread(null);
              }}
              className={`w-full p-4 rounded-xl border-2 text-left transition ${
                selectedCategory?.id === category.id
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
              }`}
            >
              <h3 className="font-bold text-white mb-1">{category.name}</h3>
              <p className="text-sm text-slate-400">{category.description}</p>
            </button>
          ))}
        </div>

        <div className="lg:col-span-3">
          {selectedThread ? (
            <div>
              <button
                onClick={() => setSelectedThread(null)}
                className="text-blue-400 hover:text-blue-300 mb-4"
              >
                ← Back to threads
              </button>

              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 mb-6">
                <div className="flex items-start gap-4 mb-4">
                  {selectedThread.is_pinned && (
                    <Pin className="w-5 h-5 text-yellow-400" />
                  )}
                  {selectedThread.is_locked && (
                    <Lock className="w-5 h-5 text-red-400" />
                  )}
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{selectedThread.title}</h3>
                <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
                  <span>by {selectedThread.profiles?.full_name || 'Unknown'}</span>
                  <span>{new Date(selectedThread.created_at).toLocaleDateString()}</span>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {selectedThread.view_count}
                  </div>
                </div>
                <p className="text-slate-300">{selectedThread.content}</p>
              </div>

              <div className="space-y-4 mb-6">
                {posts.map((post) => (
                  <div key={post.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <span className="text-blue-400 font-bold">
                          {post.profiles?.full_name?.[0] || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-white">{post.profiles?.full_name || 'Unknown'}</p>
                        <p className="text-xs text-slate-400">{new Date(post.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                    <p className="text-slate-300">{post.content}</p>
                    <button className="mt-3 text-slate-400 hover:text-blue-400 flex items-center gap-2 text-sm">
                      <ThumbsUp className="w-4 h-4" />
                      {post.like_count}
                    </button>
                  </div>
                ))}
              </div>

              {!selectedThread.is_locked && (
                <form onSubmit={createPost} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write your reply..."
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white min-h-[120px] mb-3"
                    required
                  />
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition"
                  >
                    Post Reply
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">{selectedCategory?.name}</h3>
                <button
                  onClick={() => setShowNewThread(true)}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold flex items-center gap-2 transition"
                >
                  <Plus className="w-5 h-5" />
                  New Thread
                </button>
              </div>

              {showNewThread && (
                <form onSubmit={createThread} className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
                  <input
                    type="text"
                    value={threadTitle}
                    onChange={(e) => setThreadTitle(e.target.value)}
                    placeholder="Thread title..."
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white mb-3"
                    required
                  />
                  <textarea
                    value={threadContent}
                    onChange={(e) => setThreadContent(e.target.value)}
                    placeholder="Thread content..."
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white min-h-[150px] mb-3"
                    required
                  />
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition"
                    >
                      Create Thread
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNewThread(false)}
                      className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-3">
                {threads.map((thread) => (
                  <button
                    key={thread.id}
                    onClick={() => setSelectedThread(thread)}
                    className="w-full p-4 bg-slate-800/50 border border-slate-700 hover:border-slate-600 rounded-xl text-left transition"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {thread.is_pinned && <Pin className="w-4 h-4 text-yellow-400" />}
                          {thread.is_locked && <Lock className="w-4 h-4 text-red-400" />}
                          <h4 className="font-bold text-white">{thread.title}</h4>
                        </div>
                        <p className="text-sm text-slate-400 line-clamp-2">{thread.content}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>{thread.profiles?.full_name || 'Unknown'}</span>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {thread.reply_count}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {thread.view_count}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(thread.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
