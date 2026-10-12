import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { adminApi } from '../../services/adminApi';
import { questionApi } from '../../services/questionApi';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Modal from '../../components/Modal';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';

const ManageQuestions = () => {
  const location = useLocation();
  const initialExamId = location.state?.examId || '';

  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(initialExamId);
  const [questions, setQuestions] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [error, setError] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const initialFormState = {
    id: null,
    question_text: '',
    marks: 1,
    options: [
      { option_text: '', is_correct: false },
      { option_text: '', is_correct: false }
    ]
  };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const data = await adminApi.getExams();
        setExams(data || []);
      } catch (err) {
        setError('Failed to fetch exams');
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  useEffect(() => {
    if (selectedExam) {
      fetchQuestions(selectedExam);
    } else {
      setQuestions([]);
    }
  }, [selectedExam]);

  const fetchQuestions = async (examId) => {
    try {
      setLoadingQuestions(true);
      const data = await questionApi.getExamQuestions(examId);
      setQuestions(data || []);
    } catch (err) {
      setError('Failed to fetch questions');
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleOpenModal = (question = null) => {
    if (question) {
      // Create a deep copy to avoid modifying state directly
      const qCopy = JSON.parse(JSON.stringify(question));
      
      // Ensure we have at least 2 options for UI
      if (!qCopy.options || qCopy.options.length === 0) {
        qCopy.options = [
          { option_text: '', is_correct: false },
          { option_text: '', is_correct: false }
        ];
      }
      
      setFormData(qCopy);
    } else {
      setFormData(initialFormState);
    }
    setIsModalOpen(true);
  };

  const handleAddOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, { option_text: '', is_correct: false }]
    });
  };

  const handleRemoveOption = (index) => {
    if (formData.options.length <= 2) {
      alert('A question must have at least 2 options.');
      return;
    }
    const newOptions = formData.options.filter((_, i) => i !== index);
    setFormData({ ...formData, options: newOptions });
  };

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...formData.options];
    if (field === 'is_correct' && value === true) {
      // If marking as correct, unmark others (assuming single correct answer)
      newOptions.forEach(opt => opt.is_correct = false);
    }
    newOptions[index] = { ...newOptions[index], [field]: value };
    setFormData({ ...formData, options: newOptions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.question_text) {
      alert('Question text is required');
      return;
    }
    
    const hasEmptyOption = formData.options.some(opt => !opt.option_text);
    if (hasEmptyOption) {
      alert('All options must have text');
      return;
    }
    
    const hasCorrectOption = formData.options.some(opt => opt.is_correct);
    if (!hasCorrectOption) {
      alert('You must select at least one correct option');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      if (formData.id) {
        await questionApi.updateQuestion(selectedExam, formData.id, formData);
      } else {
        await questionApi.createQuestion(selectedExam, formData);
      }
      setIsModalOpen(false);
      fetchQuestions(selectedExam);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save question');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await questionApi.deleteQuestion(selectedExam, id);
        fetchQuestions(selectedExam);
      } catch (err) {
        setError('Failed to delete question');
      }
    }
  };

  return (
    <div className="app-layout">
      <Sidebar isAdmin={true} />
      <div className="main-content">
        <Navbar title="Manage Questions" />
        
        <div className="page-content">
          <div className="page-header">
            <h2>Questions</h2>
            {selectedExam && (
              <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                + Add Question
              </button>
            )}
          </div>
          
          <ErrorMessage message={error} />
          
          <div className="card mb-6">
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Select Exam</label>
              <select 
                className="form-control" 
                value={selectedExam} 
                onChange={(e) => setSelectedExam(e.target.value)}
                style={{ maxWidth: '400px' }}
              >
                <option value="">-- Select an Exam --</option>
                {exams.map(exam => (
                  <option key={exam.id} value={exam.id}>{exam.title}</option>
                ))}
              </select>
            </div>
          </div>
          
          {!selectedExam ? (
            <div className="text-center" style={{ padding: '3rem', color: 'var(--text-muted)' }}>
              Please select an exam to manage its questions
            </div>
          ) : loadingQuestions ? (
            <Loading text="Loading questions..." />
          ) : (
            <div>
              {questions.length > 0 ? (
                questions.map((q, index) => (
                  <div key={q.id || q.question_id} className="card" style={{ marginBottom: '1.5rem' }}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600 }}>
                          Question {index + 1}
                        </span>
                        <h4 style={{ marginTop: '0.5rem', marginBottom: 0 }}>{q.question_text || q.text}</h4>
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Marks: {q.marks || 1}</span>
                      </div>
                      <div className="flex gap-2">
                        <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => handleOpenModal(q)}>Edit</button>
                        <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => handleDelete(q.id || q.question_id)}>Delete</button>
                      </div>
                    </div>
                    
                    <div style={{ padding: '1rem', backgroundColor: 'var(--background-color)', borderRadius: 'var(--border-radius-md)' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem' }}>Options:</div>
                      {q.options && q.options.map((opt, i) => (
                        <div key={opt.id || i} style={{ 
                          padding: '0.5rem', 
                          marginBottom: '0.25rem', 
                          borderLeft: opt.is_correct ? '4px solid var(--status-success)' : '4px solid transparent',
                          backgroundColor: opt.is_correct ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          <span style={{ width: '24px', color: 'var(--text-muted)' }}>{String.fromCharCode(65 + i)}.</span>
                          <span>{opt.option_text || opt.text}</span>
                          {opt.is_correct && <span style={{ marginLeft: 'auto', color: 'var(--status-success)', fontSize: '0.75rem', fontWeight: 600 }}>✓ Correct</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center" style={{ padding: '3rem', color: 'var(--text-muted)' }}>
                  No questions found for this exam
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} title={formData.id ? 'Edit Question' : 'Add Question'} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Question Text</label>
            <textarea 
              className="form-control" 
              rows="3"
              value={formData.question_text || formData.text} 
              onChange={e => setFormData({...formData, question_text: e.target.value})} 
              required 
            />
          </div>
          
          <div className="form-group" style={{ maxWidth: '150px' }}>
            <label className="form-label">Marks</label>
            <input 
              type="number" 
              min="1" 
              className="form-control" 
              value={formData.marks} 
              onChange={e => setFormData({...formData, marks: e.target.value})} 
              required 
            />
          </div>
          
          <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
            <div className="flex justify-between items-center mb-2">
              <label className="form-label" style={{ margin: 0 }}>Options</label>
              <button type="button" className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={handleAddOption}>
                + Add Option
              </button>
            </div>
            
            {formData.options.map((opt, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <input 
                  type="radio" 
                  name="correct_option" 
                  checked={opt.is_correct}
                  onChange={(e) => handleOptionChange(index, 'is_correct', e.target.checked)}
                  style={{ width: '20px', height: '20px', accentColor: 'var(--primary-color)' }}
                />
                <input 
                  type="text" 
                  className="form-control" 
                  value={opt.option_text || opt.text} 
                  onChange={(e) => handleOptionChange(index, 'option_text', e.target.value)}
                  placeholder={`Option ${String.fromCharCode(65 + index)}`}
                  required
                />
                <button 
                  type="button" 
                  onClick={() => handleRemoveOption(index)}
                  style={{ background: 'none', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', padding: '0.5rem' }}
                  title="Remove option"
                >
                  &times;
                </button>
              </div>
            ))}
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Select the radio button next to the correct option.
            </p>
          </div>

          <div className="flex justify-end gap-2 mt-4 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Question'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageQuestions;
