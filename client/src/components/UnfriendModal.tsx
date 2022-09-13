import React from 'react';
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
  useToast,
} from '@chakra-ui/react';
import friendApi from '../api/friendApi';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch } from '../store';
import { getFriends } from '../store/slices/friendSlice';

interface IProps {
  setStatus: Function;
  requestId: number;
  open: boolean;
  setOpen: Function;
}

const UnfriendModal = ({ requestId, setStatus, open, setOpen }: IProps) => {
  const toast = useToast();
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const onClose = () => {
    setOpen(false);
  };

  const handleUnfriend = async () => {
    try {
      const res = await friendApi.unfriend(requestId);
      if (res && res.data) {
        if (parseInt(conversationId!) === requestId) navigate('/');
        toast({
          title: 'Unfriend successfully',
          status: 'success',
          duration: 4000,
          isClosable: true,
        });
        await dispatch(getFriends());
      }
      setStatus(null);
      onClose();
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <Modal blockScrollOnMount={false} isOpen={open} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Unfriend Confirmation</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          If you unfriend, the data of the conversation between you guys will be
          deleted. Are you sure?
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            Close
          </Button>
          <Button variant="solid" colorScheme={'red'} onClick={handleUnfriend}>
            Unfriend
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UnfriendModal;
