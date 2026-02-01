import { reactive, ref } from "vue";
import { z, type ZodError, type ZodSchema } from "zod";

export interface FormErrors {
  [key: string]: string | undefined;
}

export interface UseFormOptions<T> {
  schema: ZodSchema<T>;
  initialValues?: Partial<T>;
  onSubmit?: (values: T) => Promise<void> | void;
}

export function useForm<T extends Record<string, unknown>>(options: UseFormOptions<T>) {
  const { schema, initialValues = {}, onSubmit } = options;

  const values = reactive({ ...initialValues } as T);
  const errors = reactive<FormErrors>({});
  const isSubmitting = ref(false);
  const touched = reactive<Record<string, boolean>>({});

  const validate = (): boolean => {
    try {
      schema.parse(values);

      Object.keys(errors).forEach((key) => {
        errors[key] = undefined;
      });
      return true;
    } catch (error) {
      console.error('Zod Validation Error:', error);
      if (error instanceof Error && 'issues' in error) {
        const zodError = error as ZodError;
        zodError.issues.forEach((issue) => {
          const path = issue.path.join('.');
          errors[path] = issue.message;
        });
      }
      return false;
    }
  };

  const validateField = (field: string): boolean => {
    // 1. Create a partial schema containing only the field we want to check
    // This works even if the main schema is wrapped in .refine() or other methods
    const fieldSchema =
      'shape' in schema && typeof (schema as z.ZodObject<z.ZodRawShape>).pick === 'function'
        ? (schema as z.ZodObject<z.ZodRawShape>).pick({ [field]: true } as { [k: string]: true })
        : schema;

    // 2. Validate just that field against the current value
    const result = fieldSchema.safeParse({ [field]: values[field] });

    if (result.success) {
      // If valid, clear the error
      errors[field] = undefined;
      return true;
    } else {
      // If invalid, set the error message
      const error = result.error.errors[0];
      if (error) {
        errors[field] = error.message;
      }
      return false;
    }
  };

  const handleSubmit = async (): Promise<void> => {
    Object.keys(values).forEach((key) => {
      touched[key] = true;
    });
    const isValid = validate();

    if (!isValid) {
      return;
    }

    if (onSubmit) {
      isSubmitting.value = true;
      try {
        await onSubmit({ ...values } as T);
      } catch (error) {
        console.error('❌ Error during onSubmit:', error);
      } finally {
        isSubmitting.value = false;
      }
    } else {
      console.warn('⚠️ No onSubmit handler provided.');
    }
  };

  const reset = (): void => {
    Object.assign(values, initialValues);
    Object.keys(errors).forEach((key) => {
      errors[key] = undefined;
    });
    Object.keys(touched).forEach((key) => {
      touched[key] = false;
    });
  };

  const setFieldValue = (field: string, value: unknown): void => {
    (values as Record<string, unknown>)[field] = value;
    touched[field] = true;

    // Always validate on change
    validateField(field);
  };

  return {
    values,
    errors,
    isSubmitting,
    touched,
    validate,
    validateField,
    handleSubmit,
    reset,
    setFieldValue,
  };
}
