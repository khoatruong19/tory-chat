import { Avatar, AvatarBadge, Box, Flex, Text } from '@chakra-ui/react';
import React from 'react';
import { User } from '../../utils/types';

interface IProps {
  image: string;
  lastName: string;
  firstName: string;
  activeDisplay?: boolean;
  small?: boolean;
}

const UserAvatar = ({
  firstName,
  image,
  lastName,
  activeDisplay,
  small,
}: IProps) => {
  if (image.length > 0)
    return (
      <Avatar size={small ? 'md' : 'lg'} name="Dan Abrahmov" src={image}>
        {activeDisplay && <AvatarBadge boxSize="0.8em" bg="green.500" />}
      </Avatar>
    );
  else {
    return (
      <Flex
        w={small ? 12 : 16}
        h={small ? 12 : 16}
        borderRadius={'50%'}
        alignItems="center"
        justifyContent={'center'}
        bg="gray.200"
        position={'relative'}
      >
        <Text fontSize={small ? 16 : 20} fontWeight="600">
          {lastName && firstName
            ? (firstName.charAt(0) + lastName.charAt(0)).toUpperCase()
            : ''}
        </Text>
        {activeDisplay && (
          <Box
            w={4}
            h={4}
            bg={'green.200'}
            borderRadius={'50%'}
            borderWidth={1}
            borderColor={'white'}
            position={'absolute'}
            bottom={-0.5}
            right={1.5}
          />
        )}
      </Flex>
    );
  }
};

export default UserAvatar;
