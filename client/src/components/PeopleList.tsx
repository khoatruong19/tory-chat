import { Box } from '@chakra-ui/react';
import { User } from '../utils/types';
import PeopleCard from './PeopleCard';

interface IProps {
  users: User[];
}

const PeopleList = ({ users }: IProps) => {
  return (
    <Box mt={5}>
      {users && users.map((user) => <PeopleCard key={user.id} user={user} />)}
    </Box>
  );
};

export default PeopleList;
