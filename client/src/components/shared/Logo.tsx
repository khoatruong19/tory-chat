import { Text } from '@chakra-ui/react';
import React from 'react';
import { blackColor, blueColor } from '../../utils/constants';

const Logo = () => {
  return (
    <Text mb={8} fontSize="3xl" fontWeight={600} color={blueColor}>
      Tory
      <Text as="span" fontSize="3xl" fontWeight={600} color={blackColor}>
        Chat
      </Text>
    </Text>
  );
};

export default Logo;
