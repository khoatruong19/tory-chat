import { InputGroup, InputLeftElement, Input } from '@chakra-ui/react';
import React from 'react';
import { BiSearch } from 'react-icons/bi';
import { grayColor } from '../../utils/constants';

interface IProps {
  search: string;
  setSearch: Function;
  placeholder: string;
}

const SearchBar = ({ placeholder, search, setSearch }: IProps) => {
  return (
    <InputGroup mt={5} size="md">
      <InputLeftElement
        pointerEvents="none"
        children={<BiSearch size={20} color={grayColor} />}
      />
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        type="tel"
        placeholder={placeholder}
        borderWidth={2}
        borderRadius={10}
      />
    </InputGroup>
  );
};

export default SearchBar;
