// type Validations<T> = ... // Define the Validations type as required
import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

export type Validations<T> = Partial<Record<keyof T, string>>;

function useForm<T extends Record<string, any>>(initialState: T,validate? :  (values: T) => Validations<T>) {
  const [values, setValues] = useState<T>(initialState)

  const [errors, setErrors] = useState<Validations<T>>({})

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type} =  e.target

    if (type === "file") {
      const file = (e.target as HTMLInputElement).files?.[0] || null;
      setValues((prev) => ({ ...prev, [name]: file }));
      return;
    }

    setValues(prev => ({ ...prev, [name]: value }))
  } 

  const handleSubmit = (onSubmit: (values: T) => void) => (e: FormEvent) => {
    e.preventDefault()

    if (validate) {
      const validationErrors = validate(values);
      setErrors(validationErrors);

      // Si hay errores, no ejecutar onSubmit
      if (Object.keys(validationErrors).length > 0) return;
    }

    onSubmit(values);
  } 

  return {values, handleChange, handleSubmit, errors}
}

export default useForm;