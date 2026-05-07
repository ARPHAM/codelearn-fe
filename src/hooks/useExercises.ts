import { useQuery } from '@tanstack/react-query';
import { exerciseApi } from '@/api/exercise.api';

export const useExercisesByCourse = (courseId: string) => {
  return useQuery({
    queryKey: ['course-exercises', courseId],
    queryFn: () => exerciseApi.getExercisesByCourse(courseId),
    enabled: !!courseId && courseId !== 'new',
  });
};
