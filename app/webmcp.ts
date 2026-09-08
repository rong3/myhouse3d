import { flushSync } from 'react-dom';
type Input={floor?:number;mode?:string};
export function registerViewerTool(select:(floor:number,mode:string)=>void){
 const context=(document as Document & {modelContext?:{registerTool:(tool:unknown,options:{signal:AbortSignal})=>void|Promise<void>}}).modelContext;
 if(!context?.registerTool)return;
 const lifecycle=new AbortController();
 try{Promise.resolve(context.registerTool({name:'show_house_floor',title:'Xem tầng nhà',description:'Chọn tầng và chế độ xem trong mô hình nhà 3D.',inputSchema:{type:'object',properties:{floor:{type:'integer',minimum:0,maximum:3},mode:{type:'string',enum:['single','explode','all']}},required:['floor','mode'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input:unknown){const s=input as Input;if(!s||!Number.isInteger(s.floor)||s.floor!<0||s.floor!>3||!['single','explode','all'].includes(s.mode!))throw new Error('Tầng phải từ 0 đến 3 và chế độ phải là single, explode hoặc all.');flushSync(()=>select(s.floor!,s.mode!));return {floor:s.floor,mode:s.mode};}}, {signal:lifecycle.signal})).catch(console.error)}catch(e){console.error(e)}
 return()=>lifecycle.abort();
}
