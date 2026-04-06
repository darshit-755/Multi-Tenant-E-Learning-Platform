import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createClassApi,
  deleteClassApi,
  getClassesApi,
  updateClassApi,
} from "@/services/class.api";

export const useClassManager = () => {
  const queryClient = useQueryClient();

  //  Get Classes
  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["tenant-classes"],
    queryFn: async () => {
      const { data } = await getClassesApi();
      return data;
    },
  });

  //  Create Class
  const createClassMutation = useMutation({
    mutationFn: createClassApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-classes"] });
    },
  });

  //  Update Class
  const updateClassMutation = useMutation({
    mutationFn: ({ classId, data }) => updateClassApi(classId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-classes"] });
    },
  });

  //  Delete Class
  const deleteClassMutation = useMutation({
    mutationFn: deleteClassApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-classes"] });
    },
  });

  return {
    // data
    classes: data?.classes || [],
    isLoading,
    isError,

    // actions
    createClass: createClassMutation.mutateAsync,
    updateClass: updateClassMutation.mutateAsync,
    deleteClass: deleteClassMutation.mutate,

    // states
    isCreating: createClassMutation.isPending,
    isUpdating: updateClassMutation.isPending,
    isDeleting: deleteClassMutation.isPending,
  };
};