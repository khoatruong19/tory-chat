import { Box, Flex, HStack, Text, useToast, VStack } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { AiOutlineUserAdd } from 'react-icons/ai';
import { BiCheck } from 'react-icons/bi';
import { RiUserUnfollowLine } from 'react-icons/ri';
import { useNavigate, useParams } from 'react-router-dom';
import friendApi from '../api/friendApi';
import { useAuthContext } from '../context/AuthContext';
import { useSocketContext } from '../context/SocketContext';
import { useAppDispatch, useAppSelector } from '../store';
import {
  getFriends,
  removeFriend,
  setFriendRequests,
  setSentRequests,
} from '../store/slices/friendSlice';
import { blueColor, grayColor } from '../utils/constants';
import { isInFriendRequests, isInSentRequests } from '../utils/friend';
import { formatFullname } from '../utils/helper';
import { User } from '../utils/types';
import BoldText from './shared/BoldText';
import IconWithText from './shared/IconWithText';
import UserAvatar from './shared/UserAvatar';
import UnfriendModal from './UnfriendModal';

interface IProps {
  user: User;
}

const colorByStatus = {
  friend: 'red.300',
  receiver: 'red.300',
};

const PeopleCard = ({ user }: IProps) => {
  const socket = useSocketContext();
  const toast = useToast();
  const dispatch = useAppDispatch();
  const { friends, friendRequests, sentRequests } = useAppSelector(
    (state) => state.friend
  );
  const { user: me } = useAuthContext();
  const [status, setStatus] = useState<'sender' | 'receiver' | 'friend' | null>(
    null
  );
  const [requestId, setRequestId] = useState<number | null>(null);
  const [openModal, setOpenModal] = useState(false);

  const handleSendRequest = async () => {
    try {
      const res = await friendApi.sendRequest({
        receiver: formatFullname(user.firstName, user.lastName),
        receiverId: user.id,
        receiverImage: user.image,
      });
      if (res && res.data) {
        let newSentRequests = [...sentRequests, res.data];
        dispatch(setSentRequests(newSentRequests));
        setStatus('receiver');
        setRequestId(res.data.id);
      }
    } catch (error) {
      console.log(error);
    }
  };

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

  const checkRelationshipStatus = () => {
    const isFriend = friends.find((item) => item.id === user.id);
    if (isFriend) {
      setStatus('friend');
      setRequestId(isFriend.requestId);
      return;
    } else {
      let sender = isInFriendRequests(me.id, user.id, friendRequests);
      if (sender) {
        setStatus('sender');
        setRequestId(sender.id);
        return;
      }
      let receiver = isInSentRequests(me.id, user.id, sentRequests);
      if (receiver) {
        setStatus('receiver');
        setRequestId(receiver.id);
        return;
      } else setStatus(null);
    }
  };

  useEffect(() => {
    checkRelationshipStatus();
  }, [friends, sentRequests, friendRequests]);

  useEffect(() => {
    socket.on('unfriend', ({ requestId }: { requestId: number }) => {
      dispatch(removeFriend(requestId));
    });

    return () => {
      socket.off('unfriend');
    };
  }, [socket]);

  const showButtons = () => {
    if (status === null)
      return (
        <IconWithText
          bgColor="gray.200"
          bgHoverColor={blueColor}
          handleClickFunction={handleSendRequest}
          icon={<AiOutlineUserAdd />}
          text="Add friend"
          textBgColor={blueColor}
        />
      );
    else if (status === 'friend')
      return (
        <IconWithText
          bgColor="red.200"
          bgHoverColor="red.400"
          handleClickFunction={() => setOpenModal(true)}
          icon={<RiUserUnfollowLine />}
          text="Unfriend"
          textBgColor={'red.400'}
        />
      );
    else if (status === 'receiver')
      return (
        <IconWithText
          bgColor="red.200"
          bgHoverColor="red.400"
          handleClickFunction={() =>
            handleCancelRequest('send', requestId as number)
          }
          icon={<RiUserUnfollowLine />}
          text="Cancel"
          textBgColor={'red.400'}
        />
      );
    else
      return (
        <HStack spacing={2}>
          <IconWithText
            bgColor="green.200"
            bgHoverColor="green.400"
            handleClickFunction={() => handleAcceptRequest(requestId as number)}
            icon={<AiOutlineUserAdd />}
            text="Accept"
            textBgColor="green.400"
          />

          <IconWithText
            bgColor="red.200"
            bgHoverColor="red.400"
            handleClickFunction={() =>
              handleCancelRequest('receive', requestId as number)
            }
            icon={<RiUserUnfollowLine />}
            text="Cancel"
            textBgColor={'red.400'}
          />
        </HStack>
      );
  };

  return (
    <Flex
      cursor={'pointer'}
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
            {user.description}
          </Text>
        </Box>
      </HStack>

      <VStack spacing={1} alignItems={'flex-end'}>
        {status === 'receiver' && (
          <Text fontSize={12} color={blueColor}>
            Waiting response
          </Text>
        )}
        {status === 'sender' && (
          <Text fontSize={12} color={blueColor}>
            Response
          </Text>
        )}
        {status === 'friend' && (
          <HStack spacing={0.5} color={blueColor}>
            <Text fontSize={13}>Friend</Text>
            <BiCheck />
          </HStack>
        )}
        {showButtons()}
      </VStack>
      <UnfriendModal
        open={openModal}
        setOpen={setOpenModal}
        setStatus={setStatus}
        requestId={requestId as number}
      />
    </Flex>
  );
};

export default PeopleCard;
