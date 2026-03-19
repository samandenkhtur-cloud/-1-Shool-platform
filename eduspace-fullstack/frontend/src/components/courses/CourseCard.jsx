import { Link } from 'react-router-dom';
import { BookOpen, Users, Clock, Star } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { Avatar } from '../ui/Avatar';
import { getLevelColor, getCategoryIcon, truncate } from '../../lib/utils';

const progressColorMap = {
  c001:'blue', c002:'emerald', c003:'amber', c004:'violet', c005:'rose', c006:'cyan',
};

export function CourseCard({ course, enrolled, onEnroll, enrolling }) {
  const pColor = progressColorMap[course.id] || 'blue';

  return (
    <div className="card card-hover flex flex-col overflow-hidden group animate-fade-in">
      {/* Thumbnail */}
      <Link to={`/courses/${course.id}`} className="block relative overflow-hidden h-40 flex-shrink-0">
        <div className={`absolute inset-0 bg-gradient-to-br ${course.bgGradient} opacity-90`} />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-5xl filter drop-shadow-lg">{getCategoryIcon(course.category)}</span>
        </div>
        <div className="absolute top-3 left-3">
          <Badge className={getLevelColor(course.level)}>{course.level}</Badge>
        </div>
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/25 backdrop-blur-sm rounded-full px-2 py-0.5">
          <Star className="w-3 h-3 text-amber-300 fill-amber-300" />
          <span className="text-white text-xs font-semibold">{course.rating}</span>
        </div>
        {enrolled && course.progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
            <div className="h-full bg-white/70 transition-all" style={{ width: `${course.progress}%` }} />
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        <div className="flex items-start gap-2 mb-2">
          <Badge variant="default" className="text-xs flex-shrink-0">{course.category}</Badge>
        </div>

        <Link to={`/courses/${course.id}`}>
          <h3 className="font-display font-bold text-sm leading-snug mb-1 transition-colors line-clamp-2 hover:text-brand-600 dark:hover:text-brand-400" style={{ color: 'var(--text-main)' }}>
            {course.title}
          </h3>
        </Link>

        <p className="text-xs line-clamp-2 mb-3 flex-1" style={{ color: 'var(--text-muted)' }}>
          {truncate(course.description, 90)}
        </p>

        <div className="flex items-center gap-2 mb-3">
          <Avatar src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${course.teacher}`} name={course.teacher} size="xs" />
          <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{course.teacher}</span>
        </div>

        <div className="flex items-center gap-3 text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
          <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{course.lessonsCount} lessons</span>
          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{course.studentsCount?.toLocaleString()}</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{course.duration}</span>
        </div>

        {enrolled && course.progress > 0 && (
          <div className="mb-3">
            <ProgressBar value={course.progress} color={pColor} showLabel size="sm" />
          </div>
        )}

        {enrolled ? (
          <Link to={`/courses/${course.id}`} className="btn-primary text-center text-xs py-2 block">
            {course.progress > 0 ? 'Continue Learning' : 'Start Course'}
          </Link>
        ) : (
          <button
            onClick={() => onEnroll?.(course.id)}
            disabled={enrolling}
            className="btn-secondary text-center text-xs py-2 hover:border-brand-300 hover:text-brand-600 dark:hover:text-brand-400"
          >
            {enrolling ? 'Enrolling…' : 'Enroll Now'}
          </button>
        )}
      </div>
    </div>
  );
}
