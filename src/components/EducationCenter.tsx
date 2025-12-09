import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { BookOpen, Play, CheckCircle, Award, Trophy, ArrowLeft, Video, FileText, Activity, ClipboardCheck } from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  content: string;
  lesson_type: 'video' | 'text' | 'interactive' | 'quiz';
  duration_minutes: number;
  order_index: number;
}

export default function EducationCenter() {
  const { profile } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    loadCourses();
    loadProgress();
    loadCertifications();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      loadLessons(selectedCourse.id);
    }
  }, [selectedCourse]);

  const loadCourses = async () => {
    const { data } = await supabase
      .from('courses')
      .select('*')
      .eq('is_published', true)
      .order('order_index');

    if (data) setCourses(data);
  };

  const loadProgress = async () => {
    const { data } = await supabase
      .from('user_course_progress')
      .select('*')
      .eq('user_id', profile?.id);

    if (data) setProgress(data);
  };

  const loadCertifications = async () => {
    const { data } = await supabase
      .from('certifications')
      .select('*')
      .eq('user_id', profile?.id)
      .order('issued_at', { ascending: false });

    if (data) setCertifications(data);
  };

  const loadLessons = async (courseId: string) => {
    const { data } = await supabase
      .from('course_lessons')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index');

    if (data) setLessons(data);
  };

  const getCourseProgress = (courseId: string) => {
    const courseProgress = progress.filter(p => p.course_id === courseId);
    if (courseProgress.length === 0) return 0;
    return courseProgress[0].progress_percentage || 0;
  };

  const startCourse = (course: any) => {
    setSelectedCourse(course);
    setSelectedLesson(null);
  };

  const startLesson = async (lesson: Lesson) => {
    setSelectedLesson(lesson);

    const { data: existing } = await supabase
      .from('user_course_progress')
      .select('*')
      .eq('user_id', profile?.id)
      .eq('lesson_id', lesson.id)
      .maybeSingle();

    if (!existing) {
      await supabase.from('user_course_progress').insert({
        user_id: profile?.id,
        course_id: selectedCourse.id,
        lesson_id: lesson.id,
        is_completed: false,
        progress_percentage: 0
      });
    }
  };

  const completeLesson = async () => {
    if (!selectedLesson) return;

    await supabase
      .from('user_course_progress')
      .update({
        is_completed: true,
        progress_percentage: 100,
        completed_at: new Date().toISOString()
      })
      .eq('user_id', profile?.id)
      .eq('lesson_id', selectedLesson.id);

    const nextLesson = lessons.find(l => l.order_index === selectedLesson.order_index + 1);
    if (nextLesson) {
      setSelectedLesson(nextLesson);
    } else {
      setSelectedLesson(null);
      loadProgress();
    }
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'text': return <FileText className="w-4 h-4" />;
      case 'interactive': return <Activity className="w-4 h-4" />;
      case 'quiz': return <ClipboardCheck className="w-4 h-4" />;
      default: return <Play className="w-4 h-4" />;
    }
  };

  if (selectedLesson) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setSelectedLesson(null)}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Lessons
        </button>

        <div className="glass-card p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {getLessonIcon(selectedLesson.lesson_type)}
                <span className="text-xs text-slate-400 uppercase">{selectedLesson.lesson_type}</span>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">{selectedLesson.title}</h1>
              <p className="text-slate-400 text-sm">{selectedLesson.duration_minutes} minutes</p>
            </div>
          </div>

          <div className="bg-slate-900/50 rounded-lg p-6 mb-6 min-h-[300px]">
            {selectedLesson.lesson_type === 'video' && (
              <div className="aspect-video bg-slate-800 rounded-lg flex items-center justify-center mb-4">
                <Play className="w-16 h-16 text-slate-600" />
              </div>
            )}
            <p className="text-slate-300 leading-relaxed">{selectedLesson.content}</p>
          </div>

          <button
            onClick={completeLesson}
            className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            Complete Lesson
          </button>
        </div>
      </div>
    );
  }

  if (selectedCourse) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setSelectedCourse(null)}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Courses
        </button>

        <div className="glass-card p-6">
          <span className={`inline-block px-3 py-1 rounded text-xs mb-3 ${
            selectedCourse.difficulty === 'beginner'
              ? 'bg-green-500/20 text-green-400'
              : selectedCourse.difficulty === 'intermediate'
              ? 'bg-yellow-500/20 text-yellow-400'
              : 'bg-red-500/20 text-red-400'
          }`}>
            {selectedCourse.difficulty}
          </span>
          <h1 className="text-2xl font-bold text-white mb-2">{selectedCourse.title}</h1>
          <p className="text-slate-400 mb-6">{selectedCourse.description}</p>
          <div className="text-sm text-slate-500">
            {lessons.length} lessons · {selectedCourse.duration_minutes} minutes
          </div>
        </div>

        <div className="space-y-3">
          {lessons.map((lesson, index) => {
            const isCompleted = progress.some(p => p.lesson_id === lesson.id && p.is_completed);

            return (
              <div
                key={lesson.id}
                onClick={() => startLesson(lesson)}
                className="glass-card p-4 hover:bg-slate-800/50 transition cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isCompleted ? 'bg-green-500/20 text-green-400' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {isCompleted ? <CheckCircle className="w-4 h-4" /> : <span className="text-xs">{index + 1}</span>}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-1">{lesson.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        {getLessonIcon(lesson.lesson_type)}
                        {lesson.lesson_type}
                      </span>
                      <span>{lesson.duration_minutes} min</span>
                    </div>
                  </div>
                  <Play className="w-5 h-5 text-blue-400 flex-shrink-0" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
          <BookOpen className="w-7 h-7 text-purple-400" />
          Education Center
        </h1>
        <p className="text-slate-400 text-sm">Master trading through structured courses</p>
      </div>

      {certifications.length > 0 && (
        <div className="glass-card p-4">
          <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-400" />
            Your Certifications
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {certifications.map((cert) => (
              <div key={cert.id} className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <h3 className="text-white font-semibold text-sm">{cert.certification_name}</h3>
                </div>
                <p className="text-slate-400 text-xs">
                  Issued {new Date(cert.issued_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => {
          const progressPercent = getCourseProgress(course.id);
          const isCompleted = progressPercent === 100;

          return (
            <div key={course.id} className="glass-card p-4 hover:bg-slate-800/50 transition">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs mb-2 ${
                    course.difficulty === 'beginner'
                      ? 'bg-green-500/20 text-green-400'
                      : course.difficulty === 'intermediate'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {course.difficulty}
                  </span>
                  <h3 className="text-white font-semibold mb-1">{course.title}</h3>
                  <p className="text-slate-400 text-xs mb-2">{course.description}</p>
                  <p className="text-slate-500 text-xs">{course.duration_minutes} minutes</p>
                </div>
                {isCompleted && (
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                )}
              </div>

              {progressPercent > 0 && (
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Progress</span>
                    <span className="text-purple-400 font-semibold">{progressPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <button
                onClick={() => startCourse(course)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition text-sm"
              >
                <Play className="w-4 h-4" />
                {progressPercent > 0 ? 'Continue' : 'Start Course'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
