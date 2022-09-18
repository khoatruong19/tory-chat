import {
  Box,
  Button,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Spinner,
  Textarea,
} from '@chakra-ui/react';
import React, { useEffect, useState, useRef } from 'react';
import { BsEmojiSmile } from 'react-icons/bs';
import { FiSend } from 'react-icons/fi';
import { GrAttachment } from 'react-icons/gr';
import { useParams } from 'react-router-dom';
import messageApi from '../api/messageApi';
import { useSocketContext } from '../context/SocketContext';
import { useAppDispatch, useAppSelector } from '../store';
import {
  increaseUnseenMessagesCount,
  readAllMessage,
  updateConversation,
} from '../store/slices/friendSlice';
import {
  addMessage,
  deleteMessage,
  getMessagesByConversation,
} from '../store/slices/messageSlice';
import { blueColor, defaultLimit, defaultOffset } from '../utils/constants';
import { DeleteMessageEventPayload, MessageEventPayload } from '../utils/types';
import EmojiPicker from './EmojiPicker';
import MessagesContainer from './MessagesContainer';
import BoldText from './shared/BoldText';

const ChatBox = () => {
  const loadingFetchingMessages = useAppSelector(
    (state) => state.message.loading
  );
  const [message, setMessage] = useState('');
  const [openEmojiPicker, setOpenEmojiPicker] = useState(false);
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout>>();
  const [isTyping, setIsTyping] = useState(false);
  const [isRecipientTyping, setIsRecipientTyping] = useState(false);
  const [conversationNumbers, setConversationNumbers] = useState(0);
  const [uploadLoading, setUploadLoading] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const socket = useSocketContext();
  const dispatch = useAppDispatch();

  const { conversationId } = useParams();

  const handleSendMessage = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (!conversationId) return;
    setOpenEmojiPicker(false);
    try {
      const res = await messageApi.createMessage({
        requestId: Number(conversationId),
        content: message,
        seen: conversationNumbers > 1 ? true : false,
      });
      if (res && res.data) {
        dispatch(addMessage(res.data));
        dispatch(updateConversation(res.data.conversation));
      }
      setMessage('');
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddIcon = (icon: string) => {
    let cursorPosition = inputRef.current!.selectionStart as number;
    let textBeforeCursorPosition = message.substring(0, cursorPosition);
    let textAfterCursorPosition = message.substring(
      cursorPosition,
      message.length
    );
    setMessage(textBeforeCursorPosition + icon + textAfterCursorPosition);
  };

  const sendTypingStatus = () => {
    let id = parseInt(conversationId!);
    if (isTyping) {
      clearTimeout(timer);
      setTimer(
        setTimeout(() => {
          socket.emit('onTypingStop', { conversationId: id });
          setIsTyping(false);
        }, 2000)
      );
    } else {
      setIsTyping(true);
      socket.emit('onTypingStart', { conversationId: id });
    }
  };

  const handleEnterInput = async (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (e.key === 'Enter') await handleSendMessage();
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
    try {
      const res = await messageApi.createMessage({
        requestId: Number(conversationId),
        content: data.secure_url,
        seen: conversationNumbers > 1 ? true : false,
      });
      if (res && res.data) {
        dispatch(addMessage(res.data));
        dispatch(updateConversation(res.data.conversation));
      }
      setMessage('');
    } catch (error) {
      console.log(error);
    }
    setUploadLoading(false);
  };

  useEffect(() => {
    socket.on('onMessage', (payload: MessageEventPayload) => {
      dispatch(addMessage(payload));
      dispatch(updateConversation(payload.conversation));
      if (!payload.message.seen) {
        ('New message');
        dispatch(increaseUnseenMessagesCount(payload.conversation.id));
      }
    });
    socket.on('deleteMessage', (payload: DeleteMessageEventPayload) => {
      dispatch(deleteMessage(payload));
    });
    socket.on('onConversationNumbers', (payload: { count: number }) => {
      setConversationNumbers(payload.count);
    });

    return () => {
      socket.off('onMessage');
      socket.off('deleteMessage');
      socket.off('onConversationNumbers');
    };
  }, [socket]);

  useEffect(() => {
    if (conversationId) {
      dispatch(
        getMessagesByConversation({
          requestId: conversationId,
          limit: defaultLimit,
          offset: defaultOffset,
        })
      );
      socket.emit('onConversationJoin', { conversationId });
      socket.emit('onConversationNumbers', {
        conversationId: Number(conversationId!),
      });
    }
    socket.on('userJoin', () => {
      setConversationNumbers((prev) => prev + 1);
    });
    socket.on('userLeave', () => {
      setConversationNumbers((prev) => prev - 1);
    });

    socket.on('onTypingStart', (id: number) => {
      if (parseInt(conversationId!) === id) setIsRecipientTyping(true);
    });
    socket.on('onTypingStop', () => {
      setIsRecipientTyping(false);
    });

    return () => {
      socket.emit('onConversationLeave', { conversationId });
      socket.off('userJoin');
      socket.off('userLeave');
    };
  }, [conversationId]);

  useEffect(() => {
    if (conversationId) dispatch(readAllMessage(parseInt(conversationId!)));
    setIsRecipientTyping(false);
  }, [conversationId]);

  if (loadingFetchingMessages)
    return (
      <Flex w={'100%'} alignItems={'center'} justifyContent={'center'}>
        <Spinner color="blue.500" />
      </Flex>
    );

  return (
    <Flex
      bg={'gray.50'}
      p={10}
      pt={5}
      flex={2.5}
      flexDirection={'column'}
      textAlign={'center'}
    >
      {!conversationId ? (
        <BoldText text="Choose a conversation" fontSize="2xl" />
      ) : (
        <>
          <MessagesContainer
            isRecipientTyping={!isTyping && isRecipientTyping}
          />

          <Box flex={1} position={'relative'}>
            {uploadLoading && (
              <Box position={'absolute'} left={0} top={-5}>
                Uploading image...
              </Box>
            )}
            <form onSubmit={handleSendMessage}>
              <InputGroup>
                <InputLeftElement
                  children={
                    <Box
                      position={'relative'}
                      w={10}
                      h={10}
                      ml={2}
                      zIndex={999}
                    >
                      <GrAttachment
                        style={{
                          marginTop: '1.5rem',
                        }}
                      />
                      <Input
                        position={'absolute'}
                        left={0}
                        top={0}
                        w={'100%'}
                        h={'100%'}
                        opacity={0}
                        cursor={'pointer'}
                        type="file"
                        accept="image/*"
                        onChange={handleUploadImage}
                      />
                    </Box>
                  }
                />
                <Flex
                  width={'100%'}
                  height={'100%'}
                  alignItems={'center'}
                  justifyContent={'center'}
                >
                  <Textarea
                    onKeyPress={handleEnterInput}
                    ref={inputRef}
                    width={'100%'}
                    paddingLeft={8}
                    paddingY={5}
                    paddingRight={'6rem'}
                    mr={2}
                    size={'md'}
                    borderRadius={'xl'}
                    placeholder="Enter your message here.."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={sendTypingStatus}
                  />
                </Flex>
                <InputRightElement width="6rem" display={'flex'} gap={2}>
                  <Box
                    color={'gray'}
                    _hover={{ color: 'black' }}
                    position={'relative'}
                    onClick={() => setOpenEmojiPicker((prev) => !prev)}
                  >
                    <BsEmojiSmile
                      style={{
                        fontSize: '1.2rem',
                        marginTop: '1.8rem',
                        cursor: 'pointer',
                      }}
                    />
                  </Box>
                  <Button
                    h="3.5rem"
                    w={'3.5rem'}
                    borderRadius={'50%'}
                    p={3}
                    mt={8}
                    mr={4}
                    type="submit"
                    bg={message.length > 0 ? blueColor : ''}
                    color={message.length > 0 ? 'white' : 'gray'}
                    disabled={message.length === 0}
                  >
                    <FiSend style={{ fontSize: '2rem' }} />
                  </Button>
                </InputRightElement>
              </InputGroup>
            </form>
            <EmojiPicker open={openEmojiPicker} selectIcon={handleAddIcon} />
          </Box>
        </>
      )}
    </Flex>
  );
};

export default ChatBox;
