import { Box, Button, Flex, HStack, Switch, Tag, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { FiSettings } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import authApi from '../api/authApi';
import friendApi from '../api/friendApi';
import { useAuthContext } from '../context/AuthContext';
import { useSocketContext } from '../context/SocketContext';
import { useAppDispatch } from '../store';
import {
  getFriends,
  setFriendRequests,
  setSentRequests,
} from '../store/slices/friendSlice';
import { blackColor, grayColor, redColor } from '../utils/constants';
import { formatFullname } from '../utils/helper';
import ContactMenu from './ContactMenu';
import ExploreMenu from './ExploreMenu';
import Notification from './Notification';
import ProfileModal from './ProfileModal';
import BoldText from './shared/BoldText';
import Logo from './shared/Logo';
import PaddingWrapper from './shared/PaddingWrapper';
import UserAvatar from './shared/UserAvatar';

const Menu = () => {
  const dispatch = useAppDispatch();
  const socket = useSocketContext();
  const { user, logoutClient } = useAuthContext();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'contact' | 'explore'>('contact');
  const [openUserSetting, setOpenUserSetting] = useState(false);

  const logoutUser = async () => {
    authApi.logout().then(() => {
      logoutClient();
      navigate('/login');
      socket.emit('logout');
    });
  };

  useEffect(() => {
    dispatch(getFriends());
    const getAllRequests = async () => {
      try {
        const res = await friendApi.getAllRequests();
        if (res && res.data) {
          dispatch(
            setSentRequests(
              res.data.filter((request) => request.senderId === user.id)
            )
          );
          dispatch(
            setFriendRequests(
              res.data.filter((request) => request.senderId !== user.id)
            )
          );
        }
      } catch (error) {
        console.log(error);
      }
    };
    getAllRequests();
  }, []);

  return (
    <Box flex={1} borderRight="1px" borderColor="blackAlpha.100">
      <PaddingWrapper>
        <Logo />
        <HStack spacing={5}>
          <UserAvatar
            image={user.image}
            firstName={user.firstName}
            lastName={user.lastName}
          />

          <Box flex={1}>
            <BoldText text={formatFullname(user.firstName, user.lastName)} />
            <Text color={grayColor} fontSize="md" fontWeight={400}>
              {user.description}
            </Text>
            <HStack spacing={2} mt={2}>
              <Switch colorScheme="green" size="md" isChecked />
              <Text color={grayColor} fontSize="sm" fontWeight={400}>
                Active
              </Text>
            </HStack>
          </Box>

          <Box
            color={grayColor}
            _hover={{
              '&>svg': {
                color: blackColor,
              },
            }}
            cursor={'pointer'}
            position={'relative'}
          >
            <FiSettings
              onClick={() => setOpenUserSetting((prev) => !prev)}
              size={25}
            />
            {openUserSetting && (
              <Box
                width={'6rem'}
                position={'absolute'}
                bottom={'-5.5rem'}
                left={'-4.5rem'}
                boxShadow="xl"
                bgColor={'gray.50'}
                borderRadius={10}
                zIndex={99}
              >
                <ProfileModal />

                <Button
                  bg={'transparent'}
                  w="100%"
                  _hover={{ color: redColor, bg: 'white' }}
                  onClick={logoutUser}
                >
                  Logout
                </Button>
              </Box>
            )}
          </Box>
        </HStack>

        <Flex mt={10} alignItems={'center'} justifyContent={'space-between'}>
          <HStack spacing={2}>
            <Tag
              size={mode === 'contact' ? 'lg' : 'md'}
              colorScheme={mode === 'contact' ? 'blue' : 'gray'}
              cursor={'pointer'}
              color={mode === 'contact' ? 'black' : 'gray'}
              onClick={() => setMode('contact')}
            >
              Contact
            </Tag>
            <Tag
              colorScheme={mode === 'explore' ? 'green' : 'gray'}
              color={mode === 'explore' ? 'black' : 'gray'}
              size={mode === 'explore' ? 'lg' : 'md'}
              cursor={'pointer'}
              onClick={() => setMode('explore')}
            >
              Explore
            </Tag>
          </HStack>
          <Notification />
        </Flex>
        {mode === 'contact' ? <ContactMenu /> : <ExploreMenu />}
      </PaddingWrapper>
    </Box>
  );
};

export default Menu;
