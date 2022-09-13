import { Box, Flex, HStack, IconButton, Input, Text } from '@chakra-ui/react';
import React, { useState } from 'react';
import { GrEdit } from 'react-icons/gr';
import BoldText from './shared/BoldText';
import { FiCheck } from 'react-icons/fi';
import { IoMdClose } from 'react-icons/io';
import IconWithText from './shared/IconWithText';
import userApi from '../api/userApi';

interface IProps {
  label: string;
  value: string;
  updateUser: (value: string) => void;
}

const ProfileDetail = ({ label, value, updateUser }: IProps) => {
  const [edit, setEdit] = useState(false);
  const [infoValue, setInfoValue] = useState(value);

  const handleSaveInfo = async () => {
    if (infoValue.length === 0) {
      alert('This field cant be empty');
      setInfoValue(value);
      return;
    }

    updateUser(infoValue);
    setEdit(false);
  };

  return (
    <Box>
      <Flex gap={8} alignItems="center">
        <BoldText text={`${label}:`} fontSize="3xl" />

        {edit ? (
          <HStack gap={4}>
            +
            <Input
              value={infoValue}
              onChange={(e) => setInfoValue(e.target.value)}
            />
            <HStack gap={2} fontSize={'1.5rem'}>
              <IconWithText
                bgColor="green.300"
                bgHoverColor="green.200"
                handleClickFunction={handleSaveInfo}
                icon={<FiCheck />}
                text="Save"
                textBgColor="green.200"
              />
              <IconWithText
                bgColor="red.300"
                bgHoverColor="red.200"
                handleClickFunction={() => setEdit(false)}
                icon={<IoMdClose />}
                text="Close"
                textBgColor="red.200"
              />
            </HStack>
          </HStack>
        ) : (
          <>
            <Text fontSize={'2xl'} color="blue.300" fontWeight={'500'}>
              {infoValue}
            </Text>
            <IconButton
              onClick={() => setEdit(true)}
              aria-label=""
              icon={<GrEdit />}
            />
          </>
        )}
      </Flex>
    </Box>
  );
};

export default ProfileDetail;
