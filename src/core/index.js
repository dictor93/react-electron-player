import { Howl, Howler } from 'howler'
const storage = window.require('electron-json-storage')

import {
  PAUSE,
  PLAY_START,
  VOLUME,
  SEEK_UPDATE,
  DURATION,
} from '../constants/playerActions'

const fs = window.require('fs')

const Player = function (playlist, index) {
  console.log('creating instance')
  this.playlist = playlist
  this.index = index
  this.randomIndex = index
  this.sekkInterval = null
  // this.randomArray = randomize(
  //     Array.from({ length: playlist.length }, (_, i) => i)
  // );
}

Player.prototype = {
  pusAction: function (type, payload) {
    this.updateHandler && this.updateHandler(type, payload)
    if (type === PAUSE) {
      clearInterval(this.sekkInterval)
    }
  },
  onUpdate: function (updateHandler) {
    this.updateHandler = updateHandler
  },
  play: function (index, onPlay) {
    const self = this


    index = (typeof index === 'number' ? index : self.index) || 0

    const data = self.playlist[index]

    fs.readFile(data.file, function (err, buffer) {

      if (err) console.log(err)
      const blob = new window.Blob([new Uint8Array(buffer)])

      const howlSource = URL.createObjectURL(blob)


      if (data.howl) {
        self.sound = data.howl
      } else {
        self.sound = data.howl = new Howl({
          src: [howlSource],
          html5: true,
          onplay: function () {
            const duration = self.sound.duration()
            self.pusAction(PLAY_START, data.file)
            self.pusAction(DURATION, duration)
            self.sekkInterval = setInterval(() => {
              self.pusAction(SEEK_UPDATE, self.sound?.seek())
            }, 33)
          },
          onend: function () {
            // if (shuffle) {
            //     self.skip('random')
            // } else {
            self.skip('right')
            // }
          },
          onstop: () => {
            self.pusAction(PAUSE)
          },
          onpause: () => {
            self.pusAction(PAUSE)
          },
          onvolume: volume => self.pusAction(VOLUME, volume),
          onloaderror: console.log,
          onplayerror: console.log
        })
      }


      self.sound.play()
      self.index = index
      storage.set('last-played', { path: data.file }, function (error) {
        if (error) throw error
      })
    })
    // sound.play()
  },

  pause: function () {
    const self = this

    const sound = self.playlist[self.index].howl

    sound.pause()
    self.pusAction(PAUSE)
  },

  skip: function (direction) {
    const self = this

    let index = 0
    if (direction === 'prev') {
      index = self.index - 1
      if (index < 0) {
        index = self.playlist.length - 1
      }
    } else if (direction === 'random-next') {
      self.randomIndex += 1
      if (self.randomIndex >= self.randomArray.length) {
        self.randomIndex = 0
      }
      index = self.randomArray[self.randomIndex]
    } else if (direction === 'random-prev') {
      self.randomIndex -= 1
      if (self.randomIndex < 0) {
        self.randomIndex = self.randomArray.length - 1
      }
      index = self.randomArray[self.randomIndex]
    } else {
      index = self.index + 1
      if (index >= self.playlist.length) {
        index = 0
      }
    }

    self.skipTo(this.playlist[index].index)
  },

  skipTo: function (index) {
    const self = this
    if (self.playlist[self.index].howl) {
      self.playlist[self.index].howl.stop()
    }
    index = this.playlist.findIndex(x => x.index == index)
    self.play(index)
  },

  step: function () {
    const self = this

    const sound = self?.playlist[self.index]?.howl

    const seek = sound?.seek() || 0


    if (sound?.playing()) {
      // requestAnimationFrame(self.step.bind(self))
    }
    if (sound) {
      return ((seek / sound.duration()) * 100 || 0)
    }
  },
  formatTime: function (secs) {
    const minutes = Math.floor(secs / 60) || 0
    const seconds = secs - minutes * 60 || 0

    return minutes + ':' + (seconds < 10 ? '0' : '') + seconds
  },
  volume: function (val) {
    Howler.volume(val)
  },
  seek: function (time) {
    if (this.sound?.playing()) {
      this.sound.seek(this.sound.duration() * time / 100)
    }
  },
  destroy: function () {
    clearInterval(this.updater)
  },
  setPlaylist: function (playlist, index) {
    this.playlist = playlist
    this.index = index || this.index
    this.sound?.stop()
    this.play()
  }
}

export const instanse = new Player([])
