import axios from 'axios';
import yts from 'yt-search';

// Regex to match YouTube URLs
const youtubeUrlRegex = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})|(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/;

const video = async (m, Matrix) => {
  const prefixMatch = m.body.match(/^[\\/!#.]/);
  const prefix = prefixMatch ? prefixMatch[0] : '/';
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  const validCommands = ['video', 'ytmp4', 'vid', 'ytmp4doc'];

  if (validCommands.includes(cmd)) {
    if (!text) return m.reply('Give a YouTube URL or search query.');

    try {
      await m.React("🕘");

      let videoUrl = '';
      if (youtubeUrlRegex.test(text)) {
        // If text is a YouTube URL, use it directly
        const match = youtubeUrlRegex.exec(text);
        videoUrl = match[0]; // Full URL from regex match
      } else {
        // Otherwise, perform a search
        const searchResult = await yts(text);
        const firstVideo = searchResult.videos[0];
        if (!firstVideo) {
          m.reply('Video not found.');
          await m.React("❌");
          return;
        }
        videoUrl = firstVideo.url;
      }

      const apiUrl = `https://api.prabath-md.tech/api/ytmp4?url=${encodeURIComponent(videoUrl)}`;
      const response = await axios.get(apiUrl);
      const { status, data } = response.data;

      if (status !== 'success ✅') {
        m.reply('Error fetching video from the API.');
        await m.React("❌");
        return;
      }

      const { title, download } = data;

      const videoBuffer = await axios.get(download, { responseType: 'arraybuffer' });

      const sendVideoMessage = async (buffer) => {
        if (cmd === 'ytmp4doc') {
          const docMessage = {
            document: buffer,
            mimetype: 'video/mp4',
            fileName: `${title}.mp4`,
            caption: `> ${title}\n> © Powered by 𝞢𝙏𝞖𝞘𝞦-𝞛𝘿`,
          };
          await Matrix.sendMessage(m.from, docMessage, { quoted: m });
        } else {
          const videoMessage = {
            video: buffer,
            mimetype: 'video/mp4',
            caption: `> ${title}\n> © Powered by 𝞢𝙏𝞖𝞘𝞦-𝞛𝘿`,
          };
          await Matrix.sendMessage(m.from, videoMessage, { quoted: m });
        }
        await m.React("✅");
      };

      await sendVideoMessage(videoBuffer.data);
    } catch (error) {
      console.error("Error generating response:", error);
      m.reply('An error occurred while processing your request.');
      await m.React("❌");
    }
  }
};

export default video;
