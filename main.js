const Discord = require("discord.js");
const fs = require('fs');
const csv = require('csvtojson');
const {Parser} = require('json2csv');
const { Client, Events, EmbedBuilder, PermissionsBitField, GatewayIntentBits, SlashCommandBuilder } = require('discord.js');

const client = new Discord.Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences
  ]
})

let data;

client.once(Events.ClientReady, c => {
    console.log("Iqdar's Bot is ready");
    (async () => {
      data = await csv().fromFile('Data.csv');
      console.log(data);
      console.log(Object.keys(data).length);
    })();

    const given = new SlashCommandBuilder()
    .setName('given')
    .setDescription('Amount given from everyone')
    .addNumberOption(option =>
      option
      .setName('amount')
      .setDescription('Amount given')
      .setRequired(true));
    
    const taken = new SlashCommandBuilder()
    .setName('taken')
    .setDescription('Amount taken back')
    .addNumberOption(option =>
      option
      .setName('amount')
      .setDescription('Amount taken')
      .setRequired(true))
    .addMentionableOption(option =>
      option
      .setName('name')
      .setDescription('Amount taken from')
      .setRequired(true));

    const balance = new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Shows your balance');

    const clear = new SlashCommandBuilder()
    .setName('clear')
    .setDescription('cleares all data in dataset');

    const all = new SlashCommandBuilder()
    .setName('all')
    .setDescription("everyone's balance");

    client.application.commands.create(given, "1105080364864639056")
    client.application.commands.create(balance, "1105080364864639056")
    client.application.commands.create(taken, "1105080364864639056")
    client.application.commands.create(clear, "1105080364864639056")
    client.application.commands.create(all, "1105080364864639056")
})


client.on(Events.InteractionCreate, interaction => {
    if(!interaction.isChatInputCommand())return;
    if(interaction.commandName === "given"){
      const user = interaction.user.username;
      var amount = interaction.options.getNumber('amount');
      const amountToDeduct = amount/(Object.keys(data)-1);
      data[0].Balance = Number(data[0].Balance) + Number(amount);
      for(i = 1; i < Object.keys(data).length; i++){
        if(data[i].Name == user){
          data[i].Balance = Number(data[i].Balance) + Number(amount);
          for(j = 1; j < Object.keys(data).length; j++){
            data[j].Balance = Number(data[j].Balance) - Number(amountToDeduct);
          }
          const dataInCsv = new Parser({fields: ["Name","Balance"]}).parse(data);
          fs.writeFileSync("Data.csv",dataInCsv);
          interaction.reply('Got '+amount+' from '+user+'!');
          break;
        }
        else if(i == Object.keys(data).length){
          interaction.reply(user+' not fount in csv data file!');
        }
      }
    }

    if(interaction.commandName === "taken"){
      const user = interaction.user.username;
      var amount = interaction.options.getNumber('amount');
      const person = interaction.options.getMentionable('name').user.username;
      console.log(person);
      for(i = 1; i < Object.keys(data).length; i++){
        if(data[i].Name == user){
          console.log(1);
          for(j = 1; j < Object.keys(data).length; j++){
            if(data[j].Name == person){
              console.log(2);
              data[j].Balance = Number(data[j].Balance) + Number(amount);
              data[i].Balance = data[i].Balance - amount;          
              const dataInCsv = new Parser({fields: ["Name","Balance"]}).parse(data);
              fs.writeFileSync("Data.csv",dataInCsv);
              interaction.reply(user+' taken '+amount+' amount from '+person+'!');
              break;  
            }
            else if(j == Object.keys(data).length){
              interaction.reply(person+' not fount in csv data file!');
            }
          }  
        }
        else if(i == Object.keys(data).length){
          interaction.reply(user+' not fount in csv data file!');
        }
      }
    }

    if(interaction.commandName === "balance"){
      const user = interaction.user.username;
      var bal;
      for(i = 1; i < Object.keys(data).length; i++){
        if(data[i].Name == user){
          bal = data[i].Balance;
          if(bal < 0){
            interaction.reply('You have to debit '+(bal*(-1))+'!');
          }
          else if (bal >= 0){
            interaction.reply('Your credit is '+bal+'!');
          }
          break;
        }
        else if(i == Object.keys(data).length){
          interaction.reply(user+' not fount in csv data file!');
        }
      }
    }

    if(interaction.commandName === "clear"){

      for(i = 0; i < Object.keys(data).length; i++){
        data[i].Balance = 0; 
      }
      const dataInCsv = new Parser({fields: ["Name","Balance"]}).parse(data);
      fs.writeFileSync("Data.csv",dataInCsv);
      interaction.reply('All data cleared in csv data file!');
    }

    if(interaction.commandName === "all"){
      const user = interaction.user.username;
      var bal;
      let output = "";
      for(i = 1; i < Object.keys(data).length; i++){
        bal = data[i].Balance;
        if(bal < 0){
          output = output + data[i].Name + ' have to debit '+(bal*(-1))+'! \n';
        }
        else{
          output = output + data[i].Name + "'s credit is "+bal+"! \n";
        }
      }
      interaction.reply(output);
    }
})


client.login('MTEwNTEyMDY0MTAzMzY5OTM3OQ.G90SkR.YRc59Dtc1Yxl8eQy5mM6c1hP2JxrpfCmfjQTIg');

