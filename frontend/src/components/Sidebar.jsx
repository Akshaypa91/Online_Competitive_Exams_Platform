import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { BookOpen, Users, FileText, CheckSquare, Award, Clock, LayoutDashboard, Menu, X } from 'lucide-react';

const Sidebar = ({ isAdmin }) => {
  const [isOpen, setIsOpen] = useState(false);

  const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Students', path: '/admin/students', icon: Users },
    { name: 'Topics', path: '/admin/topics', icon: BookOpen },
    { name: 'Exams', path: '/admin/exams', icon: FileText },
    { name: 'Questions', path: '/admin/questions', icon: CheckSquare },
    { name: 'Attempts', path: '/admin/attempts', icon: Clock },
    { name: 'Results', path: '/admin/results', icon: Award },
  ];

  const studentLinks = [
    { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'Available Exams', path: '/student/exams', icon: FileText },
    { name: 'My Results', path: '/student/results', icon: Award },
  ];

  const links = isAdmin ? adminLinks : studentLinks;

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      <button 
        className="btn btn-primary" 
        style={{ position: 'fixed', top: '1rem', left: '1rem', zIndex: 100, display: window.innerWidth > 768 ? 'none' : 'block' }}
        onClick={toggleSidebar}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <Award className="w-6 h-6" style={{ color: 'var(--primary-color)' }} />
          <span>{isAdmin ? 'Admin Portal' : 'Student Portal'}</span>
        </div>
        <nav className="sidebar-nav">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setIsOpen(false)}
            >
              <link.icon size={20} />
              <span>{link.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
