import { Avatar, Box, Flex, IconButton, Image, Text } from '@chakra-ui/react';
import React from 'react';
import { blueColor, grayColor } from '../utils/constants';
import { Message } from '../utils/types';
import { format } from 'timeago.js';
import UserAvatar from './shared/UserAvatar';
import { useAuthContext } from '../context/AuthContext';
import { TiDeleteOutline } from 'react-icons/ti';
import { useParams } from 'react-router-dom';
import messageApi from '../api/messageApi';
import { useAppDispatch } from '../store';
import { deleteMessage } from '../store/slices/messageSlice';
import { isValidHttpUrl } from '../utils/helper';

interface IProps {
  me?: boolean;
  message: Message;
  continuous?: boolean;
  showTime?: boolean;
}

const TextMessage = ({ me, message, continuous, showTime }: IProps) => {
  const dispatch = useAppDispatch();
  const { user } = useAuthContext();
  const { conversationId } = useParams();
  const handleDeleteMessage = async () => {
    try {
      let id = parseInt(conversationId!);
      dispatch(
        deleteMessage({
          conversationId: id,
          messageId: message.id,
        })
      );
      await messageApi.deleteMessage({
        requestId: id,
        messageId: message.id,
      });
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <Flex
      w={'100%'}
      mt={message ? 1 : 5}
      justifyContent={me ? 'flex-end' : 'flex-start'}
    >
      <Flex
        position={'relative'}
        gap={1}
        maxWidth={'70%'}
        flexDirection={me ? 'row-reverse' : 'row'}
        _hover={{
          '&>div:first-of-type': {
            display: 'block',
          },
        }}
      >
        {me && (
          <Box
            onClick={handleDeleteMessage}
            w={10}
            position={'absolute'}
            left={-6}
            top={'50%'}
            transform={'auto'}
            translateY={'-50%'}
            color={'gray.400'}
            display={'none'}
            _hover={{
              color: 'red.600',
              cursor: 'pointer',
            }}
          >
            <TiDeleteOutline fontSize={'1.2rem'} />
          </Box>
        )}

        <Box width={'50px'}>
          {!continuous && (
            <UserAvatar
              small
              firstName={me ? user.firstName : message.author.firstName}
              lastName={me ? user.lastName : message.author.lastName}
              image={me ? user.image : message.author.image}
            />
          )}
        </Box>
        {isValidHttpUrl(message.content) ? (
          <Box>
            <Image src={message.content} width={60} height={60} />
            {showTime && (
              <Text
                as="span"
                fontSize={'small'}
                color={grayColor}
                position={'absolute'}
                bottom={'-1.2rem'}
                right={me ? 14 : ''}
                left={!me ? 14 : ''}
                minWidth={'max-content'}
              >
                {format(message.createdAt)}
              </Text>
            )}
          </Box>
        ) : (
          <Text
            fontSize={'sm'}
            p={3}
            borderRadius={10}
            color={!me ? 'black' : 'white'}
            bg={!me ? 'white' : blueColor}
            wordBreak={'break-all'}
          >
            {message.content}
            {showTime && (
              <Text
                as="span"
                fontSize={'small'}
                color={grayColor}
                position={'absolute'}
                bottom={'-1.2rem'}
                right={me ? 14 : ''}
                left={!me ? 14 : ''}
                minWidth={'max-content'}
              >
                {format(message.createdAt)}
              </Text>
            )}
          </Text>
        )}
      </Flex>
    </Flex>
  );
};

export default TextMessage;
