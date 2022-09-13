import { Box, Button, HStack, Text, useToast } from '@chakra-ui/react';
import React from 'react';
import friendApi from '../api/friendApi';
import UserAvatar from './shared/UserAvatar';

interface IProps {
  id: number;
  receiver: string;
  receiverImage: string;
  handleCancelRequest: (type: 'receive' | 'send', id: number) => void;
}

const SentRequestCard = ({
  id,
  receiver,
  receiverImage,
  handleCancelRequest,
}: IProps) => {
  const toast = useToast();

  return (
    <HStack spacing={3} mb={8}>
      <UserAvatar
        image={receiverImage}
        lastName={receiver.split(' ')[0]}
        firstName={receiver.split(' ')[1]}
      />
      <Box>
        <Text>
          Waiting for <b>{receiver}</b> to response
        </Text>
        <Button
          onClick={() => handleCancelRequest('send', id)}
          mt={2}
          variant={'solid'}
          w={'60px'}
          p={1}
          colorScheme={'red'}
        >
          Cancel
        </Button>
      </Box>
    </HStack>
  );
};

export default SentRequestCard;
