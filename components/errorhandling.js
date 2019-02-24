require('dotenv').config();

class ErrorHandling {
  constructor(client) {
    this.client = client; // give the class the client from the index, this way we can cleany delete messages in the functions.
    console.log('ErrorHandling loaded...')
  }

  async cleanUp(replyId, replyChannelId) {
    // if an error happens, cleanup the command and reply
    try {
      if (replyId) {
        let replyChannel = await this.client.channels.get(replyChannelId);
        let reply = await replyChannel.fetchMessage(replyId);
        reply.delete(10000);
      }
      return;
    }
    catch (error) {
      console.error(error);
    }
  }
}

module.exports = ErrorHandling;