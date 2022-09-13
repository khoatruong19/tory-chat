import { Box } from '@chakra-ui/react';
import React from 'react';

const PaddingWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box paddingTop={10} paddingX={5}>
      {children}
    </Box>
  );
};

export default PaddingWrapper;
