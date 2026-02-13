// Type augmentation for react-hook-form
import 'react-hook-form';

declare module 'react-hook-form' {
  export interface UseFormReturn<TFieldValues extends FieldValues = FieldValues, TContext = any> {
    handleSubmit: <TSubmitFieldValues extends FieldValues = TFieldValues>(
      onValid: SubmitHandler<TSubmitFieldValues>,
      onInvalid?: SubmitErrorHandler<TSubmitFieldValues>
    ) => (e?: React.BaseSyntheticEvent) => Promise<void>;
  }
}
