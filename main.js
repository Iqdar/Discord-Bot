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
    .setDescription('Bot to get equal amounts from everyone')
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
      .setDescription('Amount given')
      .setRequired(true));

    const balance = new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Shows your balance');

    const all = new SlashCommandBuilder()
    .setName('all')
    .setDescription("everyone's balance");

    client.application.commands.create(given, "[server id]")
    client.application.commands.create(balance, "[server id]")
    client.application.commands.create(taken, "[server id]")
    client.application.commands.create(all, "[server id]")
})


client.on(Events.InteractionCreate, interaction => {
    if(!interaction.isChatInputCommand())return;
    if(interaction.commandName === "given"){
      const user = interaction.user.username;
      var amount = interaction.options.getNumber('amount');
      const amountToDeduct = amount/6;
      data[0].Balance = data[0].Balance + amount;
      for(i = 1; i < Object.keys(data).length; i++){
        if(data[i].Name == user){
          data[i].Balance = data[i].Balance + amount;
          for(j = 1; j < Object.keys(data).length; j++){
            data[j].Balance = data[j].Balance - amountToDeduct;
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
      for(i = 1; i < Object.keys(data).length; i++){
        if(data[i].Name == user && amount<=data[i].Balance){
          data[i].Balance = data[i].Balance - amount;          
          const dataInCsv = new Parser({fields: ["Name","Balance"]}).parse(data);
          fs.writeFileSync("Data.csv",dataInCsv);
          interaction.reply(user+' taken '+amount+' amount back!');
          break;
        }
        else if(data[i].Name == user && amount>data[i].Balance){
          interaction.reply(user+' does not have enough amount to take!');
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

    if(interaction.commandName === "all"){
      const user = interaction.user.username;
      var bal;
      let output;
      for(i = 1; i < Object.keys(data).length; i++){
        bal = data[i].Balance;
        if(bal < 0){
          output = output + data[i].Name + ' have to debit '+(bal*(-1))+'! \n';
        }
        else{
          output = output + data[i].Name + "'s credit is "+bal+"! \n";
        }
      }
    }
})


client.login('[bot token]');

