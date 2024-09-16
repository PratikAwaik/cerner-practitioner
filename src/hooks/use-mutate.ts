import {
  MutationFunction,
  QueryKey,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useMutate = <TArguments, TResult>(
  mutationFn: MutationFunction<TArguments, TResult>,
  queryIDtoInvalidate?: QueryKey,
  successMsg?: string
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess() {
      if (successMsg) {
        toast.success(successMsg);
      }
      if (queryIDtoInvalidate) {
        if (Array.isArray(queryIDtoInvalidate)) {
          queryIDtoInvalidate.forEach((queryID) => {
            queryClient.invalidateQueries({
              queryKey: queryID,
            });
          });
        } else
          queryClient.invalidateQueries({
            queryKey: queryIDtoInvalidate,
          });
      }
    },
    onError(err) {
      console.error(err);
      toast.error(
        "Uh oh! Something went wrong. There was a problem with your request."
      );
    },
  });
};
