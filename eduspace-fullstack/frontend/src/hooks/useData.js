import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  authService, coursesService, lessonsService, progressService, statsService,
  notificationsService, liveSessionsService, studentsService, analyticsService,
} from '../services/api';

// ── Courses ──────────────────────────────────────────────
export const useCourses = (filters = {}) =>
  useQuery({ queryKey: ['courses', filters], queryFn: () => coursesService.getCourses(filters), staleTime: 300_000 });

export const useCoursesWithProgress = (filters = {}) => {
  const coursesQuery = useCourses(filters);
  const progressQuery = useAllProgress();

  const courses = (coursesQuery.data?.courses || []).map((c) => {
    const p = progressQuery.data?.[c.id];
    return {
      ...c,
      progress: p?.percentage ?? c.progress ?? 0,
      completedLessons: p?.completedLessons ?? 0,
      totalLessons: p?.totalLessons ?? c.lessonsCount ?? 0,
    };
  });

  return {
    ...coursesQuery,
    data: coursesQuery.data ? { ...coursesQuery.data, courses } : coursesQuery.data,
    progress: progressQuery.data,
  };
};
export const useCourse = (id) =>
  useQuery({ queryKey: ['course', id], queryFn: () => coursesService.getCourse(id), enabled: !!id, staleTime: 300_000 });

export const useEnrollCourse = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: coursesService.enrollCourse, onSuccess: () => qc.invalidateQueries({ queryKey: ['courses'] }) });
};

export const useUnenrollCourse = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: coursesService.unenrollCourse, onSuccess: () => qc.invalidateQueries({ queryKey: ['courses'] }) });
};

export const useCreateCourse = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: coursesService.createCourse, onSuccess: () => qc.invalidateQueries({ queryKey: ['courses'] }) });
};

export const useDeleteCourse = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: coursesService.deleteCourse, onSuccess: () => qc.invalidateQueries({ queryKey: ['courses'] }) });
};

export const useUpdateCourse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => coursesService.updateCourse(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['courses'] });
      qc.invalidateQueries({ queryKey: ['course', id] });
    },
  });
};

export const useUpdateProfile = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: authService.updateProfile, onSuccess: () => qc.invalidateQueries({ queryKey: ['user'] }) });
};

export const useCreateLesson = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: lessonsService.createLesson,
    onSuccess: (_, input) => {
      qc.invalidateQueries({ queryKey: ['lessons', input.courseId] });
      qc.invalidateQueries({ queryKey: ['course', input.courseId] });
    },
  });
};

export const useUploadLessonMaterial = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ lessonId, file }) => lessonsService.uploadMaterial(lessonId, file),
    onSuccess: (_, { lessonId }) => {
      qc.invalidateQueries({ queryKey: ['lesson', lessonId] });
      qc.invalidateQueries({ queryKey: ['lessons'] });
    },
  });
};

// ── Lessons ──────────────────────────────────────────────
export const useLessons = (courseId) =>
  useQuery({ queryKey: ['lessons', courseId], queryFn: () => lessonsService.getLessons(courseId), enabled: !!courseId, staleTime: 300_000 });

export const useLesson = (id) =>
  useQuery({ queryKey: ['lesson', id], queryFn: () => lessonsService.getLesson(id), enabled: !!id, staleTime: 600_000 });

export const useLessonsTable = () =>
  useQuery({ queryKey: ['lessonsTable'], queryFn: lessonsService.getLessonsTable, staleTime: 180_000 });

export const useMarkComplete = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: lessonsService.markComplete,
    onSuccess: (_, lessonId) => {
      qc.invalidateQueries({ queryKey: ['lesson', lessonId] });
      qc.invalidateQueries({ queryKey: ['lessons'] });
      qc.invalidateQueries({ queryKey: ['allProgress'] });
      qc.invalidateQueries({ queryKey: ['progress'] });
      qc.invalidateQueries({ queryKey: ['courses'] });
    },
  });
};

// ── Progress ─────────────────────────────────────────────
export const useProgress = (courseId) =>
  useQuery({ queryKey: ['progress', courseId], queryFn: () => progressService.getProgress(courseId), enabled: !!courseId, staleTime: 120_000 });

export const useAllProgress = () =>
  useQuery({ queryKey: ['allProgress'], queryFn: progressService.getAllProgress, staleTime: 120_000 });

// ── Stats ────────────────────────────────────────────────
export const useStats = (role) =>
  useQuery({ queryKey: ['stats', role], queryFn: () => statsService.getStats(role), enabled: !!role, staleTime: 300_000 });

// ── Notifications ────────────────────────────────────────
export const useNotifications = () =>
  useQuery({ queryKey: ['notifications'], queryFn: notificationsService.getNotifications, staleTime: 60_000, refetchInterval: 120_000 });

export const useMarkNotificationRead = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: notificationsService.markRead, onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }) });
};

export const useMarkAllNotificationsRead = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: notificationsService.markAllRead, onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }) });
};

// ── Live Sessions ────────────────────────────────────────
export const useLiveSessions = () =>
  useQuery({ queryKey: ['liveSessions'], queryFn: liveSessionsService.getSessions, staleTime: 60_000, refetchInterval: 30_000 });

export const useScheduleSession = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: liveSessionsService.scheduleSession, onSuccess: () => qc.invalidateQueries({ queryKey: ['liveSessions'] }) });
};

// ── Students ─────────────────────────────────────────────
export const useStudents = () =>
  useQuery({ queryKey: ['students'], queryFn: studentsService.getStudents, staleTime: 300_000 });

export const useStudent = (id) =>
  useQuery({ queryKey: ['student', id], queryFn: () => studentsService.getStudent(id), enabled: !!id, staleTime: 300_000 });

export const useUpdateStudent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => studentsService.updateStudent(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['students'] });
      qc.invalidateQueries({ queryKey: ['student', id] });
    },
  });
};

export const useUpdateStudentStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }) => studentsService.updateStudentStatus(id, isActive),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['students'] });
      qc.invalidateQueries({ queryKey: ['student', id] });
    },
  });
};

export const useDeleteStudent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: studentsService.deleteStudent,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['students'] });
    },
  });
};

// ── Analytics ────────────────────────────────────────────
export const useAnalytics = (enabled = true) =>
  useQuery({ queryKey: ['analytics'], queryFn: analyticsService.getAnalytics, staleTime: 300_000, enabled });
