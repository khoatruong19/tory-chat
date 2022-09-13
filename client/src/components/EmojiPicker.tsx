import React, { useState } from 'react';
import Picker, { IEmojiData, SKIN_TONE_MEDIUM_DARK } from 'emoji-picker-react';
import { Box } from '@chakra-ui/react';

interface IProps {
  open: boolean;
  selectIcon: (icon: string) => void;
}
const EmojiPicker = ({ selectIcon, open }: IProps) => {
  const onEmojiClick = (
    _event: React.MouseEvent<Element>,
    data: IEmojiData
  ) => {
    selectIcon(data.emoji);
  };
  return (
    <Box position={'absolute'} bottom={'100%'} right={0}>
      {open && (
        <Box>
          <Picker
            onEmojiClick={onEmojiClick}
            disableAutoFocus={true}
            skinTone={SKIN_TONE_MEDIUM_DARK}
            groupNames={{ smileys_people: 'PEOPLE' }}
            native
          />
        </Box>
      )}
    </Box>
  );
};

export default EmojiPicker;
