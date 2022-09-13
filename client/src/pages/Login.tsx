import { Form, Formik, FormikHelpers } from 'formik';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/layout/AuthLayout';
import FormButton from '../components/shared/FormButton';
import InputField from '../components/shared/InputField';
import LinkText from '../components/shared/LinkText';
import { LoginInput } from '../utils/types';
import authApi from '../api/authApi';
import { formatError } from '../utils/helper';
import JwtManager from '../utils/jwt';
import { useAuthContext } from '../context/AuthContext';
import { useToast } from '@chakra-ui/react';

const Login = () => {
  const toast = useToast();
  const { setUser } = useAuthContext();
  const initialValues = { email: '', password: '' };
  const navigate = useNavigate();

  const handleLoginSubmit = async (
    values: LoginInput,
    { setErrors }: FormikHelpers<LoginInput>
  ) => {
    try {
      const response = await authApi.login(values);
      if (response.data) {
        JwtManager.setToken(response.data.tokens.access_token);
        JwtManager.setRefreshToken(response.data.tokens.refresh_token);
        setUser(response.data.user);
      }
      toast({
        title: 'Login successfully!',
        description: `Welcome, ${response.data.user.lastName}`,
        status: 'success',
        duration: 4000,
        isClosable: true,
      });
      navigate('/');
    } catch (error: any) {
      setErrors(formatError(error?.data.errors));
    }
  };
  return (
    <AuthLayout title="Login">
      <Formik initialValues={initialValues} onSubmit={handleLoginSubmit}>
        {({ isSubmitting, handleSubmit }) => (
          <Form onSubmit={handleSubmit}>
            <InputField
              type="email"
              name="email"
              label="Email"
              placeholder="Email..."
            />
            <InputField
              type="password"
              name="password"
              label="Password"
              placeholder="Password..."
            />
            <FormButton text="Login" disabled={isSubmitting} />
            <LinkText text="Dont have an acoount? Register!" to="/register" />
          </Form>
        )}
      </Formik>
    </AuthLayout>
  );
};

export default Login;
