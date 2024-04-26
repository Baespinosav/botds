// Importar las bibliotecas necesarias
const Discord = require('discord.js');
const client = new Discord.Client({
    intents: [
      Discord.GatewayIntentBits.Guilds,
      Discord.GatewayIntentBits.GuildMessages,
      Discord.GatewayIntentBits.GuildVoiceStates
    ]
  });
const ytdl = require('ytdl-core');

// Configurar la conexión de voz
const queue = new Map();

client.once('ready', () => {
  console.log('¡Vamo pal mambo o no vamo pal mambo?!');
  console.log('Mensaje recibido 1')
});

client.once('reconnecting', () => {
  console.log('Jalando, un momento!');
});

client.once('disconnect', () => {
  console.log('Chao perkin ql!');
});

client.on('message', async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith('+')) return;

  const serverQueue = queue.get(message.guild.id);
  console.log('Mensaje recibido 2')

  if (message.content.startsWith('+play')) {
    execute(message, serverQueue);
    return;
    console.log('Mensaje recibido 3')
  } else if (message.content.startsWith('+skip')) {
    skip(message, serverQueue);
    return;
    console.log('Mensaje recibido')
  } else if (message.content.startsWith('+stop')) {
    stop(message, serverQueue);
    return;
    console.log('Mensaje recibido 4')
  }
});

async function execute(message, serverQueue) {
  const args = message.content.split(' ');

  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel)
    return message.channel.send(
      'Metete en un canal saco wea!'
    );
  const permissions = voiceChannel.permissionsFor(message.client.user);
  if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
    return message.channel.send(
      'ESKIUSMI!'
    );
  }

  const songInfo = await ytdl.getInfo(args[1]);
  const song = {
    title: songInfo.videoDetails.title,
    url: songInfo.videoDetails.video_url,
  };

  if (!serverQueue) {
    const queueContruct = {
      textChannel: message.channel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      volume: 5,
      playing: true,
    };

    queue.set(message.guild.id, queueContruct);

    queueContruct.songs.push(song);

    try {
      var connection = await voiceChannel.join();
      queueContruct.connection = connection;
      play(message.guild, queueContruct.songs[0]);
    } catch (err) {
      console.log(err);
      queue.delete(message.guild.id);
      return message.channel.send(err);
    }
  } else {
    serverQueue.songs.push(song);
    return message.channel.send(`${song.title} en la colita del seba!`);
  }
}

function skip(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send(
      'Necesitas estar en un canal de voz para saltar la canción!'
    );
  if (!serverQueue)
    return message.channel.send('No hay canciones que saltar!');
  serverQueue.connection.dispatcher.end();
}

function stop(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send(
      'Necesitas estar en un canal de voz para detener la música!'
    );
  serverQueue.songs = [];
  serverQueue.connection.dispatcher.end();
}

function play(guild, song) {
  const serverQueue = queue.get(guild.id);
  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }

  const dispatcher = serverQueue.connection
    .play(ytdl(song.url))
    .on('finish', () => {
      serverQueue.songs.shift();
      play(guild, serverQueue.songs[0]);
    })
    .on('error', error => console.error(error));
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
  serverQueue.textChannel.send(`Con ustedeees: **${song.title}**`);
}

client.login('OTI1NDgwNTA5MjM5MzMyOTE2.GPWlX8.Jj1_T7VMJxDTBFslcrJY4KLokU6u3fjAPmYpME');