import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { createNotification } from '../lib/notifications';

export function useSocial() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);

  const followUser = async (followingId: string) => {
    if (!user) return { error: 'Not authenticated' };

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_follows')
        .insert({
          follower_id: user.id,
          following_id: followingId,
        });

      if (error) throw error;

      await createNotification(
        followingId,
        'New Follower',
        `${profile?.full_name || 'Someone'} started following you!`,
        'info',
        '/social'
      );

      return { error: null };
    } catch (error) {
      console.error('Error following user:', error);
      return { error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const unfollowUser = async (followingId: string) => {
    if (!user) return { error: 'Not authenticated' };

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', followingId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error unfollowing user:', error);
      return { error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const likeTradeIdea = async (ideaId: string, ownerId: string) => {
    if (!user) return { error: 'Not authenticated' };

    setLoading(true);
    try {
      const { error: likeError } = await supabase
        .from('trade_idea_likes')
        .insert({
          idea_id: ideaId,
          user_id: user.id,
        });

      if (likeError) throw likeError;

      const { error: updateError } = await supabase
        .from('shared_trade_ideas')
        .update({ likes_count: supabase.raw('likes_count + 1') })
        .eq('id', ideaId);

      if (updateError) throw updateError;

      if (ownerId !== user.id) {
        await createNotification(
          ownerId,
          'Trade Idea Liked',
          `${profile?.full_name || 'Someone'} liked your trade idea!`,
          'success',
          '/trade-ideas'
        );
      }

      return { error: null };
    } catch (error) {
      console.error('Error liking trade idea:', error);
      return { error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const unlikeTradeIdea = async (ideaId: string) => {
    if (!user) return { error: 'Not authenticated' };

    setLoading(true);
    try {
      const { error: unlikeError } = await supabase
        .from('trade_idea_likes')
        .delete()
        .eq('idea_id', ideaId)
        .eq('user_id', user.id);

      if (unlikeError) throw unlikeError;

      const { error: updateError } = await supabase
        .from('shared_trade_ideas')
        .update({ likes_count: supabase.raw('likes_count - 1') })
        .eq('id', ideaId);

      if (updateError) throw updateError;
      return { error: null };
    } catch (error) {
      console.error('Error unliking trade idea:', error);
      return { error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const commentOnTradeIdea = async (ideaId: string, comment: string, ownerId: string) => {
    if (!user) return { error: 'Not authenticated' };

    setLoading(true);
    try {
      const { error: commentError } = await supabase
        .from('trade_idea_comments')
        .insert({
          idea_id: ideaId,
          user_id: user.id,
          comment,
        });

      if (commentError) throw commentError;

      const { error: updateError } = await supabase
        .from('shared_trade_ideas')
        .update({ comments_count: supabase.raw('comments_count + 1') })
        .eq('id', ideaId);

      if (updateError) throw updateError;

      if (ownerId !== user.id) {
        await createNotification(
          ownerId,
          'New Comment',
          `${profile?.full_name || 'Someone'} commented on your trade idea`,
          'info',
          '/trade-ideas'
        );
      }

      return { error: null };
    } catch (error) {
      console.error('Error commenting on trade idea:', error);
      return { error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const shareTradeIdea = async (data: {
    title: string;
    description: string;
    instrument: string;
    direction: 'long' | 'short';
    entry_price: number;
    target_price?: number;
    stop_loss?: number;
  }) => {
    if (!user) return { error: 'Not authenticated' };

    setLoading(true);
    try {
      const { error } = await supabase
        .from('shared_trade_ideas')
        .insert({
          user_id: user.id,
          ...data,
        });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error sharing trade idea:', error);
      return { error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const joinChatRoom = async (roomId: string) => {
    if (!user) return { error: 'Not authenticated' };

    setLoading(true);
    try {
      const { error } = await supabase
        .from('chat_room_members')
        .insert({
          room_id: roomId,
          user_id: user.id,
        });

      if (error && error.code !== '23505') throw error;

      const { error: updateError } = await supabase
        .from('chat_rooms')
        .update({ member_count: supabase.raw('member_count + 1') })
        .eq('id', roomId);

      if (updateError) throw updateError;
      return { error: null };
    } catch (error) {
      console.error('Error joining chat room:', error);
      return { error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const leaveChatRoom = async (roomId: string) => {
    if (!user) return { error: 'Not authenticated' };

    setLoading(true);
    try {
      const { error } = await supabase
        .from('chat_room_members')
        .delete()
        .eq('room_id', roomId)
        .eq('user_id', user.id);

      if (error) throw error;

      const { error: updateError } = await supabase
        .from('chat_rooms')
        .update({ member_count: supabase.raw('member_count - 1') })
        .eq('id', roomId);

      if (updateError) throw updateError;
      return { error: null };
    } catch (error) {
      console.error('Error leaving chat room:', error);
      return { error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    followUser,
    unfollowUser,
    likeTradeIdea,
    unlikeTradeIdea,
    commentOnTradeIdea,
    shareTradeIdea,
    joinChatRoom,
    leaveChatRoom,
    loading,
  };
}
