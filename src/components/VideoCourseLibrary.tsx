import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Play, CheckCircle, Clock, BookOpen, Lock } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  difficulty_level: string;
  duration_minutes: number;
  order_index: number;
}

interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description: string;
  video_url: string;
  duration_minutes: number;
  order_index: number;
}

interface Progress {
  lesson_id: string;
  completed: boolean;
  watch_time_seconds: number;
}

export default function VideoCourseLibrary() {
  const { user, profile } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
    if (user) {
      fetchProgress();
    }
  }, [user]);

  useEffect(() => {
    if (selectedCourse) {
      fetchLessons(selectedCourse.id);
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('video_courses')
        .select('*')
        .eq('is_published', true)
        .order('order_index');

      if (error) throw error;
      setCourses(data || []);
      if (data && data.length > 0) {
        setSelectedCourse(data[0]);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLessons = async (courseId: string) => {
    try {
      const { data, error } = await supabase
        .from('video_lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index');

      if (error) throw error;
      setLessons(data || []);
    } catch (error) {
      console.error('Error fetching lessons:', error);
    }
  };

  const fetchProgress = async () => {
    try {
      const { data, error } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;
      setProgress(data || []);
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const markLessonComplete = async (lessonId: string) => {
    try {
      const { error } = await supabase
        .from('user_lesson_progress')
        .upsert({
          user_id: user?.id,
          lesson_id: lessonId,
          completed: true,
          completed_at: new Date().toISOString()
        });

      if (error) throw error;
      fetchProgress();
    } catch (error) {
      console.error('Error marking lesson complete:', error);
    }
  };

  const isLessonCompleted = (lessonId: string) => {
    return progress.some(p => p.lesson_id === lessonId && p.completed);
  };

  const getCourseProgress = (courseId: string) => {
    const courseLessons = lessons.filter(l => l.course_id === courseId);
    if (courseLessons.length === 0) return 0;
    const completed = courseLessons.filter(l => isLessonCompleted(l.id)).length;
    return Math.round((completed / courseLessons.length) * 100);
  };

  const isCourseLocked = (course: Course) => {
    return !profile?.subscription_tier || profile.subscription_tier === 'free';
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
          <BookOpen className="w-8 h-8 text-blue-400" />
          Video Course Library
        </h2>
        <p className="text-slate-400 mt-1">Master trading with expert-led video courses</p>
      </div>

      {courses.length === 0 ? (
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-12 text-center">
          <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-400 mb-2">No Courses Available</h3>
          <p className="text-slate-500">Check back soon for new content</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-4 gap-6">
          <div className="space-y-3">
            {courses.map((course) => {
              const locked = isCourseLocked(course);
              const courseProgress = getCourseProgress(course.id);

              return (
                <button
                  key={course.id}
                  onClick={() => !locked && setSelectedCourse(course)}
                  disabled={locked}
                  className={`w-full p-4 rounded-xl border-2 text-left transition ${
                    selectedCourse?.id === course.id
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                  } ${locked ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-white text-sm">{course.title}</h3>
                    {locked && <Lock className="w-4 h-4 text-slate-400" />}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                    <Clock className="w-3 h-3" />
                    {course.duration_minutes} min
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    course.difficulty_level === 'beginner' ? 'bg-green-500/20 text-green-400' :
                    course.difficulty_level === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {course.difficulty_level}
                  </span>
                  {!locked && courseProgress > 0 && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Progress</span>
                        <span>{courseProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-1.5">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${courseProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-3">
            {selectedCourse ? (
              <div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{selectedCourse.title}</h3>
                  <p className="text-slate-400 mb-4">{selectedCourse.description}</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock className="w-4 h-4" />
                      {selectedCourse.duration_minutes} minutes
                    </div>
                    <span className={`text-xs px-3 py-1 rounded ${
                      selectedCourse.difficulty_level === 'beginner' ? 'bg-green-500/20 text-green-400' :
                      selectedCourse.difficulty_level === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {selectedCourse.difficulty_level}
                    </span>
                  </div>
                </div>

                {selectedLesson ? (
                  <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
                    <button
                      onClick={() => setSelectedLesson(null)}
                      className="text-blue-400 hover:text-blue-300 mb-4"
                    >
                      ← Back to lessons
                    </button>
                    <h4 className="text-xl font-bold text-white mb-4">{selectedLesson.title}</h4>
                    <div className="bg-slate-900 rounded-xl aspect-video mb-4 flex items-center justify-center">
                      <Play className="w-16 h-16 text-slate-600" />
                    </div>
                    <p className="text-slate-400 mb-4">{selectedLesson.description}</p>
                    <button
                      onClick={() => markLessonComplete(selectedLesson.id)}
                      disabled={isLessonCompleted(selectedLesson.id)}
                      className={`px-6 py-3 rounded-xl font-semibold transition ${
                        isLessonCompleted(selectedLesson.id)
                          ? 'bg-green-500/20 text-green-400 cursor-not-allowed'
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                    >
                      {isLessonCompleted(selectedLesson.id) ? (
                        <span className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5" />
                          Completed
                        </span>
                      ) : (
                        'Mark as Complete'
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {lessons.map((lesson, index) => {
                      const completed = isLessonCompleted(lesson.id);
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => setSelectedLesson(lesson)}
                          className="w-full p-4 bg-slate-800/50 border border-slate-700 hover:border-slate-600 rounded-xl flex items-center gap-4 transition text-left"
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                            completed ? 'bg-green-500/20' : 'bg-slate-700'
                          }`}>
                            {completed ? (
                              <CheckCircle className="w-5 h-5 text-green-400" />
                            ) : (
                              <Play className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h5 className="font-semibold text-white mb-1">
                              {index + 1}. {lesson.title}
                            </h5>
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                              <Clock className="w-3 h-3" />
                              {lesson.duration_minutes} min
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-12 text-center">
                <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">Select a course to view lessons</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
