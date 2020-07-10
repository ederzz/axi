import typescript from 'rollup-plugin-typescript2'
import pkg from './package.json'
import { terser } from "rollup-plugin-terser";

export default {
    input: 'src/index.ts',
    output: [
        { 
            file: pkg.main, 
            format: 'umd', 
            name: 'Axi',  
            banner: '/* Axi version: ' + pkg.version + ' */',
            footer: '/* Contribute to axi: https://github.com/shenyiling/axi */'
        },
        { 
            file: pkg.module, 
            format: 'es',
            banner: '/* Axi version: ' + pkg.version + ' */',
            footer: '/* Contribute to axi: https://github.com/shenyiling/axi */'
        }
    ],
    plugins: [
        typescript(),
        terser({
            output: {
                comments: 'all'
            }
        })
    ],
}