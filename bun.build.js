import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from "fs";
import { parse } from "path";


const {PORT : port = 5000, BUN_ENV} = process.env;
const dev = BUN_ENV !== 'production';

globalThis.BASE_URL = process.env.BASE_URL||'/';
globalThis.API_URL = process.env.BASE_URL||'/api';


const alias = {
    '~': process.cwd(),
    '~ui': process.cwd() + '/app_ui',
}




const plugins = [
    {
        name: "svelte loader",
        async setup(build) {
            const { compile, preprocess } = await import("svelte/compiler");

            // when a .svelte file is imported...
            build.onLoad({ filter: /\.svelte$/ }, async ({path}) => {

                // read and compile it with the Svelte compiler
                let contents = {
                    code: readFileSync(path, "utf8")
                }

                contents = await preprocess(contents.code, [
                    {
                        markup({content}) {
                            [
                                [/{#else if /gim, '{:else if '],
                                [/{#elseif /gim, '{:else if '],
                                [/{#else}/gim, '{:else}'],
                                [/{#endif}/gim, '{/if}'],
                                [/{#endeach}/gim, '{/each}'],
                                [/{#then /gim, '{:then '],
                                [/{#catch /gim, '{:catch '],
                                [/{#endawait}/gim, '{/await}'],
                                [/{#endkey}/gim, '{/key}'],
                                [/{#depend /gim, '{#key '],
                                [/{#enddepend}/gim, '{/key}'],
                                [/{#endepend}/gim, '{/key}'],
                                [/{#debug /gim, '{@debug '],
                                [/{#html /gim, '{@html '],
                
                                ['$_GLOBAL_BASE_URL', String(globalThis.BASE_URL||'').replace(/\/+$/, '')],
                                ['$_GLOBAL_API_URL', globalThis.API_URL],
                            ]
                            .map(([pattern, replaceStr]) => {
                                content = content.replace(pattern, replaceStr)
                            })
                            
                            return {code: content}
                        }
                    }
                ])

                contents = compile(contents.code, {
                    filename: path,
                    // generate: "ssr",
                }).js.code;

                Object.entries(alias).forEach(([key, value]) => {
                    contents = contents.replace(new RegExp(`(['"])${key}/`, `g`), `$1${value}/`)
                })

                // const file = parse(path)
                // const dir = file.dir.slice(process.cwd().length)

                // mkdirSync('dist/bun-tmp'+ dir, { recursive: true })
                // writeFileSync('dist/bun-tmp'+ dir + '/' + file.name, contents)

                // and return the compiled source code as "js"
                return {
                    contents,
                    loader: "js",
                };
            });
        }
    },

    {
        name: 'path-alias',
        async setup(build) {
            build.onResolve({filter: new RegExp(
                Object.keys(alias).map(x => `^${x}`).join('|')
            )}, ({path}) => {
                Object.entries(alias).forEach(([key, value]) => {
                    path = path.replace(new RegExp(`^${key}/`), `${value}/`)
                })

                return {path, loader: parse(path).ext.slice(1)}
            })

        }
    },

]





// const options = {
//     run: true,
//     routifyDir: './.routify',
//     routesDir: {
//         default: 'app_ui/pages'
//     },
// }

// import { RoutifyBuildtime } from '@roxi/routify/lib/buildtime/RoutifyBuildtime.js';

// const routify = new RoutifyBuildtime(options)
// await routify.start()



const output = await Bun.build({
    entrypoints: ['./app_ui/app.ts'],
    outdir: 'public/assets',
    splitting: false,
    plugins,

    // loader?: { [k in string]: string }; // see https://bun.sh/docs/bundler/loaders
    // external?: string[]; // default []
    // sourcemap?: "none" | "inline" | "external"; // default "none"
    // root?: string; // default: computed from entrypoints
    // publicPath?: string; // e.g. http://mydomain.com/
    // naming?:
    //   | string // equivalent to naming.entry
    //     | { entry?: string; chunk?: string; asset?: string };
    // minify?:
    //   | boolean // default false
    //     | { identifiers?: boolean; whitespace?: boolean; syntax?: boolean };
})

// console.info({output})