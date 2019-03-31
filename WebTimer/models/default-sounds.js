function getDefaultSounds(chosenSoundName = null) {
    const basicUrl = '../resources/audio/';

    const defaultSounds = [
        { name: 'classic alarm', file: 'alarm_classic.mp3' },
        { name: 'alert', file: 'alert_8bit.mp3' },
        { name: 'official bell', file: 'bell_official.mp3' },
        { name: 'horn', file: 'horn.mp3' },
        { name: 'horn (wahwah)', file: 'horn_wahwah.mp3' },
        { name: 'beep', file: 'beep.mp3', internal: true }
    ].sort((a, b) => a.name > b.name);

    defaultSounds.forEach(val => {
        val.active = val.name === chosenSoundName;
        val.file = basicUrl + val.file;
    });

    return defaultSounds;
}

module.exports = getDefaultSounds;
