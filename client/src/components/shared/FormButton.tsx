import { Button } from '@chakra-ui/react';
import React from 'react';
import { blueColor } from '../../utils/constants';

const FormButton = ({
  text,
  disabled,
}: {
  text: string;
  disabled: boolean;
}) => {
  return (
    <Button
      type="submit"
      disabled={disabled}
      p={3}
      borderRadius={10}
      bg={blueColor}
      m="2rem auto 1rem"
      display={'block'}
      width={100}
      height={55}
      fontSize={20}
      color={'white'}
      _hover={{ color: '#000', bg: 'gray.200' }}
    >
      {text}
    </Button>
  );
};

export default FormButton;
