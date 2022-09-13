import { Box, Button, Flex, HStack } from '@chakra-ui/react';
import React, { useState, useMemo, useEffect } from 'react';
import { activeStyle, blueColor } from '../utils/constants';
import BoldText from './shared/BoldText';
import { GoChevronUp, GoChevronDown } from 'react-icons/go';
import MessageCard from './MessageCard';
import { useAppDispatch, useAppSelector } from '../store';
import { Link, useParams } from 'react-router-dom';
import { UserWithRequestId } from '../utils/types';
import { useSocketContext } from '../context/SocketContext';
import {
  addOnlineIds,
  readAllMessage,
  setOnlineIds,
} from '../store/slices/friendSlice';
import messageApi from '../api/messageApi';

interface IProps {
  friends: UserWithRequestId[];
}

const ChatList = ({ friends }: IProps) => {
  const [onlineMore, setOnlineMore] = useState(true);
  const [offlineMore, setOfflineMore] = useState(true);
  const socket = useSocketContext();
  const dispatch = useAppDispatch();
  const onlineFriendIds = useAppSelector((state) => state.friend.onlineIds);
  const [onlineFriends, setOnlineFriends] = useState<UserWithRequestId[]>([]);
  const [offlineFriends, setOfflineFriends] = useState<UserWithRequestId[]>([]);

  const handleUpdateUnseenMessages = async (requestId: number) => {
    try {
      await messageApi.updateUnseenMessages(requestId);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    socket.on('getOnlineFriends', (onlineFriendIds: number[]) => {
      if (onlineFriendIds && onlineFriendIds.length > 0)
        dispatch(setOnlineIds(onlineFriendIds));
    });
    socket.on('updateOnlineFriends', (id: number) => {
      if (!onlineFriendIds.find((userId) => userId === id))
        dispatch(addOnlineIds(id));
    });
    return () => {
      socket.off('getOnlineFriends');
      socket.off('updateOnlineFriends');
    };
  }, [socket]);

  useEffect(() => {
    let onlineFriendsArr: UserWithRequestId[] = [];
    let offlineFriendsArr: UserWithRequestId[] = [];
    friends.map((f) => {
      if (onlineFriendIds.includes(f.id)) onlineFriendsArr.push(f);
      else offlineFriendsArr.push(f);
    });
    setOnlineFriends(onlineFriendsArr);
    setOfflineFriends(offlineFriendsArr);
  }, [friends, onlineFriendIds]);

  return (
    <Box w="100%" mt={5}>
      <Flex alignItems="center" justifyContent={'space-between'} mb={5}>
        <HStack spacing={3}>
          <BoldText fontSize="lg" text="Active" />
          <Box
            w={6}
            h={6}
            borderRadius={'50%'}
            bg={blueColor}
            display={'flex'}
            alignItems={'center'}
            justifyContent={'center'}
            color={'white'}
          >
            {onlineFriends.length}
          </Box>
        </HStack>

        <Button onClick={() => setOnlineMore((prev) => !prev)} w={6}>
          {onlineMore ? <GoChevronUp /> : <GoChevronDown />}
        </Button>
      </Flex>

      {onlineMore && (
        <Box>
          {onlineFriends &&
            onlineFriends.map((friend) => (
              <Link
                onClick={() => handleUpdateUnseenMessages(friend.requestId)}
                key={friend.id}
                to={`/${friend.requestId}`}
              >
                <MessageCard
                  unseenMessagesCount={friend.unseenMessagesCount}
                  lastMessage={friend.lastMessage?.content}
                  user={friend}
                  conversationId={friend.requestId}
                />
              </Link>
            ))}
        </Box>
      )}

      <Flex alignItems="center" justifyContent={'space-between'} mb={5}>
        <HStack spacing={3}>
          <BoldText fontSize="lg" text="Offline" />
          <Box
            w={6}
            h={6}
            borderRadius={'50%'}
            bg={blueColor}
            display={'flex'}
            alignItems={'center'}
            justifyContent={'center'}
            color={'white'}
          >
            {offlineFriends.length}
          </Box>
        </HStack>
        <Button onClick={() => setOfflineMore((prev) => !prev)} w={6}>
          {offlineMore ? <GoChevronUp /> : <GoChevronDown />}
        </Button>
      </Flex>

      {offlineMore && (
        <Box>
          {offlineFriends &&
            offlineFriends.map((friend) => (
              <Link
                onClick={() => handleUpdateUnseenMessages(friend.requestId)}
                key={friend.id}
                to={`/${friend.requestId}`}
              >
                <MessageCard
                  unseenMessagesCount={friend.unseenMessagesCount}
                  lastMessage={friend.lastMessage?.content}
                  user={friend}
                  conversationId={friend.requestId}
                />
              </Link>
            ))}
        </Box>
      )}
    </Box>
  );
};

export default ChatList;
