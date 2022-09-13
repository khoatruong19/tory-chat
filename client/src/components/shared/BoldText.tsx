import { Text } from '@chakra-ui/react';
import React from 'react';
import { blackColor } from '../../utils/constants';

interface IProps {
  text: string;
  fontSize?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
}

const BoldText = ({ text, fontSize }: IProps) => {
  return (
    <Text color={blackColor} fontSize={fontSize || 'xl'} fontWeight={600}>
      {text}
    </Text>
  );
};

export default BoldText;
