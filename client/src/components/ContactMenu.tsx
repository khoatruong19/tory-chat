import { Box } from '@chakra-ui/react';
import ChatList from './ChatList';
import SearchBar from './shared/SearchBar';
import { useState, useMemo } from 'react';
import { useAppSelector } from '../store';

const ContactMenu = () => {
  const friends = useAppSelector((state) => state.friend.friends);

  const [search, setSearch] = useState('');

  const filteredFriend = useMemo(() => {
    return friends.filter((f) =>
      (f.firstName + ' ' + f.lastName)
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [friends, search]);
  return (
    <Box>
      <SearchBar
        search={search}
        setSearch={setSearch}
        placeholder="Search contact"
      />
      <ChatList friends={filteredFriend} />
    </Box>
  );
};

export default ContactMenu;
