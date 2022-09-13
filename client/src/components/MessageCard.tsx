import { Avatar, Box, Flex, HStack, Text } from '@chakra-ui/react';
import React, { useEffect } from 'react';
import BoldText from './shared/BoldText';
import { grayColor, redColor } from '../utils/constants';
import { User } from '../utils/types';
import UserAvatar from './shared/UserAvatar';
import { formatFullname } from '../utils/helper';
import { useParams } from 'react-router-dom';

interface IProps {
  conversationId: number;
  user: User;
  lastMessage?: string;
  unseenMessagesCount: number;
}

const MessageCard = ({
  lastMessage,
  user,
  conversationId: id,
  unseenMessagesCount,
}: IProps) => {
  const { conversationId } = useParams();

  return (
    <Flex
      cursor={'pointer'}
      bg={
        conversationId && Number(conversationId) === id
          ? 'blackAlpha.50'
          : 'transparent'
      }
      borderRadius={'xl'}
      p={3}
      alignItems={'center'}
      justifyContent={'space-between'}
      _hover={{ bg: 'blackAlpha.50' }}
    >
      <HStack spacing={3}>
        <UserAvatar
          image={user.image}
          firstName={user.firstName}
          lastName={user.lastName}
        />
        <Box>
          <BoldText
            fontSize="md"
            text={formatFullname(user.firstName, user.lastName)}
          />
          <Text fontSize="sm" color={grayColor} maxWidth={'72'}>
            {lastMessage && lastMessage?.length > 10
              ? lastMessage?.slice(0, 10) + '...'
              : lastMessage}
          </Text>
        </Box>
      </HStack>

      {unseenMessagesCount > 0 && (
        <Box
          w={6}
          h={6}
          borderRadius={'50%'}
          bg={redColor}
          display={'flex'}
          alignItems={'center'}
          justifyContent={'center'}
          color={'white'}
        >
          {unseenMessagesCount}
        </Box>
      )}
    </Flex>
  );
};

export default MessageCard;
