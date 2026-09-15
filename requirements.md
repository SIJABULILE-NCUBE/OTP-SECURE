# My notes on this exercise

I was given this as a practice exercise by my mentor to help me get comfortable with node, express and supabase before working on real projects. Below is what I was asked to build and the rules I worked from.

## What I was asked to build

I was asked to build a small security feature that sends an otp to a user by email, along with a frontend to test that it actually works.

## The otp rules I followed

- the otp had to be 6 digits, and allowed to start with a 0
- a user should not receive the same otp within a 24 hour period, if that happens i had to quietly generate a new one instead, without letting the user know
- a user should not be able to request more than X otps per hour, i made X a config value, currently set to 3
- only the latest otp for a user should ever be valid
- an otp should expire after X seconds, i set this to 30 in my config
- if a user requests resend within X minutes, i had to resend the original otp instead of generating a new one, and just extend the expiry, i set this window to 5 minutes
- an otp should not be resendable more than X times, i set this to 3
- an otp should not be usable more than once

## My configuration values

| setting | value i used |
|---|---|
| maximum otp requests per hour | 3 |
| otp expiry time | 30 seconds |
| resend window | 5 minutes |
| maximum resends per otp | 3 |

## The two screens i built

**Send otp screen**, enter an email, click submit, this triggers the otp send. i also put the resend functionality on this same screen. this is not a login screen.

**Verify otp screen**, enter the email and otp, click a button to check if it is valid. this is not a login screen either.

## How i approached it

I built it in node using express, kept the frontend as plain html, css and javascript, and pushed my work to a public github repo as i went.
