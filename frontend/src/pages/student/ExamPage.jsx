import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useExamAttempt from '../../hooks/useExamAttempt';
import useFetch from '../../hooks/useFetch';
import QuestionCard from '../../components/QuestionCard';
import QuestionNavigation from '../../components/QuestionNavigation';
import Timer from '../../components/Timer';
import Modal from '../../components/Modal';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import {
  ShieldAlert,
  Send,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

const ExamPage = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const { request } = useFetch();

  const {
    answers,
    submitted,
    loading: attemptLoading,
    error: attemptError,
    submitAnswer,
    submitExam,
  } = useExamAttempt(attemptId);

  const [examData, setExamData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialSeconds, setInitialSeconds] = useState(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState({});
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saving' | 'saved' | 'error'

  const autoSubmittedRef = useRef(false);

  useEffect(() => {
    const fetchAttemptData = async () => {
      try {
        setLoading(true);
        const res = await request(`/student/attempts/${attemptId}`);
        const data = res?.data || res;
        if (!data || !data.exam) {
          throw new Error('Exam attempt information is not accessible.');
        }

        const exam = data.exam;
        const attempt = data.attempt;

        // If attempt was already submitted, redirect to results
        if (attempt?.status === 'SUBMITTED') {
          navigate('/student/results');
          return;
        }

        setExamData(exam);
        const qList = exam.questions || [];
        setQuestions(qList);

        // Prepopulate stored answers
        if (data.answers && Array.isArray(data.answers)) {
          const map = {};
          data.answers.forEach((a) => {
            map[a.question_id] = a.option_id;
          });
          setSelectedAnswers(map);
        }

        // Calculate timer
        const durationMins = exam.duration || 60;
        const startedAt = attempt?.started_at ? new Date(attempt.started_at) : new Date();
        const elapsedSecs = Math.max(0, Math.floor((Date.now() - startedAt.getTime()) / 1000));
        const totalSecs = durationMins * 60;
        const remaining = Math.max(10, totalSecs - elapsedSecs);
        setInitialSeconds(remaining);
      } catch (err) {
        setError(err.message || 'Failed to load test attempt.');
      } finally {
        setLoading(false);
      }
    };

    if (attemptId) {
      fetchAttemptData();
    }
  }, [attemptId, request, navigate]);

  const handleSelectOption = async (optionId) => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;
    const qId = currentQ.question_id || currentQ.id;

    // Optimistically record selected option
    setSelectedAnswers((prev) => ({
      ...prev,
      [qId]: optionId,
    }));

    setSaveStatus('saving');
    try {
      await submitAnswer(qId, optionId);
      setSaveStatus('saved');
    } catch (err) {
      console.warn('Auto-save encountered an error:', err);
      setSaveStatus('error');
    }
  };

  const handleToggleFlag = () => {
    setFlaggedQuestions((prev) => ({
      ...prev,
      [currentIndex]: !prev[currentIndex],
    }));
  };

  const handleFinalSubmit = useCallback(async () => {
    if (autoSubmittedRef.current || isSubmitting) return;
    autoSubmittedRef.current = true;
    try {
      setIsSubmitting(true);
      const res = await submitExam();
      setIsSubmitModalOpen(false);
      navigate('/student/results');
    } catch (err) {
      setError(err.message || 'Submission failed. Please check your connection and try again.');
      autoSubmittedRef.current = false;
      setIsSubmitting(false);
    }
  }, [submitExam, navigate, isSubmitting]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--background-color)' }}>
        <Loading text="Initializing secure test environment..." />
      </div>
    );
  }

  if (error || attemptError) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--background-color)', padding: '1.5rem' }}>
        <div className="card" style={{ maxWidth: '500px', width: '100%', textAlign: 'center' }}>
          <ShieldAlert size={48} style={{ color: 'var(--status-error)', margin: '0 auto 1rem' }} />
          <h3>Exam Session Alert</h3>
          <p style={{ marginTop: '0.5rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
            {error || attemptError}
          </p>
          <button className="btn btn-primary w-full" onClick={() => navigate('/student/exams')}>
            Return to Available Exams
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--background-color)', padding: '1.5rem' }}>
        <div className="card" style={{ maxWidth: '500px', width: '100%', textAlign: 'center' }}>
          <h3>No Questions Assigned</h3>
          <p style={{ marginTop: '0.5rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
            There are no questions attached to this exam module. Please contact the administrator.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/student/exams')}>
            Back to Available Exams
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const currentQId = currentQuestion?.question_id || currentQuestion?.id;
  const currentSelectedOption = selectedAnswers[currentQId] || answers[currentQId];

  // Map answered status
  const answeredStatusArray = questions.map((q) => {
    const id = q.question_id || q.id;
    return !!(selectedAnswers[id] || answers[id]);
  });

  const totalAnswered = answeredStatusArray.filter(Boolean).length;
  const totalFlagged = Object.values(flaggedQuestions).filter(Boolean).length;
  const isCurrentFlagged = !!flaggedQuestions[currentIndex];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--background-color)', display: 'flex', flexDirection: 'column' }}>
      {/* Sticky Exam Navigation Bar */}
      <header className="exam-taking-header">
        <div>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {examData?.exam_name || examData?.title || 'Competitive Exam'}
          </h2>
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <span>Question {currentIndex + 1} of {questions.length}</span>
            <span aria-hidden="true">·</span>
            <span>Answered: {totalAnswered}/{questions.length}</span>
            {saveStatus === 'saving' && (
              <>
                <span aria-hidden="true">·</span>
                <span style={{ color: 'var(--primary-color)' }}>Saving answer...</span>
              </>
            )}
            {saveStatus === 'saved' && totalAnswered > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1" style={{ color: 'var(--status-success)' }}>
                  <CheckCircle2 size={12} /> Saved
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {initialSeconds !== null && (
            <Timer initialSeconds={initialSeconds} onTimeUp={handleFinalSubmit} />
          )}

          <button
            type="button"
            className="btn btn-danger"
            onClick={() => setIsSubmitModalOpen(true)}
            disabled={isSubmitting}
          >
            <Send size={15} />
            <span>Finish & Submit</span>
          </button>
        </div>
      </header>

      {/* Main Examination Viewport */}
      <main className="exam-taking-content">
        {/* Left Column: Current Question */}
        <div>
          <QuestionCard
            question={currentQuestion}
            index={currentIndex + 1}
            total={questions.length}
            selectedOption={currentSelectedOption}
            onSelect={handleSelectOption}
            isFlagged={isCurrentFlagged}
            onToggleFlag={handleToggleFlag}
          />

          {/* Navigation Controls */}
          <div className="flex justify-between items-center mt-6">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
            >
              <ChevronLeft size={16} />
              <span>Previous Question</span>
            </button>

            <span className="text-sm font-semibold tabular-nums" style={{ color: 'var(--text-secondary)' }}>
              {currentIndex + 1} / {questions.length}
            </span>

            {currentIndex < questions.length - 1 ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
              >
                <span>Next Question</span>
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsSubmitModalOpen(true)}
              >
                <span>Review & Submit</span>
                <Send size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Question Palette Sidebar */}
        <aside>
          <QuestionNavigation
            total={questions.length}
            current={currentIndex + 1}
            answeredMap={answeredStatusArray}
            flaggedMap={flaggedQuestions}
            onNavigate={(qNumber) => setCurrentIndex(qNumber - 1)}
          />
        </aside>
      </main>

      {/* Submission Confirmation Modal */}
      <Modal
        isOpen={isSubmitModalOpen}
        title="Confirm Examination Submission"
        onClose={() => setIsSubmitModalOpen(false)}
      >
        <div>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
            Are you sure you want to finish your examination? Once submitted, your answers will be graded immediately and you will not be able to change them.
          </p>

          <div
            style={{
              backgroundColor: 'var(--surface-muted)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)',
              padding: '1.25rem',
              marginBottom: '1.5rem',
            }}
          >
            <div className="flex justify-between items-center mb-2 text-sm">
              <span style={{ color: 'var(--text-secondary)' }}>Total Questions:</span>
              <strong className="tabular-nums">{questions.length}</strong>
            </div>

            <div className="flex justify-between items-center mb-2 text-sm">
              <span style={{ color: 'var(--text-secondary)' }}>Answered:</span>
              <strong className="tabular-nums" style={{ color: 'var(--status-success)' }}>
                {totalAnswered}
              </strong>
            </div>

            <div className="flex justify-between items-center mb-2 text-sm">
              <span style={{ color: 'var(--text-secondary)' }}>Flagged for Review:</span>
              <strong className="tabular-nums" style={{ color: 'var(--status-warning)' }}>
                {totalFlagged}
              </strong>
            </div>

            <div className="flex justify-between items-center text-sm pt-2" style={{ borderTop: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Unanswered:</span>
              <strong className="tabular-nums" style={{ color: questions.length - totalAnswered > 0 ? 'var(--status-error)' : 'var(--text-primary)' }}>
                {questions.length - totalAnswered}
              </strong>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsSubmitModalOpen(false)}
              disabled={isSubmitting}
            >
              Continue Test
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span>Grading & Submitting...</span>
              ) : (
                <>
                  <Send size={15} />
                  <span>Yes, Finalize & Submit</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ExamPage;
