import { useMutation } from "@tanstack/react-query";
import { budgetApi, type BudgetEstimateInput } from "@/lib/api/cropfort/budget";

export function useBudgetEstimate() {
  return useMutation({
    mutationFn: (input: BudgetEstimateInput) => budgetApi.estimate(input),
  });
}
