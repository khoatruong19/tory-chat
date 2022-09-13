import {
  Box,
  Button,
  Container,
  Flex,
  HStack,
  Input,
  InputGroup,
  InputRightElement,
  Switch,
  Text,
} from '@chakra-ui/react';
import React, { useEffect, useRef, useState } from 'react';
import { AiOutlineSend } from 'react-icons/ai';
import { BsPersonCircle } from 'react-icons/bs';
import { FiMail } from 'react-icons/fi';
import { GoChevronDown, GoChevronUp } from 'react-icons/go';
import { RiUserUnfollowLine } from 'react-icons/ri';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { RootState, useAppSelector } from '../store';
import { selectFriendInfo } from '../store/slices/friendSlice';
import EmojiPicker from './EmojiPicker';
import BoldText from './shared/BoldText';
import IconWithText from './shared/IconWithText';
import PaddingWrapper from './shared/PaddingWrapper';
import UserAvatar from './shared/UserAvatar';
import UnfriendModal from './UnfriendModal';

const OtherActivities = () => {
  const { conversationId } = useParams();
  const onlineIds = useAppSelector((state) => state.friend.onlineIds);
  const friendInfo = useSelector((state: RootState) =>
    selectFriendInfo(state, parseInt(conversationId!))
  );
  const [openPersonalDetail, setOpenPersonalDetail] = useState(false);
  const [openNote, setOpenNote] = useState(false);
  const [noteList, setNoteList] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const noteRef = useRef<HTMLParagraphElement>(null);

  const handleAddNote = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (note.length > 0) setNoteList((prev) => [...prev, note]);
    setNote('');
  };

  useEffect(() => {
    noteRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [noteList]);

  if (!friendInfo) return null;

  return (
    <Box flex={1}>
      <PaddingWrapper>
        <Box>
          <Flex alignItems="center" justifyContent={'space-between'} mb={5}>
            <HStack spacing={3}>
              <BoldText fontSize="lg" text="Prospect Details" />
            </HStack>

            <Button
              onClick={() => setOpenPersonalDetail((prev) => !prev)}
              w={6}
            >
              {openPersonalDetail ? <GoChevronUp /> : <GoChevronDown />}
            </Button>
          </Flex>

          <Flex
            pb={10}
            gap={4}
            alignItems="center"
            borderBottom={'1px'}
            borderColor={'gray.200'}
          >
            <UserAvatar
              image={friendInfo.image}
              firstName={friendInfo.firstName}
              lastName={friendInfo.lastName}
            />
            <Box>
              <Flex color={'gray.500'} alignItems="center" gap={2} mb={1}>
                <BsPersonCircle />
                <Text fontSize={14}>
                  {friendInfo.lastName} {friendInfo.firstName}
                </Text>
              </Flex>
              <Flex color={'gray.500'} alignItems="center" gap={2} mb={1}>
                <FiMail />
                <Text fontSize={14}>{friendInfo.email}</Text>
              </Flex>
              <Switch
                colorScheme="red"
                size="md"
                isChecked={onlineIds.includes(friendInfo.id)}
              />
            </Box>
            <IconWithText
              bgColor="red.200"
              bgHoverColor="red.400"
              handleClickFunction={() => setOpenModal(true)}
              icon={<RiUserUnfollowLine />}
              text="Unfriend"
              textBgColor={'red.400'}
            />
          </Flex>
        </Box>

        <Box mt={10}>
          <Flex alignItems="center" justifyContent={'space-between'} mb={5}>
            <HStack spacing={3}>
              <BoldText fontSize="lg" text="Notes" />
            </HStack>

            <Button onClick={() => setOpenNote((prev) => !prev)} w={6}>
              {openNote ? <GoChevronUp /> : <GoChevronDown />}
            </Button>
          </Flex>

          <Container
            p={4}
            h={240}
            overflowY="scroll"
            bg={'gray.50'}
            borderRadius={10}
          >
            {noteList.map((text, i) => (
              <Text
                ref={i === noteList.length - 1 ? noteRef : undefined}
                lineHeight={0.8}
                wordBreak={'break-all'}
                mb={3}
                color="gray.500"
              >
                {text}
              </Text>
            ))}
          </Container>

          <form onSubmit={handleAddNote}>
            <InputGroup size="lg" mt={3}>
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                fontSize={16}
                type="text"
                placeholder="Enter your note"
              />
              <InputRightElement>
                <Button
                  type="submit"
                  h="2.5rem"
                  size="sm"
                  bg={'#000'}
                  color="white"
                >
                  <AiOutlineSend />
                </Button>
              </InputRightElement>
            </InputGroup>
          </form>
        </Box>
      </PaddingWrapper>
      <UnfriendModal
        open={openModal}
        setOpen={setOpenModal}
        setStatus={() => {}}
        requestId={friendInfo.requestId}
      />
    </Box>
  );
};

export default OtherActivities;
