import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Textarea,
} from '@chakra-ui/react';
import { useField } from 'formik';
import React from 'react';

interface InputFieldProps {
  name: string;
  label: string;
  placeholder: string;
  type?: string;
  textarea?: boolean;
}

const InputField = (props: InputFieldProps) => {
  const [field, { error }] = useField(props);
  return (
    <FormControl isInvalid={!!error} mb={5}>
      <FormLabel fontSize={20} htmlFor={field.name}>
        {props.label}
      </FormLabel>
      {props.textarea ? (
        <Textarea
          {...field}
          name={field.name}
          placeholder={props.placeholder}
        />
      ) : (
        <Input
          required
          fontSize={18}
          {...field}
          type={props.type}
          name={field.name}
          placeholder={props.placeholder}
        />
      )}
      {error && <FormErrorMessage>{error}</FormErrorMessage>}
    </FormControl>
  );
};

export default InputField;
