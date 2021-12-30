import React, { useEffect, useRef, memo, useState } from 'react'
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
import { ExpandLess, ExpandMore } from '@mui/icons-material'

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

const Playlist = memo(function Playlist({
  songList = [],
  player,
  selectedSong,
}) {
  const ref = useRef(null)
  const itemRef = useRef(null)
  const { onMouseDown } = useDraggableScroll(ref)
  const classes = useStyles()
  const [expanded, setExpanded] = useState({})
  useEffect(() => {
    if (itemRef?.current && ref?.current) {
      ref.current.scrollTop = itemRef.current.offsetTop
    }
  }, [itemRef.current])

  useEffect(() => {
    if (songList && songList[selectedSong]) {
      const { dir } = songList[selectedSong]
      if (!expanded[dir]) {
        setExpanded({ [dir]: true })
      }
    }

  }, [songList[selectedSong]])

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
              {
                songList && songList[index - 1]?.dir !== song.dir && (
                  <ListItem
                    sx={{
                      // backgroundColor: selectedSong === index ? '#c5c5c5' : 'inherit',
                      // paddingLeft: 2,
                    }}
                    key={song.dir}
                    disablePadding
                    ref={selectedSong === index ? itemRef : null}
                  >
                    <ListItemButton onClick={() => setExpanded({ ...expanded, [song.dir]: !expanded[song.dir] })}>
                      <ListItemText>{song.dir}  {expanded[song.dir] ? <ExpandLess /> : <ExpandMore />}</ListItemText>
                    </ListItemButton>
                  </ListItem>
                )
              }
              <ListItem
                sx={{
                  backgroundColor: selectedSong === index ? '#c5c5c5' : 'inherit',
                  // paddingLeft: 2,
                  maxHeight: expanded[song.dir] ? 'initial' : 0,
                  overflow: 'hidden'
                }}
                key={song.file + 'item'}
                disablePadding
                ref={selectedSong === index ? itemRef : null}
              >
                <ListItemButton onClick={() => player.skipTo(index)}>
                <Divider orientation="vertical" flexItem sx={{ borderRightColor: 'ButtonText' }} /><ListItemText>- {song.name}</ListItemText>
                </ListItemButton>
              </ListItem>
              <Divider key={song.file + 'divider'} />
              {

              }
            </>
          ))}
        </List>
      </nav>
    </Box>
  )
})
export default Playlist
