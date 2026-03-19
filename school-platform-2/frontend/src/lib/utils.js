import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatRelativeTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = (now - date) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function getInitials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

export function getLevelColor(level) {
  const map = {
    Beginner: 'bg-emerald-100 text-emerald-700',
    Intermediate: 'bg-amber-100 text-amber-700',
    Advanced: 'bg-rose-100 text-rose-700',
  };
  return map[level] || 'bg-slate-100 text-slate-700';
}

export function getCategoryIcon(category) {
  const icons = {
    Mathematics: '📐',
    Programming: '💻',
    Humanities: '🏛️',
    Arts: '🎨',
    Science: '🔬',
    Languages: '📚',
  };
  return icons[category] || '📖';
}

export function getNotificationIcon(type) {
  const icons = {
    enrollment: '🎓',
    lesson: '📹',
    reminder: '⏰',
    grade: '📊',
  };
  return icons[type] || '🔔';
}

export function truncate(str, max = 80) {
  if (!str) return '';
  return str.length > max ? str.slice(0, max) + '…' : str;
}
