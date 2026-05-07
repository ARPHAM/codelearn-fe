import { useQuery } from '@tanstack/react-query';
import { courseApi } from '@/api/course.api';

export const useMyCourses = () => {
  return useQuery({
    queryKey: ['my-courses'],
    queryFn: () => courseApi.getMyCourses(),
  });
};

export const useCourseStudents = (courseId: string) => {
  return useQuery({
    queryKey: ['course-students', courseId],
    queryFn: () => courseApi.getCourseUsers(courseId),
    enabled: !!courseId && courseId !== 'new',
  });
};
