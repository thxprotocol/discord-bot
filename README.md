# THX Discord Bot

## Description

The THX Bot can be used to reward message authors with ERC20 tokens from a pool by reacting with certain emojies on their contributions in a channel.

## Commands

This is the list of commands that you can use to interact with THX Bot.

```
>help
Return the list of commands.

>ping
This command return a pong.

>settings adminrole <@discord_id>
Elevates the bot permissions for another user of your guild.

>setup guild
Prompts for THX App client_id and client_secret.

>setup assetpool
Prompts for THX Asset Pool contract address.

>emoji add
Prompts for emoji and reward amount.

>wallet create <email> <password>
Creates a temporary wallet address for your to use in Discord.

>wallet update <address>
Links an existing wallet address to your user.

>wallet info
Shows the linked wallet address and ERC20 token balance.

>wallet login <email>
Sends a one-time login link to the e-mail address (valid for 10 minutes).
```

### Prerequisites

#### 1. [Signup for a THX account](https://www.thx.network/signup)

Signup is free while we are in beta so let's give it a try!

#### 2. [Create an Application & ERC20 pool](https://dashboard.thx.network)

The application is used to authorize with our API. You can create your own ERC20 token with a limited or unlimited supply and deploy it in a fresh asset pool. Deploying your smart contract can take up to ~20 seconds.

> Make sure to edit you asset pool after deployment and disable the governance setting. This feature is currently not supported by the THX Bot.

#### 3. [Invite THX Bot to your guild](https://discord.com/api/oauth2/authorize?client_id=834083368370700299&permissions=8&scope=bot)

By clicking this link you will be asked which guild the THX Bot should join.

### Setup THX Bot (only admin)

**1. Authorize your guild**

```
>setup guild

1. What is your Client ID?
BQGVaUo9LnERPHo9Ci_I2
2. What is your Client Secret?
wFzMnzyisiqjBmSXR0egHePIYOjSPtSg2jwQUrvWpAWWj79emM_3VHeEgcsxEmhTUAUxvtCu59K41FKfIoZyVg
```

**2. Connect your pool to a channel**

```
>setup assetpool

1. What is your Asset Pool contract address?
0x38728E872553Cd8189A6E5cB916B15Ad78Ae0a42
```

**3. Create emoji rewards**

```
>emoji add

1. What emoji you want to use?
:rocket:
2. Please spectify your reward size?
3
```

### Link THX Wallet (all guild users)

**1. Create a new THX wallet**

A THX account will be created for e-mail and password you provide. Your temporary private key will be encrypted with the password you provide.

```
>wallet create john@doe.com $secret123
```

**2. Link an existing THX wallet**

This wallet address will be linked to your Discord user and used to transfer rewards to.

```
>wallet update 0xeF6cF3A2294dB6cBdc010e559387696714307eA5
```

**3. Send a one-time login link for you wallet**

This command will send a login link to the provided e-mail address. After clicking the link in the e-mail you will be prompted to change your password and your existing rewards will be given to the new address you get when entering the Web Wallet

> Make sure to link your new wallet address with `>wallet update <address>`!

```
>wallet login @john@doe.com
```

**3. Show wallet information**

Show the currently linked wallet address and token balance for that address.

```
>wallet info
```
