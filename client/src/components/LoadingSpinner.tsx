import { Flex, Spinner } from '@chakra-ui/react';
import React from 'react';

const LoadingSpinner = () => {
  return (
    <Flex w={'100vw'} h={'100vh'} alignItems="center" justifyContent={'center'}>
      <Spinner
        thickness="4px"
        speed="0.65s"
        emptyColor="gray.200"
        color="blue.500"
        size="xl"
      />
    </Flex>
  );
};

export default LoadingSpinner;
