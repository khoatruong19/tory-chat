import { Box, Flex, Spinner, Text } from '@chakra-ui/react';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import messageApi from '../api/messageApi';
import { useAuthContext } from '../context/AuthContext';
import { RootState, useAppDispatch } from '../store';
import {
  fetchMoreMessages,
  selectConversationMessage,
} from '../store/slices/messageSlice';
import TextMessage from './TextMessage';
import Typing from './Typing';
import InfiniteScroll from 'react-infinite-scroll-component';
import LoadingSpinner from './LoadingSpinner';
import { defaultLimit } from '../utils/constants';

interface IProps {
  isRecipientTyping: boolean;
}

const MessagesContainer = ({ isRecipientTyping }: IProps) => {
  const { user } = useAuthContext();
  const { conversationId } = useParams();
  const [limit, setLimit] = useState(defaultLimit + 10);
  const [offset, setOffset] = useState(defaultLimit);
  const [hasMore, setHasMore] = useState(true);

  const dispatch = useAppDispatch();
  const conversationMessages = useSelector((state: RootState) =>
    selectConversationMessage(state, parseInt(conversationId!))
  );

  const fetchMoreData = async () => {
    console.log('asdasd');
    try {
      const res = await messageApi.getMessagesByConversationId(
        conversationId!,
        limit,
        offset
      );
      if (res && res.data) {
        console.log('>>check new data, ', res.data);
        dispatch(fetchMoreMessages(res.data));
        if (res.data.messages.length === 0 || res.data.messages.length < 10)
          setHasMore(false);
        else {
          setLimit((prev) => prev + 10);
          setOffset((prev) => prev + 10);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (!conversationMessages)
    return (
      <Flex w={'100%'} alignItems={'center'} justifyContent={'center'}>
        <Spinner color="blue.500" />
      </Flex>
    );

  return (
    <Box
      flex={10}
      display={'flex'}
      flexDirection={'column-reverse'}
      height={'90vh'}
      pb={6}
      boxSizing={'border-box'}
      mb={10}
      overflowY={'scroll'}
      id="scrollableDiv"
    >
      {isRecipientTyping && (
        <Flex justifyContent={'flex-start'}>
          <Typing />
        </Flex>
      )}
      {conversationMessages.messages.length === 0 ? (
        <Text color={'blue.300'}>Say hello to your friend ✌️</Text>
      ) : (
        <InfiniteScroll
          dataLength={conversationMessages.messages.length} //This is important field to render the next data
          next={fetchMoreData}
          hasMore={hasMore}
          loader={<Text color={'blue.300'}>Loading</Text>}
          style={{ display: 'flex', flexDirection: 'column-reverse' }}
          inverse={true}
          scrollableTarget="scrollableDiv"
          endMessage={<Text fontWeight={600}>No more messages!</Text>}
        >
          {conversationMessages &&
            conversationMessages?.messages.length > 0 &&
            conversationMessages?.messages.map((message, i) => (
              <TextMessage
                key={i}
                message={message}
                me={message.author.id === user.id}
                continuous={
                  conversationMessages?.messages[i - 1] &&
                  conversationMessages?.messages[i - 1].author.id ===
                    message.author.id
                }
                showTime={
                  i === 0 ||
                  conversationMessages?.messages[i - 1].author.id !==
                    message.author.id
                }
              />
            ))}
        </InfiniteScroll>
      )}
    </Box>
  );
};

export default MessagesContainer;
