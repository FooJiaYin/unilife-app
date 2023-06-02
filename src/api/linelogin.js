
const line = {
    clientId: '1657093699',
    redirectUrl: 'https://us-central1-gleaming-bot-319115.cloudfunctions.net/auth/line',
    scope: 'profile openid email'
}

export const LineLoginUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${line.clientId}&redirect_uri=${encodeURIComponent(line.redirectUrl)}&scope=${encodeURI(line.scope)}&state=12345&nonce=6789&bot_prompt=aggressive`;