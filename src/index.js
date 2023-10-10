require("dotenv").config();
const { Client, GatewayIntentBits, Events } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
  ],
});

let betOptions = ['option1', 'option2'];
var betPool = null;

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", (msg) => {
    if (msg.content === "oi ana-chan!") {
        msg.reply("oie! :3");
    }

    if (msg.content === "d6") {
        msg.reply("🎲 " + generateRandomNumber(1, 6).toString());
    }

    if (msg.content === "50 50") {
        if (generateRandomNumber(1, 10) % 2 === 0) {
                msg.reply("🪙 deu cara");
        } else {
                msg.reply("🪙 deu coroa");
        }
    }

    if (msg.content.startsWith("!startbet") && !betPool) {
        const options = msg.content.split(" ").slice(1);
        if (options.length === 2) {
            betOptions = options;
            betPool = {
                isOpen: true,
                bets: { [betOptions[0]]: [], [betOptions[1]]: [] },
            };
            msg.reply(
                `A nova rodada de apostas começou! Use \`!bet <${betOptions[0]}>/<${betOptions[1]}> <amount>\` para apostar.`
            );
        } else {
            msg.reply(
                "Por favor, insira duas opções válidas: `!startbet <option1> <option2>`."
            );
        }
    }

    if (
        msg.content.startsWith("!bet") &&
        betPool &&
        msg.content.split(" ").length === 3
    ) {
        const [command, option, amount] = msg.content.split(" ");
        if (betOptions.includes(option) && !isNaN(amount) && amount > 0) {
            const userBet = { user: msg.author, amount: parseInt(amount) };
            betPool.bets[option].push(userBet);
            msg.reply(`Você apostou ${amount} em ${option}.`);
        } else {
                msg.reply(
                `Por favor, insira uma aposta válida: \`!bet ${betOptions[0]}/${betOptions[1]} <quantidade>\`.`
            );
        }
    }

    if (msg.content === "!choosewinner" && betPool && betPool.isOpen) {
        const winningOption = betOptions[generateRandomNumber(0, 1)]; // Randomly select a winner.
        const losingOption = betOptions.find((option) => option !== winningOption);
        const totalWinners = betPool.bets[winningOption].length;
        const totalLosers = betPool.bets[losingOption].length;

        if (totalWinners > 0) {
            const rewardPerWinner =
                betPool.bets[losingOption].reduce(
                    (total, bet) => total + bet.amount,
                    0
                ) / totalWinners;

            for (const winner of betPool.bets[winningOption]) {
                const totalLoserPoints = betPool.bets[losingOption].reduce(
                    (total, bet) => total + bet.amount,
                    0
                );
                const rewardPerWinner = totalLoserPoints / totalWinners;

                for (const winner of betPool.bets[winningOption]) {
                    const reward = Math.floor(winner.amount * (rewardPerWinner / totalLoserPoints));
                    // award the reward to the winner
                    msg.reply(`${winner.user} ganhou ${reward} pontos!`);
                }
            }
        }

        msg.reply(`A opção vencedora é ${winningOption}.`);
        msg.reply(
            `Total de vencedores: ${totalWinners}, Total de perdedores: ${totalLosers}.`
        );

        // Reset the bet pool.
        betPool = null;
    }
});

const generateRandomNumber = (min, max) => {
        return Math.floor(Math.random() * (max - min + 1) + min);
  };

client.login(process.env.TOKEN);
