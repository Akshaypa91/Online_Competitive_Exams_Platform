import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  HelpCircle, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Check, 
  FileQuestion,
  GraduationCap
} from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { questionApi } from '../../services/questionApi';
import { useToast } from '../../context/ToastContext';
import AppLayout from '../../components/AppLayout';
import Modal from '../../components/Modal';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import StatCard from '../../components/StatCard';

const ManageQuestions = () => {
  const location = useLocation();
  const initialExamId = location.state?.examId ? String(location.state.examId) : '';

  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState(initialExamId);
  const [questions, setQuestions] = useState([]);

  const [loadingExams, setLoadingExams] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [error, setError] = useState(null);

  // Modal create/edit state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialFormState = {
    question_id: null,
    question_text: '',
    marks: 1,
    question_type: 'MCQ',
    options: [
      { option_text: '', is_correct: true },
      { option_text: '', is_correct: false },
      { option_text: '', is_correct: false },
      { option_text: '', is_correct: false },
    ],
  };

  const [formData, setFormData] = useState(initialFormState);

  // Delete modal state
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    if (selectedExamId) {
      fetchQuestions(selectedExamId);
    } else {
      setQuestions([]);
    }
  }, [selectedExamId]);

  const fetchExams = async () => {
    try {
      setLoadingExams(true);
      const res = await adminApi.getExams();
      const list = Array.isArray(res) ? res : (res?.data || []);
      setExams(list);
      // If no initial exam was passed in state, pick the first exam by default if available
      if (!initialExamId && list.length > 0) {
        setSelectedExamId(String(list[0].exam_id || list[0].id));
      }
    } catch (err) {
      setError('Failed to fetch examinations.');
    } finally {
      setLoadingExams(false);
    }
  };

  const fetchQuestions = async (examId) => {
    try {
      setLoadingQuestions(true);
      setError(null);
      const res = await questionApi.getExamQuestions(examId);
      const list = Array.isArray(res) ? res : (res?.data || []);
      setQuestions(list);
    } catch (err) {
      setError('Failed to fetch questions for this examination.');
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleOpenModal = (q = null) => {
    if (q) {
      const opts = (q.options || []).map((opt) => ({
        option_id: opt.option_id || opt.id,
        option_text: opt.option_text || opt.text || '',
        is_correct: Boolean(opt.is_correct),
      }));

      // Guarantee at least 2 options
      while (opts.length < 2) {
        opts.push({ option_text: '', is_correct: false });
      }

      setFormData({
        question_id: q.question_id || q.id,
        question_text: q.question_text || q.text || '',
        marks: Number(q.marks || 1),
        question_type: q.question_type || 'MCQ',
        options: opts,
      });
    } else {
      setFormData(initialFormState);
    }
    setError(null);
    setIsModalOpen(true);
  };

  const handleAddOption = () => {
    setFormData((prev) => ({
      ...prev,
      options: [...prev.options, { option_text: '', is_correct: false }],
    }));
  };

  const handleRemoveOption = (index) => {
    if (formData.options.length <= 2) {
      showToast('warning', 'A multiple-choice question must have at least 2 options.');
      return;
    }
    const wasCorrect = formData.options[index].is_correct;
    const next = formData.options.filter((_, i) => i !== index);
    if (wasCorrect && next.length > 0) {
      next[0].is_correct = true;
    }
    setFormData((prev) => ({ ...prev, options: next }));
  };

  const handleOptionTextChange = (index, text) => {
    const next = [...formData.options];
    next[index] = { ...next[index], option_text: text };
    setFormData((prev) => ({ ...prev, options: next }));
  };

  const handleSetCorrectOption = (index) => {
    const next = formData.options.map((opt, i) => ({
      ...opt,
      is_correct: i === index,
    }));
    setFormData((prev) => ({ ...prev, options: next }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.question_text.trim()) {
      setError('Question text is required.');
      return;
    }

    const hasEmpty = formData.options.some((o) => !o.option_text.trim());
    if (hasEmpty) {
      setError('All answer options must contain text.');
      return;
    }

    const hasCorrect = formData.options.some((o) => o.is_correct);
    if (!hasCorrect) {
      setError('Please select which option is the correct answer.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload = {
      exam_id: Number(selectedExamId),
      question_text: formData.question_text.trim(),
      question_type: 'MCQ',
      marks: Number(formData.marks || 1),
      options: formData.options.map((o) => ({
        option_text: o.option_text.trim(),
        is_correct: o.is_correct ? 1 : 0,
      })),
    };

    try {
      if (formData.question_id) {
        await questionApi.updateQuestion(selectedExamId, formData.question_id, payload);
        showToast('success', 'Question updated successfully.');
      } else {
        await questionApi.createQuestion(selectedExamId, payload);
        showToast('success', 'New question added to exam bank.');
      }
      setIsModalOpen(false);
      fetchQuestions(selectedExamId);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save question.';
      setError(msg);
      showToast('error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!questionToDelete) return;
    setIsDeleting(true);
    try {
      const qId = questionToDelete.question_id || questionToDelete.id;
      await questionApi.deleteQuestion(selectedExamId, qId);
      showToast('success', 'Question removed from exam bank.');
      setQuestionToDelete(null);
      fetchQuestions(selectedExamId);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete question.';
      setError(msg);
      showToast('error', msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const selectedExam = exams.find((e) => String(e.exam_id || e.id) === String(selectedExamId));
  const totalQuestionsMarks = questions.reduce((sum, q) => sum + Number(q.marks || 1), 0);

  return (
    <AppLayout
      isAdmin={true}
      title="Question Bank"
      breadcrumbs={[{ label: 'Admin Console' }, { label: 'Questions' }]}
    >
      <div className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>Examination Question Repository</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.9375rem' }}>
            Author multiple choice questions, set answer keys, and manage scoring marks per question.
          </p>
        </div>
        {selectedExamId && (
          <button
            className="btn btn-primary"
            onClick={() => handleOpenModal()}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Plus size={16} />
            <span>Add Question</span>
          </button>
        )}
      </div>

      <ErrorMessage message={error} />

      {/* Exam Selector and Summary Bar */}
      <div className="card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div style={{ flex: '1', minWidth: '260px', maxWidth: '480px' }}>
            <label className="form-label" style={{ marginBottom: '0.375rem' }}>
              Select Active Examination
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <GraduationCap size={20} style={{ color: 'var(--primary-color)', flexShrink: 0 }} />
              <select
                className="form-control"
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
              >
                <option value="">-- Choose an Examination --</option>
                {exams.map((exam) => (
                  <option key={exam.exam_id || exam.id} value={exam.exam_id || exam.id}>
                    {exam.exam_name || exam.title} ({exam.duration} mins - {exam.total_marks} marks)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedExam && (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Questions Added
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }} className="tabular-nums">
                  {questions.length}
                </div>
              </div>
              <div style={{ width: '1px', height: '32px', backgroundColor: 'var(--border-color)' }} />
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Configured Marks
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-color)' }} className="tabular-nums">
                  {totalQuestionsMarks} / {selectedExam.total_marks}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Questions List */}
      {!selectedExamId ? (
        <EmptyState
          icon={GraduationCap}
          title="Select an Examination"
          description="Choose an examination from the dropdown above to view and author its question repository."
        />
      ) : loadingQuestions ? (
        <Loading text="Loading examination questions..." />
      ) : questions.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {questions.map((q, qIndex) => {
            const qId = q.question_id || q.id;
            return (
              <div key={qId} className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
                    <span
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: 700,
                        color: 'var(--primary-color)',
                        backgroundColor: 'var(--primary-light)',
                        padding: '0.2rem 0.6rem',
                        borderRadius: 'var(--border-radius-md)',
                      }}
                    >
                      Q{qIndex + 1}
                    </span>
                    <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0, lineHeight: 1.5 }}>
                      {q.question_text || q.text}
                    </h3>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                    <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>
                      {q.marks || 1} {Number(q.marks) === 1 ? 'mark' : 'marks'}
                    </span>
                    <button
                      className="btn btn-outline"
                      style={{ padding: '0.3rem 0.5rem', fontSize: '0.8125rem' }}
                      onClick={() => handleOpenModal(q)}
                      title="Edit Question"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      className="btn btn-danger"
                      style={{ padding: '0.3rem 0.5rem', fontSize: '0.8125rem' }}
                      onClick={() => setQuestionToDelete(q)}
                      title="Delete Question"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Option choices */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '0.625rem',
                    backgroundColor: 'var(--background-color)',
                    padding: '1rem',
                    borderRadius: 'var(--border-radius-md)',
                  }}
                >
                  {(q.options || []).map((opt, optIndex) => {
                    const isCorrect = Boolean(opt.is_correct);
                    const letter = String.fromCharCode(65 + optIndex);

                    return (
                      <div
                        key={opt.option_id || optIndex}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.625rem',
                          padding: '0.625rem 0.75rem',
                          borderRadius: 'var(--border-radius-md)',
                          backgroundColor: isCorrect ? 'var(--status-success-bg)' : 'var(--surface-color)',
                          border: isCorrect
                            ? '1px solid rgba(22, 163, 74, 0.4)'
                            : '1px solid var(--border-color)',
                        }}
                      >
                        <span
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: isCorrect ? 'var(--status-success)' : 'var(--border-color)',
                            color: isCorrect ? '#FFFFFF' : 'var(--text-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            flexShrink: 0,
                          }}
                        >
                          {letter}
                        </span>
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)', flex: 1 }}>
                          {opt.option_text || opt.text}
                        </span>
                        {isCorrect && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '2px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              color: 'var(--status-success)',
                            }}
                          >
                            <CheckCircle2 size={14} />
                            <span>Correct</span>
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={FileQuestion}
          title="No Questions in this Examination"
          description="This exam does not have any questions added yet. Click below to add the first question."
          actionText="+ Add First Question"
          onAction={() => handleOpenModal()}
        />
      )}

      {/* Authoring Modal */}
      <Modal
        isOpen={isModalOpen}
        title={formData.question_id ? 'Edit Question' : 'Add New Question'}
        onClose={() => setIsModalOpen(false)}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Question Text *</label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="Type the question prompt here..."
              value={formData.question_text}
              onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
              required
            />
          </div>

          <div style={{ maxWidth: '160px', marginBottom: '1.25rem' }}>
            <label className="form-label">Marks Value *</label>
            <input
              type="number"
              min="1"
              className="form-control"
              value={formData.marks}
              onChange={(e) => setFormData({ ...formData, marks: e.target.value })}
              required
            />
          </div>

          {/* Answer Options */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div>
                <label className="form-label" style={{ margin: 0 }}>Answer Choices & Correct Answer Key</label>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Mark the radio button next to the correct answer.
                </div>
              </div>
              <button
                type="button"
                className="btn btn-outline"
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                onClick={handleAddOption}
              >
                <Plus size={13} style={{ marginRight: '4px' }} />
                <span>Add Choice</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {formData.options.map((opt, index) => {
                const letter = String.fromCharCode(65 + index);
                return (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.625rem',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--border-radius-md)',
                      backgroundColor: opt.is_correct ? 'var(--status-success-bg)' : 'var(--background-color)',
                      border: opt.is_correct
                        ? '1px solid rgba(22, 163, 74, 0.4)'
                        : '1px solid var(--border-color)',
                    }}
                  >
                    <input
                      type="radio"
                      name="correct_choice"
                      checked={opt.is_correct}
                      onChange={() => handleSetCorrectOption(index)}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--status-success)', cursor: 'pointer' }}
                      title="Mark as correct answer"
                    />

                    <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-secondary)', width: '20px' }}>
                      {letter}.
                    </span>

                    <input
                      type="text"
                      className="form-control"
                      placeholder={`Choice ${letter} text...`}
                      value={opt.option_text}
                      onChange={(e) => handleOptionTextChange(index, e.target.value)}
                      required
                      style={{ flex: 1 }}
                    />

                    {formData.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(index)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '0.25rem',
                        }}
                        title="Delete choice"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : formData.question_id ? 'Update Question' : 'Add Question'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!questionToDelete}
        title="Confirm Question Deletion"
        onClose={() => setQuestionToDelete(null)}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--status-error)' }}>
            <AlertTriangle size={24} />
            <h4 style={{ margin: 0, color: 'var(--status-error)' }}>Delete Question</h4>
          </div>

          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem', fontSize: '0.9375rem', lineHeight: 1.6 }}>
            Are you sure you want to delete this question?
            <br />
            <em>"{questionToDelete?.question_text || questionToDelete?.text}"</em>
          </p>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setQuestionToDelete(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              disabled={isDeleting}
              onClick={handleConfirmDelete}
            >
              {isDeleting ? 'Deleting...' : 'Delete Question'}
            </button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
};

export default ManageQuestions;
