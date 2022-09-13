import { Flex } from '@chakra-ui/react';
import React from 'react';

interface IProps {
  figure: number;
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

const NumberBadge = ({ figure, bottom, left, right, top }: IProps) => {
  return (
    <Flex
      minW={4}
      minH={4}
      position={'absolute'}
      borderRadius={'50%'}
      bg={'red.300'}
      right={right}
      left={left || ''}
      bottom={bottom}
      top={top || ''}
      alignItems={'center'}
      justifyContent={'center'}
      fontSize={10}
      color={'white'}
      fontWeight={500}
    >
      {figure}
    </Flex>
  );
};

export default NumberBadge;
