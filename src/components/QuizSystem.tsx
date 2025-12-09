import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Brain, CheckCircle, XCircle, Clock, Trophy, ArrowRight } from 'lucide-react';

interface Quiz {
  id: string;
  title: string;
  description: string;
  passing_score: number;
  time_limit_minutes: number | null;
  max_attempts: number | null;
}

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  options: string[];
  correct_answer: string | string[];
  explanation: string;
  points: number;
  order_index: number;
}

interface QuizAttempt {
  score: number;
  total_points: number;
  percentage: number;
  passed: boolean;
}

export default function QuizSystem() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [showResults, setShowResults] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [results, setResults] = useState<QuizAttempt | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  useEffect(() => {
    if (selectedQuiz && quizStarted) {
      fetchQuestions(selectedQuiz.id);
      if (selectedQuiz.time_limit_minutes) {
        setTimeRemaining(selectedQuiz.time_limit_minutes * 60);
      }
    }
  }, [selectedQuiz, quizStarted]);

  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0 && quizStarted && !showResults) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0) {
      handleSubmitQuiz();
    }
  }, [timeRemaining, quizStarted, showResults]);

  const fetchQuizzes = async () => {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('is_published', true);

      if (error) throw error;
      setQuizzes(data || []);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async (quizId: string) => {
    try {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quizId)
        .order('order_index');

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const handleAnswer = (questionId: string, answer: any) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleSubmitQuiz = async () => {
    let score = 0;
    let totalPoints = 0;

    questions.forEach((question) => {
      totalPoints += question.points;
      const userAnswer = answers[question.id];
      const correctAnswer = question.correct_answer;

      if (JSON.stringify(userAnswer) === JSON.stringify(correctAnswer)) {
        score += question.points;
      }
    });

    const percentage = Math.round((score / totalPoints) * 100);
    const passed = percentage >= (selectedQuiz?.passing_score || 70);

    const attempt = {
      score,
      total_points: totalPoints,
      percentage,
      passed
    };

    setResults(attempt);
    setShowResults(true);

    try {
      await supabase.from('user_quiz_attempts').insert({
        user_id: user?.id,
        quiz_id: selectedQuiz?.id,
        score,
        total_points: totalPoints,
        percentage,
        passed,
        answers: answers,
        time_taken_seconds: selectedQuiz?.time_limit_minutes ? (selectedQuiz.time_limit_minutes * 60) - (timeRemaining || 0) : null
      });
    } catch (error) {
      console.error('Error saving quiz attempt:', error);
    }
  };

  const resetQuiz = () => {
    setSelectedQuiz(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowResults(false);
    setQuizStarted(false);
    setTimeRemaining(null);
    setResults(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (showResults && results) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <div className={`bg-gradient-to-br ${results.passed ? 'from-green-500/20 to-green-600/20 border-green-500' : 'from-red-500/20 to-red-600/20 border-red-500'} border-2 rounded-2xl p-8 text-center mb-6`}>
            {results.passed ? (
              <Trophy className="w-16 h-16 text-green-400 mx-auto mb-4" />
            ) : (
              <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            )}
            <h2 className="text-3xl font-bold text-white mb-2">
              {results.passed ? 'Congratulations!' : 'Keep Practicing!'}
            </h2>
            <p className="text-xl text-slate-300 mb-6">
              You scored {results.score} out of {results.total_points} ({results.percentage}%)
            </p>
            <p className="text-slate-400">
              Passing score: {selectedQuiz?.passing_score}%
            </p>
          </div>

          <div className="space-y-4 mb-6">
            {questions.map((question, index) => {
              const userAnswer = answers[question.id];
              const isCorrect = JSON.stringify(userAnswer) === JSON.stringify(question.correct_answer);

              return (
                <div key={question.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                  <div className="flex items-start gap-3 mb-3">
                    {isCorrect ? (
                      <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-2">
                        Question {index + 1}: {question.question_text}
                      </h3>
                      <p className="text-sm text-slate-400 mb-2">
                        Your answer: {Array.isArray(userAnswer) ? userAnswer.join(', ') : userAnswer || 'No answer'}
                      </p>
                      {!isCorrect && (
                        <p className="text-sm text-green-400 mb-2">
                          Correct answer: {Array.isArray(question.correct_answer) ? question.correct_answer.join(', ') : question.correct_answer}
                        </p>
                      )}
                      {question.explanation && (
                        <p className="text-sm text-slate-300 mt-3 p-3 bg-slate-900 rounded-lg">
                          {question.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={resetQuiz}
            className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition"
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  if (quizStarted && selectedQuiz) {
    const currentQuestion = questions[currentQuestionIndex];

    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              {timeRemaining !== null && (
                <div className={`flex items-center gap-2 ${timeRemaining < 60 ? 'text-red-400' : 'text-slate-400'}`}>
                  <Clock className="w-5 h-5" />
                  {formatTime(timeRemaining)}
                </div>
              )}
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2 mb-6">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              />
            </div>

            {currentQuestion && (
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">{currentQuestion.question_text}</h3>

                {currentQuestion.question_type === 'multiple_choice' && (
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswer(currentQuestion.id, option)}
                        className={`w-full p-4 rounded-xl border-2 text-left transition ${
                          answers[currentQuestion.id] === option
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                        }`}
                      >
                        <span className="text-white font-medium">{option}</span>
                      </button>
                    ))}
                  </div>
                )}

                {currentQuestion.question_type === 'true_false' && (
                  <div className="grid grid-cols-2 gap-4">
                    {['True', 'False'].map((option) => (
                      <button
                        key={option}
                        onClick={() => handleAnswer(currentQuestion.id, option)}
                        className={`p-6 rounded-xl border-2 font-bold text-lg transition ${
                          answers[currentQuestion.id] === option
                            ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                            : 'border-slate-700 bg-slate-800/50 text-white hover:border-slate-600'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            {currentQuestionIndex > 0 && (
              <button
                onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition"
              >
                Previous
              </button>
            )}
            {currentQuestionIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition flex items-center justify-center gap-2"
              >
                Next
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmitQuiz}
                className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition"
              >
                Submit Quiz
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
          <Brain className="w-8 h-8 text-blue-400" />
          Knowledge Quizzes
        </h2>
        <p className="text-slate-400 mt-1">Test your trading knowledge and track your progress</p>
      </div>

      {selectedQuiz ? (
        <div className="max-w-2xl mx-auto">
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-4">{selectedQuiz.title}</h3>
            <p className="text-slate-300 mb-6">{selectedQuiz.description}</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-slate-900 rounded-xl">
                <p className="text-slate-400 text-sm mb-1">Passing Score</p>
                <p className="text-2xl font-bold text-white">{selectedQuiz.passing_score}%</p>
              </div>
              {selectedQuiz.time_limit_minutes && (
                <div className="p-4 bg-slate-900 rounded-xl">
                  <p className="text-slate-400 text-sm mb-1">Time Limit</p>
                  <p className="text-2xl font-bold text-white">{selectedQuiz.time_limit_minutes} min</p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setQuizStarted(true)}
                className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition"
              >
                Start Quiz
              </button>
              <button
                onClick={() => setSelectedQuiz(null)}
                className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.length === 0 ? (
            <div className="col-span-full bg-slate-800/50 border border-slate-700 rounded-2xl p-12 text-center">
              <Brain className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-400 mb-2">No Quizzes Available</h3>
              <p className="text-slate-500">Check back soon for new quizzes</p>
            </div>
          ) : (
            quizzes.map((quiz) => (
              <button
                key={quiz.id}
                onClick={() => setSelectedQuiz(quiz)}
                className="p-6 bg-slate-800/50 border border-slate-700 hover:border-blue-500 rounded-2xl text-left transition group"
              >
                <Brain className="w-10 h-10 text-blue-400 mb-4 group-hover:scale-110 transition" />
                <h3 className="text-xl font-bold text-white mb-2">{quiz.title}</h3>
                <p className="text-slate-400 text-sm mb-4 line-clamp-2">{quiz.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Passing: {quiz.passing_score}%</span>
                  {quiz.time_limit_minutes && (
                    <span className="text-slate-500 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {quiz.time_limit_minutes} min
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
