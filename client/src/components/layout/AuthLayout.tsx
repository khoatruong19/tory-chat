import React, { useEffect } from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';
import { grayColor } from '../../utils/constants';
import Logo from '../shared/Logo';
import { useAuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
const AuthLayout = ({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  useEffect(() => {
    if (user.email) navigate('/');
  }, [user]);

  return (
    <Flex
      width={'100vw'}
      height={'100vh'}
      alignItems={'center'}
      justifyContent={'center'}
    >
      <Box
        width={'35%'}
        minHeight={'45%'}
        bg={'gray.50'}
        borderRadius={20}
        p={5}
      >
        <Box mb={-5}>
          <Logo />
        </Box>
        <Text textAlign={'center'} fontSize={40} fontWeight="600">
          {title}
        </Text>
        {children}
      </Box>
    </Flex>
  );
};

export default AuthLayout;
