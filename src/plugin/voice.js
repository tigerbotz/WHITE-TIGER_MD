import config from '../../config.cjs'; // Import the configuration

const commandHandler = async (m, sock) => {
  const prefix = config.PREFIX; // Get the command prefix from config
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';

if (cmd === "gm") {
    const voicePath = 'src/gm.mp3'; // Path to the voice file
    const audioMessage = {
      audio: { url: voicePath },
      mimetype: 'audio/mp3', // Set the mimetype for audio/mp3 (or 'audio/mpeg' for .mp3)
      ptt: true // Set as push-to-talk (optional)
    };

    await sock.sendMessage(m.from, audioMessage, { quoted: m }); // Send the audio file
  }
};

export default commandHandler;
