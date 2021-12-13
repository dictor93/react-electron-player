import React, { useRef } from 'react'
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
} from '@mui/material'
import { makeStyles } from '@mui/styles'
import useDraggableScroll from 'use-draggable-scroll'

const useStyles = makeStyles(() => ({
  container: {
    '&::-webkit-scrollbar': {
      width: '0.4em'
    },
    '&::-webkit-scrollbar-track': {
      boxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
      webkitBoxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)'
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: 'rgba(0,0,0,.1)',
      outline: '1px solid slategrey'
    },
    // border: '1px solid'
  }
}))

const Playlist = ({
  songList = [],
  onSelectSong,
  selectedSong,
}) => {
  const ref = useRef(null)
  const { onMouseDown } = useDraggableScroll(ref)
  const classes = useStyles()
  return (
    <Box
      width="100%"
      maxWidth={360}
      overflow="auto"
      sx={{ bgcolor: 'background.paper' }}
      ref={ref}
      onMouseDown={onMouseDown}
      scrollbarWidth="none"
      className={classes.container}
    >
      <nav aria-label="main mailbox folders">
        <List>
          {songList.map((song, index) => (
            <>
              <ListItem
                sx={{
                  backgroundColor: selectedSong === index ? '#c5c5c5' : 'inherit',
                }}
                key={song.file + 'item'}
                disablePadding
              >
                <ListItemButton onClick={() => onSelectSong(index)}>
                  <ListItemText>{song.name}</ListItemText>
                </ListItemButton>
              </ListItem>
              <Divider key={song.file + 'divider'} />
            </>
          ))}
        </List>
      </nav>
    </Box>
  )
}
export default Playlist
