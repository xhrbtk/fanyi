const https = require('https')
const querystring = require('querystring')
const md5 = require('md5')
const { appId, appSecret } = require('./private')

// 表驱动变成
type ErrorMap = {
    [k: string]: string
}
const errorMap: ErrorMap = {
    52003: '用户认证失败',
    52004: 'error2',
    52005: 'error3',
    unknown: '服务器繁忙',
}

export const translate = (word: string) => {
    let from
    let to

    if (/[a-zA-Z]/.test(word[0])) {
        // 英译中
        from = 'en'
        to = 'zh'
    } else {
        // 中译英
        from = 'zh'
        to = 'en'
    }

    const salt = Math.random()
    const sign = md5(appId + word + salt + appSecret)

    const query: string = querystring.stringify({
        q: word,
        from,
        to,
        appid: appId,
        salt,
        sign,
    })
    const options = {
        hostname: 'api.fanyi.baidu.com',
        port: 443,
        path: '/api/trans/vip/translate?' + query,
        method: 'GET',
    }
    const req = https.request(options, (response: any) => {
        let chunks: Buffer[] = []
        response.on('data', (chunk: Buffer) => {
            chunks.push(chunk)
        })
        response.on('end', () => {
            const string = Buffer.concat(chunks).toString()
            type BaiduResult = {
                error_code?: any
                error_msg?: string
                from: string
                to: string
                trans_result: { src: string; dst: string }[]
            }
            const object: BaiduResult = JSON.parse(string)
            if (object.error_code in errorMap) {
                // 利用error_map的方式去处理错误
                console.error(errorMap[object.error_code] || object.error_msg)
                process.exit(2)
            } else {
                object.trans_result.map(obj => {
                    console.log(obj.dst)
                })
                process.exit(0)
            }
        })
    })

    req.on('error', (e: any) => {
        console.error(e)
    })
    req.end()
}
