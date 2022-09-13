import { Text } from '@chakra-ui/react';
import React from 'react';
import { Link } from 'react-router-dom';

const LinkText = ({ text, to }: { text: string; to: string }) => {
  return (
    <Link to={to}>
      <Text
        fontSize={14}
        textDecoration={'underline'}
        _hover={{ fontWeight: '600' }}
        textAlign="right"
      >
        {text}
      </Text>
    </Link>
  );
};

export default LinkText;
