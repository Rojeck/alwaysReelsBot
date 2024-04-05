<div align="center">
  <img src="https://github.com/Rojeck/alwaysReelsBot/assets/30295583/9aa1fb49-ef6b-4c3a-88f7-1f034cb733c4" alt="arb" width="600px" height="475px">
</div>
<br>
<p><b>Always Reels Bot</b> is a simple Telegram bot designed for downloading reels from Instagram. Please read "How it works" or click "View Bot" and type /start</p>
<div align='center'><a href="https://t.me/AlwaysReels_bot"><b>View bot</b></a></div>

## How it works

- Open a chat with the bot and send the link to the Instagram reels you want to download
- The bot will reply to you with the video in MP4 format
- You can add the bot to your Telegram group and <b>grant it access to messages</b> (required)
- If someone in the group sends a link to an Instagram reel, the bot will reply with the corresponding video in MP4 format


## What's inside?

The bot is written in Nest.js using nestjs-telegraf
- If somebody sends a request to download reels, the bot creates a new audit event in the DB. This is necessary for statistics
- You can access audit events through the REST API
- If an error occurs, the bot sends a notification to the bot owner with error details
- If someone sends /start, the bot will send a notification with details as well, but this can be disabled in `.env`
- For the download reels feature, I have set up a throttler to prevent abuse of the bot's capabilities


## Run locally

1. Make sure you have node and yarn package manager installed
2. Clone the repository to your local machine.
3. Install the necessary dependencies using `yarn install`.
4. Create a `.env` file in the project's root directory and add the required environment variables from `.example.env`
5. Run database using `yarn service up`
6. Apply database migrations using `yarn prisma migrate deploy`
7. Create prisma types using `yarn prisma generate`
8. Run the bot in dev-mode using the command `yarn wd`
9. Enjoy!

## Looking For Sponsors
This project is free and open source, if you like my work, please consider:
<br>
<div align='center'>
  <a href="https://www.buymeacoffee.com/always_close"><img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=always_close&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff" /></a>
</div>

## Contribution

Feel free to contribute to this project by opening new issues or creating pull requests with your suggestions.

## License

This project is distributed under the [MIT License](LICENSE).
