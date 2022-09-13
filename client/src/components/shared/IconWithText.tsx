import { Box, Text } from '@chakra-ui/react';
import React from 'react';
import { IconType } from 'react-icons';
import { RiUserUnfollowLine } from 'react-icons/ri';

interface IProps {
  handleClickFunction: Function;
  bgColor: string;
  bgHoverColor: string;
  text: string;
  textBgColor: string;
  icon: React.ReactNode;
}

const IconWithText = ({
  bgColor,
  bgHoverColor,
  icon,
  text,
  textBgColor,
  handleClickFunction,
}: IProps) => {
  return (
    <Box
      onClick={() => handleClickFunction()}
      w={6}
      h={6}
      borderRadius={'50%'}
      bg={bgColor}
      display={'flex'}
      alignItems={'center'}
      justifyContent={'center'}
      color={'white'}
      position={'relative'}
      _hover={{
        cursor: 'pointer',
        bg: bgHoverColor,
        '&>p': {
          display: 'block',
        },
      }}
    >
      <Text
        as="p"
        w={'max-content'}
        textAlign={'center'}
        borderRadius={10}
        top={'-2rem'}
        display={'none'}
        position={'absolute'}
        p={1}
        bg={textBgColor}
        color="white"
        fontSize={'sm'}
        fontWeight={'600'}
      >
        {text}
      </Text>

      <Box>{icon}</Box>
    </Box>
  );
};

export default IconWithText;
