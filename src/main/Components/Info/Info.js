import React, { memo, useContext } from 'react'
import {
  Box,
  Button,
  Typography
} from '@mui/material'
import { ThemeContext } from '../../../ThemeContext/ThemeContext'

const Info = memo(function info({
  image,
  trackName,
  trackAlbum,
  trackArtist
}) {
  const { themeName, setTheme } = useContext(ThemeContext)
  return (
    <Box
      sx={{
        width: '100%',
        background: `url(${image})`,
        // backgroundImage: `url(${image})`,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'contain',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        position: 'relative'
      }}
    >
      <Box
        position="absolute"
        display={themeName === 'dark' ? 'block' : 'none'}
        height="100%"
        width="100%"
        sx={{
          backgroundColor: 'rgba(0, 0, 0, .8)'
        }}
      />
      <Typography paragraph variant="h3">{trackName}</Typography>
      <Typography variant="h4">{trackArtist}</Typography>
      <Button
        onClick={() => themeName === 'dark' ? setTheme('light') : setTheme('dark')}
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
        }}
        variant="contained"
      >
        {themeName}
      </Button>
    </Box>
  )
})

export default Info
