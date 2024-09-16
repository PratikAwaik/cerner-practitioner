import {
  MutationFunction,
  QueryKey,
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useMutate = <TArguments, TResult>(
  mutationFn: MutationFunction<TArguments, TResult>,
  queryIDtoInvalidate?: QueryKey,
  successMsg?: string,
  options?: UseMutationOptions<TArguments, Error, TResult, unknown>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess(data, variables, context) {
      if (successMsg) {
        toast.success(successMsg);
      }
      if (queryIDtoInvalidate) {
        queryClient.invalidateQueries({
          queryKey: queryIDtoInvalidate,
        });
      }
      options?.onSuccess?.(data, variables, context);
    },
    onError(err, variables, context) {
      console.error(err);
      options?.onError?.(err, variables, context);
      toast.error(
        "Uh oh! Something went wrong. There was a problem with your request."
      );
    },
  });
};
