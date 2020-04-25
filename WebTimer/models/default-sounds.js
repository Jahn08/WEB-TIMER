const defaultSounds = [
    { name: 'classic alarm', file: 'alarm_classic.mp3' },
    { name: 'alert', file: 'alert_8bit.mp3' },
    { name: 'official bell', file: 'bell_official.mp3' },
    { name: 'horn', file: 'horn.mp3' },
    { name: 'horn (wahwah)', file: 'horn_wahwah.mp3' },
    { name: 'beep', file: 'beep.mp3', internal: true }
].sort((a, b) => a.name > b.name);

const basicUrl = '../resources/audio/';
defaultSounds.forEach(s => s.file = basicUrl + s.file);

function getDefaultSounds(chosenSoundName = null) {
    defaultSounds.forEach(val => {
        val.active = val.name === chosenSoundName;
    });

    return defaultSounds;
}

module.exports = getDefaultSounds;
