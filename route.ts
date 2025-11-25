import { NextRequest, NextResponse } from 'next/server'

/**
 * Esta é a rota de callback (Redirect URI) para a autenticação OAuth do Mercado Livre.
 * Ela recebe o código de autorização e o troca por um access_token.
 */
export async function GET(request: NextRequest) {
  // Extrai a URL da requisição para pegar os parâmetros
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  // Se o Mercado Livre não enviou o parâmetro 'code', algo deu errado.
  if (!code) {
    return NextResponse.json(
      { error: 'Código de autorização não encontrado na requisição.' },
      { status: 400 }
    )
  }

  const clientId = process.env.MERCADO_LIVRE_APP_ID
  const clientSecret = process.env.MERCADO_LIVRE_CLIENT_SECRET
  const appUrl = process.env.NEXT_PUBLIC_APP_URL

  if (!clientId || !clientSecret || !appUrl) {
    const message = 'Variáveis de ambiente do Mercado Livre não configuradas: MERCADO_LIVRE_APP_ID, MERCADO_LIVRE_CLIENT_SECRET, NEXT_PUBLIC_APP_URL'
    console.error(message)
    return NextResponse.json({ error: message }, { status: 500 })
  }

  // A Redirect URI deve ser exatamente a mesma que você configurou no painel do ML.
  const redirectUri = `${appUrl}/api/auth/mercadolivre/callback`

  try {
    // 2. Trocar o código pelo Access Token
    const tokenResponse = await fetch('https://api.mercadolibre.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        redirect_uri: redirectUri,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenResponse.ok) {
      throw new Error(`Erro ao obter token: ${JSON.stringify(tokenData)}`)
    }

    // IMPORTANTE: Exibindo os tokens no console para você copiar.
    // Em um sistema de produção, você deve salvar isso de forma segura (ex: banco de dados).
    console.log('✅ Token de Acesso recebido com sucesso!')
    console.log('Copie o valor abaixo para a variável MERCADO_LIVRE_ACCESS_TOKEN no seu arquivo .env')
    console.log('MERCADO_LIVRE_ACCESS_TOKEN:', tokenData.access_token)
    console.log('---')
    console.log('Este é o Refresh Token. Guarde-o para renovar o token de acesso no futuro.')
    console.log('Refresh Token:', tokenData.refresh_token)

    // 3. Redirecionar o usuário para uma página de sucesso ou para o painel.
    return NextResponse.redirect(`${appUrl}?auth=success`)

  } catch (error: any) {
    console.error('Falha no processo de obtenção do token:', error)
    return NextResponse.json({ error: `Falha na autenticação: ${error.message}` }, { status: 500 })
  }
}