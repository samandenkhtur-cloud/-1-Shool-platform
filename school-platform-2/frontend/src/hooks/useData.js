import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  coursesService,
  notificationsService,
  studentsService,
} from '../services/api';

// Courses
export const useCourses = (filters = {}) =>
  useQuery({ queryKey: ['courses', filters], queryFn: () => coursesService.getCourses(filters), staleTime: 300_000 });

export const useCourse = (id) =>
  useQuery({ queryKey: ['course', id], queryFn: () => coursesService.getCourse(id), enabled: !!id, staleTime: 300_000 });

export const useEnrollCourse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: coursesService.enrollCourse,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['courses'] }),
  });
};

export const useCreateCourse = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: coursesService.createCourse, onSuccess: () => qc.invalidateQueries({ queryKey: ['courses'] }) });
};

export const useDeleteCourse = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: coursesService.deleteCourse, onSuccess: () => qc.invalidateQueries({ queryKey: ['courses'] }) });
};

// Notifications
export const useNotifications = () =>
  useQuery({ queryKey: ['notifications'], queryFn: notificationsService.getNotifications, staleTime: 60_000, refetchInterval: 120_000 });

// Students
export const useStudents = (filters = {}) =>
  useQuery({ queryKey: ['students', filters], queryFn: () => studentsService.getStudents(filters), staleTime: 300_000 });

export const useStudent = (id) =>
  useQuery({ queryKey: ['student', id], queryFn: () => studentsService.getStudent(id), enabled: !!id, staleTime: 300_000 });
