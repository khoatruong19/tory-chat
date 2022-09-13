import { Box } from '@chakra-ui/react';
import { useEffect } from 'react';
import ChatBox from '../components/ChatBox';
import Menu from '../components/Menu';
import OtherActivities from '../components/OtherActivities';
import { useAuthContext } from '../context/AuthContext';
import { useSocketContext } from '../context/SocketContext';

const Home = () => {
  const { user } = useAuthContext();
  const socket = useSocketContext();

  useEffect(() => {
    socket.emit('addUser', { userId: user.id });

    socket.on('disconnected', () => {
      socket.disconnect();
    });

    return () => {
      socket.off('connected');
      socket.off('disconnected');
      socket.off('addUser');
    };
  }, []);

  return (
    <Box w="100%" display={'flex'} h={'100vh'}>
      <Menu />
      <ChatBox />
      <OtherActivities />
    </Box>
  );
};

export default Home;
