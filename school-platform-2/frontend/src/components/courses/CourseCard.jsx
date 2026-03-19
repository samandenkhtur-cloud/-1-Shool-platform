import { Link } from 'react-router-dom';
import { BookOpen, Users, Calendar } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { truncate } from '../../lib/utils';

export function CourseCard({ course, enrolled, onEnroll, enrolling }) {
  return (
    <div className="card card-hover flex flex-col overflow-hidden group animate-fade-in">
      <Link to={`/courses/${course.id}`} className="block relative overflow-hidden h-28 flex-shrink-0">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500 to-brand-700 opacity-90" />
        <div className="absolute inset-0 flex items-center justify-center">
          <BookOpen className="w-10 h-10 text-white/90" />
        </div>
      </Link>

      <div className="flex flex-col flex-1 p-4">
        <div className="flex items-start gap-2 mb-2">
          <Badge variant="default" className="text-xs">Course</Badge>
        </div>

        <Link to={`/courses/${course.id}`}>
          <h3 className="font-display font-bold text-sm leading-snug mb-1 transition-colors line-clamp-2 hover:text-brand-600 dark:hover:text-brand-400" style={{ color: 'var(--text-main)' }}>
            {course.title}
          </h3>
        </Link>

        <p className="text-xs line-clamp-2 mb-3 flex-1" style={{ color: 'var(--text-muted)' }}>
          {truncate(course.description, 90)}
        </p>

        <div className="flex items-center gap-3 text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{course.studentsCount?.toLocaleString() || 0}</span>
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(course.createdAt).toLocaleDateString()}</span>
        </div>

        {enrolled ? (
          <Link to={`/courses/${course.id}`} className="btn-primary text-center text-xs py-2 block">
            Continue
          </Link>
        ) : onEnroll ? (
          <button
            onClick={() => onEnroll?.(course.id)}
            disabled={enrolling}
            className="btn-secondary text-center text-xs py-2 hover:border-brand-300 hover:text-brand-600 dark:hover:text-brand-400"
          >
            {enrolling ? 'Enrolling...' : 'Enroll Now'}
          </button>
        ) : (
          <Link to={`/courses/${course.id}`} className="btn-secondary text-center text-xs py-2 block">
            View Details
          </Link>
        )}
      </div>
    </div>
  );
}
