import React, { useEffect, useState } from 'react'
import { instanse as player } from '../core/index'
import {
  DURATION,
  PAUSE,
  PLAY_START,
  SEEK_UPDATE,
  VOLUME
} from '../constants/playerActions'
import Playlist from './Components/Playlist'
import { Box } from '@mui/system'
import Controls from './Components/Controls'
import Info from './Components/Info'

const ipc = window.require('electron').ipcRenderer
const fs = window.require('fs')
const path = window.require('path')
const storage = window.require('electron-json-storage')
const mm = window.require('music-metadata')
const chokidar = window.require('chokidar')

// const player = new Player([])

export const Main = () => {
  const [songPlaying, setSongPlaying] = useState(false)
  const [songList, setSongList] = useState([])
  const [image, setImage] = useState('')
  const [currentIndex, setCurrentindex] = useState()
  // const [player, setPlayer] = useState(null)
  const [volume, setVolume] = useState(100)
  const [trackArtist, setTrackArtist] = useState()
  const [trackAlbum, setTrackAlbum] = useState()
  const [trackName, setTrackName] = useState()
  const [seek, setSeek] = useState(0)
  const [duration, setDuration] = useState(0)
  const [watcher, setWatcher] = useState()

  useEffect(() => {
    const handlers = {
      [PLAY_START]: song => {
        setSongPlaying(true)
        getTags(song)
        setCurrentindex(player.index)
      },
      [PAUSE]: () => setSongPlaying(false),
      [SEEK_UPDATE]: seekNow => setSeek(seekNow),
      [VOLUME]: value => setVolume(value),
      [DURATION]: setDuration,
    }
    player.onUpdate((type, payload) => {
      handlers[type] && handlers[type](payload)
    })
  }, [])

  useEffect(() => {
    storage.has('settings', function (error, hasKey) {
      if (error) throw error
      if (hasKey) {
        storage.get('settings', function (error, data) {
          if (error) throw error
          // if (data.shuffle) shuffle = true;
          // if (data.volume) slider = data.volume;
        })
      }
    })

    storage.has('path', function (error, hasKey) {
      if (error) throw error
      if (hasKey) {
        storage.get('path', function (error, data) {
          if (error) throw error
          scanDir(data.path.toString())
        })
      }
    })
  }, [])

  // function setTheme(data) {
  //     const icons = document.body.querySelectorAll('svg')
  //     if (data.theme == 'light') {
  //         // theme = 'light';
  //         document.body.style.backgroundColor = '#F5F5F5'
  //         document.body.style.color = '#212529'

  //         icons.forEach(icon => {
  //             icon.style.color = '#212529'
  //         })
  //     } else if (data.theme == 'dark') {
  //         // theme = 'dark';
  //         document.body.style.backgroundColor = '#212121'
  //         document.body.style.color = 'azure'

  //         icons.forEach(icon => {
  //             icon.style.color = 'azure'
  //         })
  //     } else if (data.theme == 'disco') {
  //         // theme = 'disco';
  //         icons.forEach(icon => {
  //             icon.style.color = 'azure'
  //         })
  //     }
  // }

  // storage.has('theme', function (error, hasKey) {
  //     if (error) throw error
  //     if (hasKey) {
  //         storage.get('theme', function (error, data) {
  //             if (error) throw error
  //             // setTheme(data)
  //         })
  //     }
  // })

  const walkSync = function (dir, filelist = []) {
    const files = fs.readdirSync(dir)
    files.forEach(function (file) {
      if (fs.statSync(path.join(dir, file)).isDirectory()) {
        filelist = walkSync(path.join(dir, file), filelist)
      } else {
        if (
          file.endsWith('.mp3') ||
          file.endsWith('.m4a') ||
          file.endsWith('.webm') ||
          file.endsWith('.wav') ||
          file.endsWith('.aac') ||
          file.endsWith('.ogg') ||
          file.endsWith('.opus')
        ) {
          filelist.push(path.join(dir, file))
        }
      }
    })
    return filelist
  }

  async function parseFiles(audioFiles) {
    const titles = []


    for (const audioFile of audioFiles) {
      let metadata
      try {
         metadata = await mm.parseFile(audioFile, { skipCovers: true })
      } catch(err) {
        console.log({ err,  name: audioFile.split(path.sep).slice(-1)[0]})
      }
      const stats = fs.statSync(audioFile)
      const data = {}
      const title = metadata?.common.title
      const artist = metadata?.common.artist
      if (title) data.title = metadata.common.title
      else data.title = audioFile.split(path.sep).slice(-1)[0]
      if (artist) data.artist = metadata?.common.artist
      else data.artist = ''
      data.modDate = stats.mtime

      titles.push(data)
    }

    return titles
  }

  async function scanDir(filePath) {
    if (!filePath || filePath == 'undefined') return

    setWatcher(chokidar.watch(filePath, {
        ignored: /[/\\]\./,
        persistent: true
    }))

    const arr = walkSync(filePath)
    const arg = {}
    const names = await parseFiles(arr)

    arg.files = arr
    arg.path = filePath
    arg.names = names
    startPlayer(arg)
  }

  function themeChange(data) {
    // setTheme(data)
  }

  function sortByTitle(arr, des = false) {
    arr.sort((a, b) => {
      let fa, fb
      if (!des) {
        fa = a.name.toLowerCase()
        fb = b.name.toLowerCase()
      } else {
        fa = b.name.toLowerCase()
        fb = a.name.toLowerCase()
      }
      if (fa < fb) return -1
      if (fa > fb) return 1
      return 0
    })
    return arr
  }

  function sortByArtist(arr, des = false) {
    arr.sort((a, b) => {
      let fa, fb
      if (!des) {
        fa = a.artist.toLowerCase()
        fb = b.artist.toLowerCase()
      } else {
        fa = b.artist.toLowerCase()
        fb = a.artist.toLowerCase()
      }
      if (fa < fb) return -1
      if (fa > fb) return 1
      return 0
    })
    return arr
  }

  function sortByDate(arr, des = false) {
    arr.sort((a, b) => {
      if (!des) return b.date - a.date
      return a.date - b.date
    })
    return arr
  }

  function sortDefault(arr, des = false) {
    arr.sort((a, b) => {
      if (!des) return a.index - b.index
      return b.index - a.index
    })
    return arr
  }

  async function addSongToPlaylist(path) {
      if (player) {
          const metadata = await mm.parseFile(path, { skipCovers: true })
          const data = {}
          data.title = metadata.common.title || path.split(path.sep).slice(-1)[0]
          data.artist = metadata.common.artist || ''

          const len = player.playlist.length

          player.playlist.push({
              title: path,
              file: path,
              name: data.title,
              artist: data.artist,
              date: data.modDate,
              howl: null,
              index: len
          })
          setSongList(player.playlist)
      }
  }

  function removeSongFromPlaylist(path) {
      if (player) {
          const remIndex = player.playlist.findIndex(x => x.file == path)
          if (remIndex != -1) {
              player.playlist.splice(remIndex, 1)
              // player.randomArray = randomize(
              //     Array.from({ length: player.playlist.length }, (_, i) => i)
              // )
          }
          setSongList(player.playlist)
      }
  }

  const setPlaylist = (songArr, index) => {
    setSongList(songArr)
    if(!songArr || songArr.length < 1) return

    player.setPlaylist(songArr, index)
    getTags(player.playlist[player.index || 0]?.file)
  }

  function startPlayer(arg) {
    if (songPlaying) {
      player?.pause()
      setSongPlaying(false)
    }
    const songArr = []

    for (let i = 0; i < arg.files.length; i++) {
      songArr.push({
        title: arg.files[i],
        file: arg.files[i],
        name: arg.names[i].title,
        artist: arg.names[i].artist,
        date: arg.names[i].modDate,
        howl: null,
        index: i
      })
    }

    watcher
        ?.on('add', path => addSongToPlaylist(path))
        ?.on('unlink', path => removeSongFromPlaylist(path))


    storage.has('last-played', function (error, hasKey) {
      if (error) throw error
      if (hasKey) {
        storage.get('last-played', function (error, data) {
          if (error) throw error
          const index = arg.files.indexOf(data.path)

          if (index != -1) {
            setPlaylist(songArr, index)
          } else {
            setPlaylist(songArr, 0)
          }
        })
      } else {
        setPlaylist(songArr, 0)
      }
    })
  }

  function getTags(audioFile) {
    const titles = []
    const metadata = mm
      .parseFile(audioFile, { skipCovers: false })
      .then(metadata => {
        const title = metadata.common.title
        const artist = metadata.common.artist
        const album = metadata.common.album

        setTrackName(title || audioFile.split(path.sep).slice(-1)[0])
        setTrackArtist(artist || '')
        setTrackAlbum(album || '')
        if (metadata.common.picture) {
          const picture = metadata.common.picture[0]
          setImage(`data:${picture.format};base64,${picture.data.toString('base64')}`)
        } else {
          setImage(null)
        }
      })
      .catch(err => {
        console.error(err.message)
      })
    return titles
  }

  // var showPlaylist = function () {
  //     if (playListVisible) {
  //         playListVisible = false;
  //     } else {
  //         playListVisible = true;
  //     }
  // };


  // var toggleShuffle = function () {
  //     if (shuffle) {
  //         shuffle = false;
  //     } else {
  //         shuffle = true;
  //     }
  //     storage.set(
  //         'settings',
  //         { shuffle: shuffle, volume: slider },
  //         function (error) {
  //             if (error) throw error;
  //         }
  //     );
  // };

  // var togglemute = function () {
  //     if (mute) {
  //         mute = false;
  //         player.volume(slider / 100);
  //     } else {
  //         mute = true;
  //         player.volume(0);
  //     }
  //     storage.set(
  //         'settings',
  //         { shuffle: shuffle, volume: slider },
  //         function (error) {
  //             if (error) throw error;
  //         }
  //     );
  // };

  // function randomize(array) {
  //     for (let i = array.length - 1; i > 0; i--) {
  //         let j = Math.floor(Math.random() * (i + 1));

  //         [array[i], array[j]] = [array[j], array[i]];
  //     }
  //     return array;
  // }


  useEffect(() => {
    ipc.on('theme-change', function (event, arg) {
      themeChange(arg)
    })
    ipc.on('selected-files', function (event, arg) {
      scanDir(arg)
    })
    ipc.on('save-settings', function (event, arg) {
        storage.set(
            'settings',
            { },
            function (error) {
                ipc.send('closed')
            }
        )
    })
    ipc.on('sort-change', function (event, arg) {
      if (player) {
        const index = player.playlist[player.index].index

        if (arg.items[0].checked)
          player.playlist = sortByDate(player.playlist, arg.items[6].checked)
        else if (arg.items[1].checked)
          player.playlist = sortByTitle(
            player.playlist,
            arg.items[6].checked
          )
        else if (arg.items[2].checked)
          player.playlist = sortByArtist(
            player.playlist,
            arg.items[6].checked
          )
        else if (arg.items[3].checked)
          player.playlist = sortDefault(
            player.playlist,
            arg.items[6].checked
          )

        player.index = player.playlist.findIndex(x => x.index == index)
      }
    })
  }, [])
  return (
    <Box
      maxHeight="100vh"
      height="100vh"
      display="flex"
      boxSizing="border-box"
      flexDirection="column"
      justifyContent="space-between"
      p={2}
    >
      <Box
        display="flex"
        height="100%"
        flexGrow={1}
        overflow="auto"
      >
        <Playlist songList={songList} onSelectSong={index => player.skipTo(index)} selectedSong={currentIndex} />
        <Info
          trackAlbum={trackAlbum}
          trackArtist={trackArtist}
          image={image}
          trackName={trackName}
        />
      </Box>
      <Box flexGrow={1}>
        <Controls
          seek={seek}
          setSeek={value => player.seek(value)}
          duration={duration}
          paused={!songPlaying}
          setPaused={paused => paused ? player.pause() : player.play()}
          onNext={() => player.skip()}
          onPrev={() => {
            player.skip('prev')
          }}
          volume={volume}
          onSetVolume={value => {
            player.volume(value / 100)
            setVolume(value)
          }}
        />
      </Box>
    </Box>
  )
}
