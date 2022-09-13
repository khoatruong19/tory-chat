import { Box, Button, HStack, Text, useToast } from '@chakra-ui/react';
import React from 'react';
import friendApi from '../api/friendApi';
import UserAvatar from './shared/UserAvatar';

interface IProps {
  id: number;
  sender: string;
  senderImage: string;
  handleCancelRequest: (type: 'receive' | 'send', id: number) => void;
  handleAcceptRequest: (id: number) => void;
}

const ReceivedRequestCard = ({
  id,
  sender,
  senderImage,
  handleCancelRequest,
  handleAcceptRequest,
}: IProps) => {
  const toast = useToast();

  return (
    <HStack spacing={3} mb={8}>
      <UserAvatar
        image={senderImage}
        lastName={sender.split(' ')[0]}
        firstName={sender.split(' ')[1]}
      />
      <Box>
        <Text>
          <b>{sender}</b> sends you a friend request
        </Text>

        <HStack mt={2} spacing={2}>
          <Button
            onClick={() => handleAcceptRequest(id)}
            variant={'solid'}
            w={'60px'}
            p={1}
            colorScheme={'green'}
          >
            Accept
          </Button>
          <Button
            onClick={() => handleCancelRequest('receive', id)}
            mt={1}
            variant={'solid'}
            w={'60px'}
            p={1}
            colorScheme={'red'}
          >
            Cancel
          </Button>
        </HStack>
      </Box>
    </HStack>
  );
};

export default ReceivedRequestCard;
