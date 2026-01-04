import { ref, reactive } from 'vue';
import type { ZodSchema, ZodError } from 'zod';

export interface UseFormOptions<T> {
  schema: ZodSchema<T>;
  initialValues?: Partial<T>;
  onSubmit?: (values: T) => Promise<void> | void;
}

export interface FormErrors {
  [key: string]: string | undefined;
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
    try {
      const fieldSchema = (schema as unknown as { shape: Record<string, ZodSchema> }).shape?.[field];
      if (fieldSchema) {
        fieldSchema.parse(values[field]);
        errors[field] = undefined;
        return true;
      }
    } catch (error) {
      if (error instanceof Error && 'issues' in error) {
        const zodError = error as ZodError;
        errors[field] = zodError.issues[0]?.message;
      }
    }
    return false;
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validate()) {
      return;
    }

    if (onSubmit) {
      isSubmitting.value = true;
      try {
        await onSubmit(values);
      } finally {
        isSubmitting.value = false;
      }
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
    if (errors[field]) {
      validateField(field);
    }
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

