import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  HStack,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { GoChevronDown, GoChevronUp } from 'react-icons/go';
import { IoNotificationsOutline } from 'react-icons/io5';
import { useNavigate, useParams } from 'react-router-dom';
import friendApi from '../api/friendApi';
import { useSocketContext } from '../context/SocketContext';
import { useAppDispatch, useAppSelector } from '../store';
import {
  addFriendRequest,
  removeRequest,
  getFriends,
  setFriendRequests,
  setSentRequests,
  removeFriend,
} from '../store/slices/friendSlice';
import { Friendship } from '../utils/types';
import ReceivedRequestCard from './ReceivedRequestCard';
import SentRequestCard from './SentRequestCard';
import BoldText from './shared/BoldText';
import NumberBadge from './shared/NumberBadge';

const Notification = () => {
  const socket = useSocketContext();
  const toast = useToast();
  const dispatch = useAppDispatch();
  const { friendRequests, sentRequests } = useAppSelector(
    (state) => state.friend
  );
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [openSentRequest, setOpenSentRequest] = useState(false);
  const [openReceivedRequest, setOpenReceivedRequest] = useState(false);
  const btnRef = React.useRef<HTMLDivElement>(null);
  const { conversationId } = useParams();
  const navigate = useNavigate();

  const handleAcceptRequest = async (id: number) => {
    try {
      const res = await friendApi.acceptRequest(id);
      if (res && res.data) {
        toast({
          title: res.data.message,
          status: 'success',
          duration: 4000,
          isClosable: true,
        });
        let newFriendRequests = friendRequests.filter(
          (request) => request.id !== id
        );
        dispatch(setFriendRequests(newFriendRequests));
        dispatch(getFriends());
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleCancelRequest = async (type: 'receive' | 'send', id: number) => {
    try {
      const res = await friendApi.cancelRequest(id);
      if (res && res.data) {
        toast({
          title: res.data.message,
          status: 'success',
          duration: 4000,
          isClosable: true,
        });

        if (type === 'receive') {
          let newFriendRequests = friendRequests.filter(
            (request) => request.id !== id
          );
          dispatch(setFriendRequests(newFriendRequests));
        } else {
          let newSentRequests = sentRequests.filter(
            (request) => request.id !== id
          );
          dispatch(setSentRequests(newSentRequests));
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    socket.on('receiveRequest', (request: Friendship) => {
      dispatch(addFriendRequest(request));
    });

    socket.on(
      'cancelRequest',
      ({
        requestId,
        type,
        receiverCanceller,
      }: {
        requestId: number;
        type: 'sender' | 'receiver';
        receiverCanceller: string;
      }) => {
        dispatch(removeRequest({ requestId, type }));
        if (type === 'sender') {
          toast({
            title: `${receiverCanceller} doesnt accept your request!`,
            status: 'warning',
            duration: 4000,
            isClosable: true,
          });
        }
      }
    );

    socket.on(
      'acceptRequest',
      ({
        receiverName,
        requestId,
      }: {
        receiverName: string;
        requestId: number;
      }) => {
        toast({
          title: `${receiverName} accepted your request!`,
          status: 'success',
          duration: 4000,
          isClosable: true,
        });
        dispatch(removeRequest({ requestId, type: 'sender' }));
        dispatch(getFriends());
      }
    );

    socket.on('unfriend', ({ requestId }: { requestId: number }) => {
      dispatch(removeFriend(requestId));
      if (parseInt(window.location.pathname.split('/')[1]!) === requestId)
        navigate('/');
    });

    return () => {
      socket.off('receiveRequest');
      socket.off('cancelRequest');
      socket.off('acceptRequest');
      socket.off('unfriend');
    };
  }, [socket]);

  console.log();

  return (
    <>
      <Box
        cursor={'pointer'}
        color={'gray.300'}
        fontSize={28}
        _hover={{ color: 'gray.600' }}
        position={'relative'}
        ref={btnRef}
        onClick={onOpen}
        zIndex={1}
      >
        <IoNotificationsOutline />
        {friendRequests.length + sentRequests.length > 0 && (
          <NumberBadge
            right={-1.5}
            bottom={0}
            figure={friendRequests.length + sentRequests.length}
          />
        )}
      </Box>
      <Drawer
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        finalFocusRef={btnRef}
        size="sm"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader fontSize={30} textAlign="center">
            Notifications
          </DrawerHeader>

          <DrawerBody>
            <Box mb={5}>
              <Flex alignItems="center" justifyContent={'space-between'} mb={5}>
                <HStack spacing={3} position={'relative'}>
                  <BoldText fontSize="lg" text="Sent Requests" />
                  {sentRequests.length > 0 && (
                    <NumberBadge
                      right={-5}
                      bottom={1}
                      figure={sentRequests.length}
                    />
                  )}
                </HStack>

                <Button
                  onClick={() => setOpenSentRequest((prev) => !prev)}
                  w={6}
                >
                  {openSentRequest ? <GoChevronUp /> : <GoChevronDown />}
                </Button>
              </Flex>

              {openSentRequest && (
                <Box>
                  {sentRequests.map((request) => (
                    <SentRequestCard
                      key={request.id}
                      id={request.id}
                      receiver={request.receiver}
                      receiverImage={request.receiverImage}
                      handleCancelRequest={handleCancelRequest}
                    />
                  ))}
                </Box>
              )}
            </Box>

            <Box>
              <Flex alignItems="center" justifyContent={'space-between'} mb={5}>
                <HStack spacing={3} position={'relative'}>
                  <BoldText fontSize="lg" text="Friend Requests" />
                  {friendRequests.length > 0 && (
                    <NumberBadge
                      right={-5}
                      bottom={1}
                      figure={friendRequests.length}
                    />
                  )}
                </HStack>

                <Button
                  onClick={() => setOpenReceivedRequest((prev) => !prev)}
                  w={6}
                >
                  {openReceivedRequest ? <GoChevronUp /> : <GoChevronDown />}
                </Button>
              </Flex>

              {openReceivedRequest && (
                <Box>
                  {friendRequests.map((request) => (
                    <ReceivedRequestCard
                      key={request.id}
                      id={request.id}
                      sender={request.sender}
                      senderImage={request.senderImage}
                      handleAcceptRequest={handleAcceptRequest}
                      handleCancelRequest={handleCancelRequest}
                    />
                  ))}
                </Box>
              )}
            </Box>
          </DrawerBody>

          <DrawerFooter></DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default Notification;
