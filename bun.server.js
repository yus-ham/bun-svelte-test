import { parse } from 'path';


Bun.serve({
    fetch(req) {
        let body, type, status = 200
        let url = new URL(req.url)

        if (url.pathname === '/') {
            body = Bun.file('public/index.html')
        }
        else {
            try {
                body = Bun.file('public'+ url.pathname)

                type = {
                    '.js': 'application/javascript',
                }
                [parse(url.pathname).ext] || 'application/octet-stream'
            }
            catch(err) {
                status = 404
            }
        }

        return new Response(body, {
            status,
            headers: {
                'Content-Type': type||'text/html'
            }
        })    
    },
})