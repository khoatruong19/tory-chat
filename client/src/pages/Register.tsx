import { useToast } from '@chakra-ui/react';
import { Form, Formik, FormikHelpers } from 'formik';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import authApi from '../api/authApi';
import AuthLayout from '../components/layout/AuthLayout';
import FormButton from '../components/shared/FormButton';
import InputField from '../components/shared/InputField';
import LinkText from '../components/shared/LinkText';
import { RegisterInput } from '../utils/types';

const Register = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const initialValues = {
    email: '',
    firstName: '',
    lastName: '',
    password: '',
  };

  const handleRegisterSubmit = async (
    values: RegisterInput,
    { setErrors }: FormikHelpers<RegisterInput>
  ) => {
    try {
      const response = await authApi.register(values);
      if (response.data) {
        toast({
          title: 'Register successfully!',
          description: 'Now please login',
          status: 'success',
          duration: 4000,
          isClosable: true,
        });
        navigate('/login');
      }
    } catch (error: any) {
      toast({
        title: 'Register failed :(',
        description: 'Something is wrong with server. Try another time.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  };
  return (
    <AuthLayout title="Register">
      <Formik initialValues={initialValues} onSubmit={handleRegisterSubmit}>
        {({ isSubmitting, handleSubmit }) => (
          <Form onSubmit={handleSubmit}>
            <InputField
              type="email"
              name="email"
              label="Email"
              placeholder="Email..."
            />
            <InputField
              type="text"
              name="firstName"
              label="First name"
              placeholder="First name..."
            />
            <InputField
              type="text"
              name="lastName"
              label="Last name"
              placeholder="Last name..."
            />
            <InputField
              type="password"
              name="password"
              label="Password"
              placeholder="Password..."
            />
            <FormButton text="Register" disabled={isSubmitting} />
            <LinkText text="Already have an acoount? Login!" to="/login" />
          </Form>
        )}
      </Formik>
    </AuthLayout>
  );
};

export default Register;
