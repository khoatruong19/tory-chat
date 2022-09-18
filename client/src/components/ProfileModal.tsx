import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Button,
  Box,
  Text,
  HStack,
  Flex,
  IconButton,
  useToast,
  Input,
} from '@chakra-ui/react';
import { blueColor } from '../utils/constants';
import BoldText from './shared/BoldText';
import { useAuthContext } from '../context/AuthContext';
import UserAvatar from './shared/UserAvatar';
import { GrEdit } from 'react-icons/gr';
import ProfileDetail from './ProfileDetail';
import userApi from '../api/userApi';
import { UpdateUserInput, User } from '../utils/types';

const ProfileModal = () => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user, setUser } = useAuthContext();

  const [uploadLoading, setUploadLoading] = useState(false);

  const handleUpdateUser = async (info: UpdateUserInput) => {
    try {
      const res = await userApi.updateUser(info);
      if (res && res.data) {
        toast({
          title: res.data.message,
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
        setUser({ ...user, [info.field]: info.value });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadLoading(true);
    const formData = new FormData();
    formData.append('file', (e.target.files as FileList)[0]);
    formData.append('upload_preset', 'uploadTaskly');
    const data = await fetch(process.env.REACT_APP_IMAGE_UPLOAD_URL as string, {
      method: 'POST',
      body: formData,
    }).then((res) => res.json());
    handleUpdateUser({ field: 'image', value: data.secure_url });
    setUploadLoading(false);
  };
  return (
    <>
      <Button
        bg={'transparent'}
        w="100%"
        _hover={{ color: blueColor, bg: 'white' }}
        onClick={onOpen}
      >
        Profile
      </Button>
      <Modal isOpen={isOpen} onClose={onClose} size={'2xl'}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader textAlign={'center'}>
            <BoldText text="Profile" fontSize="5xl" />
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Flex gap={4} flexDirection={'column'}>
              <ProfileDetail
                updateUser={(value) =>
                  handleUpdateUser({ field: 'firstName', value })
                }
                label="First name"
                value={user.firstName}
              />

              <ProfileDetail
                updateUser={(value) =>
                  handleUpdateUser({ field: 'lastName', value })
                }
                label="Last name"
                value={user.lastName}
              />

              <ProfileDetail
                updateUser={(value) =>
                  handleUpdateUser({ field: 'email', value })
                }
                label="Email"
                value={user.email}
              />

              <Flex gap={8} alignItems="center">
                <BoldText text="Avatar:" fontSize="3xl" />
                {uploadLoading ? (
                  <Text color={blueColor}>Waiting...</Text>
                ) : (
                  <UserAvatar
                    firstName={user.firstName}
                    lastName={user.lastName}
                    image={user.image}
                  />
                )}

                <Box position={'relative'} w={10} h={10}>
                  <IconButton
                    w={'100%'}
                    h={'100%'}
                    aria-label=""
                    icon={<GrEdit />}
                  />
                  <Input
                    position={'absolute'}
                    left={0}
                    top={0}
                    w={'100%'}
                    h={'100%'}
                    opacity={0}
                    type="file"
                    onChange={handleUploadImage}
                  />
                </Box>
              </Flex>
            </Flex>
          </ModalBody>

          <ModalFooter></ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProfileModal;
