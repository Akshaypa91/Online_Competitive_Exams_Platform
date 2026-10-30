import React from 'react';
import { Filter, RotateCcw, Users } from 'lucide-react';

const CohortFilterBar = ({
  filters,
  onFilterChange,
  onReset,
  totalCount = 1000,
  filteredCount = 1000
}) => {
  const isFiltered = Object.values(filters).some(v => v !== 'all');

  return (
    <div
      style={{
        padding: '1rem 1.25rem',
        background: '#FFFFFF',
        borderRadius: '1rem',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.875rem'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={18} color="var(--primary-color)" />
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Cohort Demographic Slicer & Filters
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            (Live interactive slice of 1,000 student records)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.3rem 0.65rem',
              borderRadius: '2rem',
              background: 'var(--primary-light)',
              color: 'var(--primary-color)',
              fontSize: '0.75rem',
              fontWeight: 600
            }}
          >
            <Users size={14} />
            <span>
              {filteredCount} / {totalCount} Students ({Math.round((filteredCount / totalCount) * 100)}%)
            </span>
          </div>

          {isFiltered && (
            <button
              onClick={onReset}
              className="btn btn-ghost btn-sm"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.75rem',
                padding: '0.3rem 0.6rem',
                color: '#EF4444'
              }}
            >
              <RotateCcw size={14} />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Select Dropdowns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
        {/* Gender */}
        <div>
          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
            Gender
          </label>
          <select
            value={filters.gender}
            onChange={(e) => onFilterChange('gender', e.target.value)}
            style={{
              width: '100%',
              padding: '0.4rem 0.6rem',
              fontSize: '0.8125rem',
              borderRadius: '0.375rem',
              border: '1px solid var(--border-color)',
              background: '#FFFFFF',
              color: 'var(--text-primary)'
            }}
          >
            <option value="all">All Genders</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
          </select>
        </div>

        {/* Test Prep Course */}
        <div>
          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
            Test Prep Course
          </label>
          <select
            value={filters.testPrep}
            onChange={(e) => onFilterChange('testPrep', e.target.value)}
            style={{
              width: '100%',
              padding: '0.4rem 0.6rem',
              fontSize: '0.8125rem',
              borderRadius: '0.375rem',
              border: '1px solid var(--border-color)',
              background: '#FFFFFF',
              color: 'var(--text-primary)'
            }}
          >
            <option value="all">All Prep Status</option>
            <option value="completed">Completed</option>
            <option value="none">None</option>
          </select>
        </div>

        {/* Lunch / Economic status */}
        <div>
          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
            Lunch Type
          </label>
          <select
            value={filters.lunch}
            onChange={(e) => onFilterChange('lunch', e.target.value)}
            style={{
              width: '100%',
              padding: '0.4rem 0.6rem',
              fontSize: '0.8125rem',
              borderRadius: '0.375rem',
              border: '1px solid var(--border-color)',
              background: '#FFFFFF',
              color: 'var(--text-primary)'
            }}
          >
            <option value="all">All Lunch Types</option>
            <option value="standard">Standard</option>
            <option value="free/reduced">Free/Reduced</option>
          </select>
        </div>

        {/* Parental Education */}
        <div>
          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
            Parental Education
          </label>
          <select
            value={filters.parentalEducation}
            onChange={(e) => onFilterChange('parentalEducation', e.target.value)}
            style={{
              width: '100%',
              padding: '0.4rem 0.6rem',
              fontSize: '0.8125rem',
              borderRadius: '0.375rem',
              border: '1px solid var(--border-color)',
              background: '#FFFFFF',
              color: 'var(--text-primary)'
            }}
          >
            <option value="all">All Education Levels</option>
            <option value="master's degree">Master's Degree</option>
            <option value="bachelor's degree">Bachelor's Degree</option>
            <option value="associate's degree">Associate's Degree</option>
            <option value="some college">Some College</option>
            <option value="high school">High School</option>
            <option value="some high school">Some High School</option>
          </select>
        </div>

        {/* Race / Ethnicity */}
        <div>
          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
            Race / Ethnicity
          </label>
          <select
            value={filters.raceEthnicity}
            onChange={(e) => onFilterChange('raceEthnicity', e.target.value)}
            style={{
              width: '100%',
              padding: '0.4rem 0.6rem',
              fontSize: '0.8125rem',
              borderRadius: '0.375rem',
              border: '1px solid var(--border-color)',
              background: '#FFFFFF',
              color: 'var(--text-primary)'
            }}
          >
            <option value="all">All Groups</option>
            <option value="group A">Group A</option>
            <option value="group B">Group B</option>
            <option value="group C">Group C</option>
            <option value="group D">Group D</option>
            <option value="group E">Group E</option>
          </select>
        </div>

        {/* Performance Band */}
        <div>
          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
            Performance Band
          </label>
          <select
            value={filters.performanceBand}
            onChange={(e) => onFilterChange('performanceBand', e.target.value)}
            style={{
              width: '100%',
              padding: '0.4rem 0.6rem',
              fontSize: '0.8125rem',
              borderRadius: '0.375rem',
              border: '1px solid var(--border-color)',
              background: '#FFFFFF',
              color: 'var(--text-primary)'
            }}
          >
            <option value="all">All Bands</option>
            <option value="Advanced">Advanced (80-100%)</option>
            <option value="Proficient">Proficient (60-79%)</option>
            <option value="Developing">Developing (40-59%)</option>
            <option value="Needs Support">Needs Support (&lt;40%)</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default CohortFilterBar;
