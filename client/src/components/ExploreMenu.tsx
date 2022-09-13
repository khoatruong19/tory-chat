import { Box } from '@chakra-ui/react';
import { useState, useMemo, useEffect } from 'react';
import userApi from '../api/userApi';
import { User } from '../utils/types';
import PeopleList from './PeopleList';
import SearchBar from './shared/SearchBar';

const ExploreMenu = () => {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<User[]>([]);

  const filteredPeople = useMemo(() => {
    return users.filter((f) =>
      (f.firstName + ' ' + f.lastName)
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [users, search]);

  useEffect(() => {
    const getAllUsers = async () => {
      try {
        const res = await userApi.getAllUsers();
        setUsers(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    getAllUsers();
  }, []);

  return (
    <Box>
      <SearchBar
        search={search}
        setSearch={setSearch}
        placeholder="Search people"
      />
      <PeopleList users={filteredPeople} />
    </Box>
  );
};

export default ExploreMenu;
