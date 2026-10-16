const DEFAULT_BODY_LIMIT = 1_000_000

export function readJsonBody(request, limit = DEFAULT_BODY_LIMIT) {
  return new Promise((resolve, reject) => {
    let body = ''

    request.setEncoding('utf8')
    request.on('data', (chunk) => {
      body += chunk
      if (body.length > limit) {
        reject(new Error('Payload trop volumineux.'))
        request.destroy()
      }
    })
    request.on('end', () => {
      if (!body) {
        resolve({})
        return
      }

      try {
        resolve(JSON.parse(body))
      } catch {
        reject(new Error('Corps JSON invalide.'))
      }
    })
    request.on('error', reject)
  })
}

export function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.setHeader('Cache-Control', 'no-store')
  response.end(JSON.stringify(payload))
}
