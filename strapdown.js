/**
 * marked - a markdown parser
 * Copyright (c) 2011-2013, Christopher Jeffrey. (MIT Licensed)
 * https://github.com/chjj/marked
 */
;(function(){var block={newline:/^\n+/,code:/^( {4}[^\n]+\n*)+/,fences:noop,hr:/^( *[-*_]){3,} *(?:\n+|$)/,heading:/^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/,nptable:noop,lheading:/^([^\n]+)\n *(=|-){3,} *\n*/,blockquote:/^( *>[^\n]+(\n[^\n]+)*\n*)+/,list:/^( *)(bull) [\s\S]+?(?:hr|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,html:/^ *(?:comment|closed|closing) *(?:\n{2,}|\s*$)/,def:/^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +["(]([^\n]+)[")])? *(?:\n+|$)/,table:noop,paragraph:/^((?:[^\n]+\n?(?!hr|heading|lheading|blockquote|tag|def))+)\n*/,text:/^[^\n]+/};block.bullet=/(?:[*+-]|\d+\.)/;block.item=/^( *)(bull) [^\n]*(?:\n(?!\1bull )[^\n]*)*/;block.item=replace(block.item,'gm')
(/bull/g,block.bullet)
();block.list=replace(block.list)
(/bull/g,block.bullet)
('hr',/\n+(?=(?: *[-*_]){3,} *(?:\n+|$))/)
();block._tag='(?!(?:'
+'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code'
+'|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo'
+'|span|br|wbr|ins|del|img)\\b)\\w+(?!:/|@)\\b';block.html=replace(block.html)
('comment',/<!--[\s\S]*?-->/)
('closed',/<(tag)[\s\S]+?<\/\1>/)
('closing',/<tag(?:"[^"]*"|'[^']*'|[^'">])*?>/)
(/tag/g,block._tag)
();block.paragraph=replace(block.paragraph)
('hr',block.hr)
('heading',block.heading)
('lheading',block.lheading)
('blockquote',block.blockquote)
('tag','<'+block._tag)
('def',block.def)
();block.normal=merge({},block);block.gfm=merge({},block.normal,{fences:/^ *(`{3,}|~{3,}) *(\w+)? *\n([\s\S]+?)\s*\1 *(?:\n+|$)/,paragraph:/^/});block.gfm.paragraph=replace(block.paragraph)
('(?!','(?!'+block.gfm.fences.source.replace('\\1','\\2')+'|')
();block.tables=merge({},block.gfm,{nptable:/^ *(\S.*\|.*)\n *([-:]+ *\|[-| :]*)\n((?:.*\|.*(?:\n|$))*)\n*/,table:/^ *\|(.+)\n *\|( *[-:]+[-| :]*)\n((?: *\|.*(?:\n|$))*)\n*/});function Lexer(options){this.tokens=[];this.tokens.links={};this.options=options||marked.defaults;this.rules=block.normal;if(this.options.gfm){if(this.options.tables){this.rules=block.tables;}else{this.rules=block.gfm;}}}
Lexer.rules=block;Lexer.lex=function(src,options){var lexer=new Lexer(options);return lexer.lex(src);};Lexer.prototype.lex=function(src){src=src.replace(/\r\n|\r/g,'\n').replace(/\t/g,'    ').replace(/\u00a0/g,' ').replace(/\u2424/g,'\n');return this.token(src,true);};Lexer.prototype.token=function(src,top){var src=src.replace(/^ +$/gm,''),next,loose,cap,bull,b,item,space,i,l;while(src){if(cap=this.rules.newline.exec(src)){src=src.substring(cap[0].length);if(cap[0].length>1){this.tokens.push({type:'space'});}}
if(cap=this.rules.code.exec(src)){src=src.substring(cap[0].length);cap=cap[0].replace(/^ {4}/gm,'');this.tokens.push({type:'code',text:!this.options.pedantic?cap.replace(/\n+$/,''):cap});continue;}
if(cap=this.rules.fences.exec(src)){src=src.substring(cap[0].length);this.tokens.push({type:'code',lang:cap[2],text:cap[3]});continue;}
if(cap=this.rules.heading.exec(src)){src=src.substring(cap[0].length);this.tokens.push({type:'heading',depth:cap[1].length,text:cap[2]});continue;}
if(top&&(cap=this.rules.nptable.exec(src))){src=src.substring(cap[0].length);item={type:'table',header:cap[1].replace(/^ *| *\| *$/g,'').split(/ *\| */),align:cap[2].replace(/^ *|\| *$/g,'').split(/ *\| */),cells:cap[3].replace(/\n$/,'').split('\n')};for(i=0;i<item.align.length;i++){if(/^ *-+: *$/.test(item.align[i])){item.align[i]='right';}else if(/^ *:-+: *$/.test(item.align[i])){item.align[i]='center';}else if(/^ *:-+ *$/.test(item.align[i])){item.align[i]='left';}else{item.align[i]=null;}}
for(i=0;i<item.cells.length;i++){item.cells[i]=item.cells[i].split(/ *\| */);}
this.tokens.push(item);continue;}
if(cap=this.rules.lheading.exec(src)){src=src.substring(cap[0].length);this.tokens.push({type:'heading',depth:cap[2]==='='?1:2,text:cap[1]});continue;}
if(cap=this.rules.hr.exec(src)){src=src.substring(cap[0].length);this.tokens.push({type:'hr'});continue;}
if(cap=this.rules.blockquote.exec(src)){src=src.substring(cap[0].length);this.tokens.push({type:'blockquote_start'});cap=cap[0].replace(/^ *> ?/gm,'');this.token(cap,top);this.tokens.push({type:'blockquote_end'});continue;}
if(cap=this.rules.list.exec(src)){src=src.substring(cap[0].length);this.tokens.push({type:'list_start',ordered:isFinite(cap[2])});cap=cap[0].match(this.rules.item);if(this.options.smartLists){bull=block.bullet.exec(cap[0])[0];}
next=false;l=cap.length;i=0;for(;i<l;i++){item=cap[i];space=item.length;item=item.replace(/^ *([*+-]|\d+\.) +/,'');if(~item.indexOf('\n ')){space-=item.length;item=!this.options.pedantic?item.replace(new RegExp('^ {1,'+space+'}','gm'),''):item.replace(/^ {1,4}/gm,'');}
if(this.options.smartLists&&i!==l-1){b=block.bullet.exec(cap[i+1])[0];if(bull!==b&&!(bull[1]==='.'&&b[1]==='.')){src=cap.slice(i+1).join('\n')+src;i=l-1;}}
loose=next||/\n\n(?!\s*$)/.test(item);if(i!==l-1){next=item[item.length-1]==='\n';if(!loose)loose=next;}
this.tokens.push({type:loose?'loose_item_start':'list_item_start'});this.token(item,false);this.tokens.push({type:'list_item_end'});}
this.tokens.push({type:'list_end'});continue;}
if(cap=this.rules.html.exec(src)){src=src.substring(cap[0].length);this.tokens.push({type:this.options.sanitize?'paragraph':'html',pre:cap[1]==='pre',text:cap[0]});continue;}
if(top&&(cap=this.rules.def.exec(src))){src=src.substring(cap[0].length);this.tokens.links[cap[1].toLowerCase()]={href:cap[2],title:cap[3]};continue;}
if(top&&(cap=this.rules.table.exec(src))){src=src.substring(cap[0].length);item={type:'table',header:cap[1].replace(/^ *| *\| *$/g,'').split(/ *\| */),align:cap[2].replace(/^ *|\| *$/g,'').split(/ *\| */),cells:cap[3].replace(/(?: *\| *)?\n$/,'').split('\n')};for(i=0;i<item.align.length;i++){if(/^ *-+: *$/.test(item.align[i])){item.align[i]='right';}else if(/^ *:-+: *$/.test(item.align[i])){item.align[i]='center';}else if(/^ *:-+ *$/.test(item.align[i])){item.align[i]='left';}else{item.align[i]=null;}}
for(i=0;i<item.cells.length;i++){item.cells[i]=item.cells[i].replace(/^ *\| *| *\| *$/g,'').split(/ *\| */);}
this.tokens.push(item);continue;}
if(top&&(cap=this.rules.paragraph.exec(src))){src=src.substring(cap[0].length);this.tokens.push({type:'paragraph',text:cap[1][cap[1].length-1]==='\n'?cap[1].slice(0,-1):cap[1]});continue;}
if(cap=this.rules.text.exec(src)){src=src.substring(cap[0].length);this.tokens.push({type:'text',text:cap[0]});continue;}
if(src){throw new
Error('Infinite loop on byte: '+src.charCodeAt(0));}}
return this.tokens;};var inline={escape:/^\\([\\`*{}\[\]()#+\-.!_>])/,autolink:/^<([^ >]+(@|:\/)[^ >]+)>/,url:noop,tag:/^<!--[\s\S]*?-->|^<\/?\w+(?:"[^"]*"|'[^']*'|[^'">])*?>/,link:/^!?\[(inside)\]\(href\)/,reflink:/^!?\[(inside)\]\s*\[([^\]]*)\]/,nolink:/^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]/,strong:/^__([\s\S]+?)__(?!_)|^\*\*([\s\S]+?)\*\*(?!\*)/,em:/^\b_((?:__|[\s\S])+?)_\b|^\*((?:\*\*|[\s\S])+?)\*(?!\*)/,code:/^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/,br:/^ {2,}\n(?!\s*$)/,del:noop,text:/^[\s\S]+?(?=[\\<!\[_*`]| {2,}\n|$)/};inline._inside=/(?:\[[^\]]*\]|[^\]]|\](?=[^\[]*\]))*/;inline._href=/\s*<?([^\s]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*/;inline.link=replace(inline.link)
('inside',inline._inside)
('href',inline._href)
();inline.reflink=replace(inline.reflink)
('inside',inline._inside)
();inline.normal=merge({},inline);inline.pedantic=merge({},inline.normal,{strong:/^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,em:/^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/});inline.gfm=merge({},inline.normal,{escape:replace(inline.escape)('])','~|])')(),url:/^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/,del:/^~~(?=\S)([\s\S]*?\S)~~/,text:replace(inline.text)
(']|','~]|')
('|','|https?://|')
()});inline.breaks=merge({},inline.gfm,{br:replace(inline.br)('{2,}','*')(),text:replace(inline.gfm.text)('{2,}','*')()});function InlineLexer(links,options){this.options=options||marked.defaults;this.links=links;this.rules=inline.normal;if(!this.links){throw new
Error('Tokens array requires a `links` property.');}
if(this.options.gfm){if(this.options.breaks){this.rules=inline.breaks;}else{this.rules=inline.gfm;}}else if(this.options.pedantic){this.rules=inline.pedantic;}}
InlineLexer.rules=inline;InlineLexer.output=function(src,links,opt){var inline=new InlineLexer(links,opt);return inline.output(src);};InlineLexer.prototype.output=function(src){var out='',link,text,href,cap;while(src){if(cap=this.rules.escape.exec(src)){src=src.substring(cap[0].length);out+=cap[1];continue;}
if(cap=this.rules.autolink.exec(src)){src=src.substring(cap[0].length);if(cap[2]==='@'){text=cap[1][6]===':'?this.mangle(cap[1].substring(7)):this.mangle(cap[1]);href=this.mangle('mailto:')+text;}else{text=escape(cap[1]);href=text;}
out+='<a href="'
+href
+'">'
+text
+'</a>';continue;}
if(cap=this.rules.url.exec(src)){src=src.substring(cap[0].length);text=escape(cap[1]);href=text;out+='<a href="'
+href
+'">'
+text
+'</a>';continue;}
if(cap=this.rules.tag.exec(src)){src=src.substring(cap[0].length);out+=this.options.sanitize?escape(cap[0]):cap[0];continue;}
if(cap=this.rules.link.exec(src)){src=src.substring(cap[0].length);out+=this.outputLink(cap,{href:cap[2],title:cap[3]});continue;}
if((cap=this.rules.reflink.exec(src))||(cap=this.rules.nolink.exec(src))){src=src.substring(cap[0].length);link=(cap[2]||cap[1]).replace(/\s+/g,' ');link=this.links[link.toLowerCase()];if(!link||!link.href){out+=cap[0][0];src=cap[0].substring(1)+src;continue;}
out+=this.outputLink(cap,link);continue;}
if(cap=this.rules.strong.exec(src)){src=src.substring(cap[0].length);out+='<strong>'
+this.output(cap[2]||cap[1])
+'</strong>';continue;}
if(cap=this.rules.em.exec(src)){src=src.substring(cap[0].length);out+='<em>'
+this.output(cap[2]||cap[1])
+'</em>';continue;}
if(cap=this.rules.code.exec(src)){src=src.substring(cap[0].length);out+='<code>'
+escape(cap[2],true)
+'</code>';continue;}
if(cap=this.rules.br.exec(src)){src=src.substring(cap[0].length);out+='<br>';continue;}
if(cap=this.rules.del.exec(src)){src=src.substring(cap[0].length);out+='<del>'
+this.output(cap[1])
+'</del>';continue;}
if(cap=this.rules.text.exec(src)){src=src.substring(cap[0].length);out+=escape(cap[0]);continue;}
if(src){throw new
Error('Infinite loop on byte: '+src.charCodeAt(0));}}
return out;};InlineLexer.prototype.outputLink=function(cap,link){if(cap[0][0]!=='!'){return'<a href="'
+escape(link.href)
+'"'
+(link.title?' title="'
+escape(link.title)
+'"':'')
+'>'
+this.output(cap[1])
+'</a>';}else{return'<img src="'
+escape(link.href)
+'" alt="'
+escape(cap[1])
+'"'
+(link.title?' title="'
+escape(link.title)
+'"':'')
+'>';}};InlineLexer.prototype.mangle=function(text){var out='',l=text.length,i=0,ch;for(;i<l;i++){ch=text.charCodeAt(i);if(Math.random()>0.5){ch='x'+ch.toString(16);}
out+='&#'+ch+';';}
return out;};function Parser(options){this.tokens=[];this.token=null;this.options=options||marked.defaults;}
Parser.parse=function(src,options){var parser=new Parser(options);return parser.parse(src);};Parser.prototype.parse=function(src){this.inline=new InlineLexer(src.links,this.options);this.tokens=src.reverse();var out='';while(this.next()){out+=this.tok();}
return out;};Parser.prototype.next=function(){return this.token=this.tokens.pop();};Parser.prototype.peek=function(){return this.tokens[this.tokens.length-1]||0;};Parser.prototype.parseText=function(){var body=this.token.text;while(this.peek().type==='text'){body+='\n'+this.next().text;}
return this.inline.output(body);};Parser.prototype.tok=function(){switch(this.token.type){case'space':{return'';}
case'hr':{return'<hr>\n';}
case'heading':{return'<h'
+this.token.depth
+'>'
+this.inline.output(this.token.text)
+'</h'
+this.token.depth
+'>\n';}
case'code':{if(this.options.highlight){var code=this.options.highlight(this.token.text,this.token.lang);if(code!=null&&code!==this.token.text){this.token.escaped=true;this.token.text=code;}}
if(!this.token.escaped){this.token.text=escape(this.token.text,true);}
return'<pre><code'
+(this.token.lang?' class="'
+this.options.langPrefix
+this.token.lang
+'"':'')
+'>'
+this.token.text
+'</code></pre>\n';}
case'table':{var body='',heading,i,row,cell,j;body+='<thead>\n<tr>\n';for(i=0;i<this.token.header.length;i++){heading=this.inline.output(this.token.header[i]);body+=this.token.align[i]?'<th align="'+this.token.align[i]+'">'+heading+'</th>\n':'<th>'+heading+'</th>\n';}
body+='</tr>\n</thead>\n';body+='<tbody>\n'
for(i=0;i<this.token.cells.length;i++){row=this.token.cells[i];body+='<tr>\n';for(j=0;j<row.length;j++){cell=this.inline.output(row[j]);body+=this.token.align[j]?'<td align="'+this.token.align[j]+'">'+cell+'</td>\n':'<td>'+cell+'</td>\n';}
body+='</tr>\n';}
body+='</tbody>\n';return'<table>\n'
+body
+'</table>\n';}
case'blockquote_start':{var body='';while(this.next().type!=='blockquote_end'){body+=this.tok();}
return'<blockquote>\n'
+body
+'</blockquote>\n';}
case'list_start':{var type=this.token.ordered?'ol':'ul',body='';while(this.next().type!=='list_end'){body+=this.tok();}
return'<'
+type
+'>\n'
+body
+'</'
+type
+'>\n';}
case'list_item_start':{var body='';while(this.next().type!=='list_item_end'){body+=this.token.type==='text'?this.parseText():this.tok();}
return'<li>'
+body
+'</li>\n';}
case'loose_item_start':{var body='';while(this.next().type!=='list_item_end'){body+=this.tok();}
return'<li>'
+body
+'</li>\n';}
case'html':{return!this.token.pre&&!this.options.pedantic?this.inline.output(this.token.text):this.token.text;}
case'paragraph':{return'<p>'
+this.inline.output(this.token.text)
+'</p>\n';}
case'text':{return'<p>'
+this.parseText()
+'</p>\n';}}};function escape(html,encode){return html.replace(!encode?/&(?!#?\w+;)/g:/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
function replace(regex,opt){regex=regex.source;opt=opt||'';return function self(name,val){if(!name)return new RegExp(regex,opt);val=val.source||val;val=val.replace(/(^|[^\[])\^/g,'$1');regex=regex.replace(name,val);return self;};}
function noop(){}
noop.exec=noop;function merge(obj){var i=1,target,key;for(;i<arguments.length;i++){target=arguments[i];for(key in target){if(Object.prototype.hasOwnProperty.call(target,key)){obj[key]=target[key];}}}
return obj;}
function marked(src,opt){try{if(opt)opt=merge({},marked.defaults,opt);return Parser.parse(Lexer.lex(src,opt),opt);}catch(e){e.message+='\nPlease report this to https://github.com/chjj/marked.';if((opt||marked.defaults).silent){return'An error occured:\n'+e.message;}
throw e;}}
marked.options=marked.setOptions=function(opt){merge(marked.defaults,opt);return marked;};marked.defaults={gfm:true,tables:true,breaks:false,pedantic:false,sanitize:false,smartLists:false,silent:false,highlight:null,langPrefix:'lang-'};marked.Parser=Parser;marked.parser=Parser.parse;marked.Lexer=Lexer;marked.lexer=Lexer.lex;marked.InlineLexer=InlineLexer;marked.inlineLexer=InlineLexer.output;marked.parse=marked;if(typeof exports==='object'){module.exports=marked;}else if(typeof define==='function'&&define.amd){define(function(){return marked;});}else{this.marked=marked;}}).call(function(){return this||(typeof window!=='undefined'?window:global);}());
// Copyright (C) 2006 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

window['PR_SHOULD_USE_CONTINUATION']=true;var prettyPrintOne;var prettyPrint;(function(){var win=window;var FLOW_CONTROL_KEYWORDS=["break,continue,do,else,for,if,return,while"];var C_KEYWORDS=[FLOW_CONTROL_KEYWORDS,"auto,case,char,const,default,"+"double,enum,extern,float,goto,int,long,register,short,signed,sizeof,"+"static,struct,switch,typedef,union,unsigned,void,volatile"];var COMMON_KEYWORDS=[C_KEYWORDS,"catch,class,delete,false,import,"+"new,operator,private,protected,public,this,throw,true,try,typeof"];var CPP_KEYWORDS=[COMMON_KEYWORDS,"alignof,align_union,asm,axiom,bool,"+"concept,concept_map,const_cast,constexpr,decltype,"+"dynamic_cast,explicit,export,friend,inline,late_check,"+"mutable,namespace,nullptr,reinterpret_cast,static_assert,static_cast,"+"template,typeid,typename,using,virtual,where"];var JAVA_KEYWORDS=[COMMON_KEYWORDS,"abstract,boolean,byte,extends,final,finally,implements,import,"+"instanceof,null,native,package,strictfp,super,synchronized,throws,"+"transient"];var CSHARP_KEYWORDS=[JAVA_KEYWORDS,"as,base,by,checked,decimal,delegate,descending,dynamic,event,"+"fixed,foreach,from,group,implicit,in,interface,internal,into,is,let,"+"lock,object,out,override,orderby,params,partial,readonly,ref,sbyte,"+"sealed,stackalloc,string,select,uint,ulong,unchecked,unsafe,ushort,"+"var,virtual,where"];var COFFEE_KEYWORDS="all,and,by,catch,class,else,extends,false,finally,"+"for,if,in,is,isnt,loop,new,no,not,null,of,off,on,or,return,super,then,"+"throw,true,try,unless,until,when,while,yes";var JSCRIPT_KEYWORDS=[COMMON_KEYWORDS,"debugger,eval,export,function,get,null,set,undefined,var,with,"+"Infinity,NaN"];var PERL_KEYWORDS="caller,delete,die,do,dump,elsif,eval,exit,foreach,for,"+"goto,if,import,last,local,my,next,no,our,print,package,redo,require,"+"sub,undef,unless,until,use,wantarray,while,BEGIN,END";var PYTHON_KEYWORDS=[FLOW_CONTROL_KEYWORDS,"and,as,assert,class,def,del,"+"elif,except,exec,finally,from,global,import,in,is,lambda,"+"nonlocal,not,or,pass,print,raise,try,with,yield,"+"False,True,None"];var RUBY_KEYWORDS=[FLOW_CONTROL_KEYWORDS,"alias,and,begin,case,class,"+"def,defined,elsif,end,ensure,false,in,module,next,nil,not,or,redo,"+"rescue,retry,self,super,then,true,undef,unless,until,when,yield,"+"BEGIN,END"];var SH_KEYWORDS=[FLOW_CONTROL_KEYWORDS,"case,done,elif,esac,eval,fi,"+"function,in,local,set,then,until"];var ALL_KEYWORDS=[CPP_KEYWORDS,CSHARP_KEYWORDS,JSCRIPT_KEYWORDS,PERL_KEYWORDS+
PYTHON_KEYWORDS,RUBY_KEYWORDS,SH_KEYWORDS];var C_TYPES=/^(DIR|FILE|vector|(de|priority_)?queue|list|stack|(const_)?iterator|(multi)?(set|map)|bitset|u?(int|float)\d*)\b/;var PR_STRING='str';var PR_KEYWORD='kwd';var PR_COMMENT='com';var PR_TYPE='typ';var PR_LITERAL='lit';var PR_PUNCTUATION='pun';var PR_PLAIN='pln';var PR_TAG='tag';var PR_DECLARATION='dec';var PR_SOURCE='src';var PR_ATTRIB_NAME='atn';var PR_ATTRIB_VALUE='atv';var PR_NOCODE='nocode';var REGEXP_PRECEDER_PATTERN='(?:^^\\.?|[+-]|[!=]=?=?|\\#|%=?|&&?=?|\\(|\\*=?|[+\\-]=|->|\\/=?|::?|<<?=?|>>?>?=?|,|;|\\?|@|\\[|~|{|\\^\\^?=?|\\|\\|?=?|break|case|continue|delete|do|else|finally|instanceof|return|throw|try|typeof)\\s*';function combinePrefixPatterns(regexs){var capturedGroupIndex=0;var needToFoldCase=false;var ignoreCase=false;for(var i=0,n=regexs.length;i<n;++i){var regex=regexs[i];if(regex.ignoreCase){ignoreCase=true;}else if(/[a-z]/i.test(regex.source.replace(/\\u[0-9a-f]{4}|\\x[0-9a-f]{2}|\\[^ux]/gi,''))){needToFoldCase=true;ignoreCase=false;break;}}
var escapeCharToCodeUnit={'b':8,'t':9,'n':0xa,'v':0xb,'f':0xc,'r':0xd};function decodeEscape(charsetPart){var cc0=charsetPart.charCodeAt(0);if(cc0!==92){return cc0;}
var c1=charsetPart.charAt(1);cc0=escapeCharToCodeUnit[c1];if(cc0){return cc0;}else if('0'<=c1&&c1<='7'){return parseInt(charsetPart.substring(1),8);}else if(c1==='u'||c1==='x'){return parseInt(charsetPart.substring(2),16);}else{return charsetPart.charCodeAt(1);}}
function encodeEscape(charCode){if(charCode<0x20){return(charCode<0x10?'\\x0':'\\x')+charCode.toString(16);}
var ch=String.fromCharCode(charCode);return(ch==='\\'||ch==='-'||ch===']'||ch==='^')?"\\"+ch:ch;}
function caseFoldCharset(charSet){var charsetParts=charSet.substring(1,charSet.length-1).match(new RegExp('\\\\u[0-9A-Fa-f]{4}'
+'|\\\\x[0-9A-Fa-f]{2}'
+'|\\\\[0-3][0-7]{0,2}'
+'|\\\\[0-7]{1,2}'
+'|\\\\[\\s\\S]'
+'|-'
+'|[^-\\\\]','g'));var ranges=[];var inverse=charsetParts[0]==='^';var out=['['];if(inverse){out.push('^');}
for(var i=inverse?1:0,n=charsetParts.length;i<n;++i){var p=charsetParts[i];if(/\\[bdsw]/i.test(p)){out.push(p);}else{var start=decodeEscape(p);var end;if(i+2<n&&'-'===charsetParts[i+1]){end=decodeEscape(charsetParts[i+2]);i+=2;}else{end=start;}
ranges.push([start,end]);if(!(end<65||start>122)){if(!(end<65||start>90)){ranges.push([Math.max(65,start)|32,Math.min(end,90)|32]);}
if(!(end<97||start>122)){ranges.push([Math.max(97,start)&~32,Math.min(end,122)&~32]);}}}}
ranges.sort(function(a,b){return(a[0]-b[0])||(b[1]-a[1]);});var consolidatedRanges=[];var lastRange=[];for(var i=0;i<ranges.length;++i){var range=ranges[i];if(range[0]<=lastRange[1]+1){lastRange[1]=Math.max(lastRange[1],range[1]);}else{consolidatedRanges.push(lastRange=range);}}
for(var i=0;i<consolidatedRanges.length;++i){var range=consolidatedRanges[i];out.push(encodeEscape(range[0]));if(range[1]>range[0]){if(range[1]+1>range[0]){out.push('-');}
out.push(encodeEscape(range[1]));}}
out.push(']');return out.join('');}
function allowAnywhereFoldCaseAndRenumberGroups(regex){var parts=regex.source.match(new RegExp('(?:'
+'\\[(?:[^\\x5C\\x5D]|\\\\[\\s\\S])*\\]'
+'|\\\\u[A-Fa-f0-9]{4}'
+'|\\\\x[A-Fa-f0-9]{2}'
+'|\\\\[0-9]+'
+'|\\\\[^ux0-9]'
+'|\\(\\?[:!=]'
+'|[\\(\\)\\^]'
+'|[^\\x5B\\x5C\\(\\)\\^]+'
+')','g'));var n=parts.length;var capturedGroups=[];for(var i=0,groupIndex=0;i<n;++i){var p=parts[i];if(p==='('){++groupIndex;}else if('\\'===p.charAt(0)){var decimalValue=+p.substring(1);if(decimalValue){if(decimalValue<=groupIndex){capturedGroups[decimalValue]=-1;}else{parts[i]=encodeEscape(decimalValue);}}}}
for(var i=1;i<capturedGroups.length;++i){if(-1===capturedGroups[i]){capturedGroups[i]=++capturedGroupIndex;}}
for(var i=0,groupIndex=0;i<n;++i){var p=parts[i];if(p==='('){++groupIndex;if(!capturedGroups[groupIndex]){parts[i]='(?:';}}else if('\\'===p.charAt(0)){var decimalValue=+p.substring(1);if(decimalValue&&decimalValue<=groupIndex){parts[i]='\\'+capturedGroups[decimalValue];}}}
for(var i=0;i<n;++i){if('^'===parts[i]&&'^'!==parts[i+1]){parts[i]='';}}
if(regex.ignoreCase&&needToFoldCase){for(var i=0;i<n;++i){var p=parts[i];var ch0=p.charAt(0);if(p.length>=2&&ch0==='['){parts[i]=caseFoldCharset(p);}else if(ch0!=='\\'){parts[i]=p.replace(/[a-zA-Z]/g,function(ch){var cc=ch.charCodeAt(0);return'['+String.fromCharCode(cc&~32,cc|32)+']';});}}}
return parts.join('');}
var rewritten=[];for(var i=0,n=regexs.length;i<n;++i){var regex=regexs[i];if(regex.global||regex.multiline){throw new Error(''+regex);}
rewritten.push('(?:'+allowAnywhereFoldCaseAndRenumberGroups(regex)+')');}
return new RegExp(rewritten.join('|'),ignoreCase?'gi':'g');}
function extractSourceSpans(node,isPreformatted){var nocode=/(?:^|\s)nocode(?:\s|$)/;var chunks=[];var length=0;var spans=[];var k=0;function walk(node){switch(node.nodeType){case 1:if(nocode.test(node.className)){return;}
for(var child=node.firstChild;child;child=child.nextSibling){walk(child);}
var nodeName=node.nodeName.toLowerCase();if('br'===nodeName||'li'===nodeName){chunks[k]='\n';spans[k<<1]=length++;spans[(k++<<1)|1]=node;}
break;case 3:case 4:var text=node.nodeValue;if(text.length){if(!isPreformatted){text=text.replace(/[ \t\r\n]+/g,' ');}else{text=text.replace(/\r\n?/g,'\n');}
chunks[k]=text;spans[k<<1]=length;length+=text.length;spans[(k++<<1)|1]=node;}
break;}}
walk(node);return{sourceCode:chunks.join('').replace(/\n$/,''),spans:spans};}
function appendDecorations(basePos,sourceCode,langHandler,out){if(!sourceCode){return;}
var job={sourceCode:sourceCode,basePos:basePos};langHandler(job);out.push.apply(out,job.decorations);}
var notWs=/\S/;function childContentWrapper(element){var wrapper=undefined;for(var c=element.firstChild;c;c=c.nextSibling){var type=c.nodeType;wrapper=(type===1)?(wrapper?element:c):(type===3)?(notWs.test(c.nodeValue)?element:wrapper):wrapper;}
return wrapper===element?undefined:wrapper;}
function createSimpleLexer(shortcutStylePatterns,fallthroughStylePatterns){var shortcuts={};var tokenizer;(function(){var allPatterns=shortcutStylePatterns.concat(fallthroughStylePatterns);var allRegexs=[];var regexKeys={};for(var i=0,n=allPatterns.length;i<n;++i){var patternParts=allPatterns[i];var shortcutChars=patternParts[3];if(shortcutChars){for(var c=shortcutChars.length;--c>=0;){shortcuts[shortcutChars.charAt(c)]=patternParts;}}
var regex=patternParts[1];var k=''+regex;if(!regexKeys.hasOwnProperty(k)){allRegexs.push(regex);regexKeys[k]=null;}}
allRegexs.push(/[\0-\uffff]/);tokenizer=combinePrefixPatterns(allRegexs);})();var nPatterns=fallthroughStylePatterns.length;var decorate=function(job){var sourceCode=job.sourceCode,basePos=job.basePos;var decorations=[basePos,PR_PLAIN];var pos=0;var tokens=sourceCode.match(tokenizer)||[];var styleCache={};for(var ti=0,nTokens=tokens.length;ti<nTokens;++ti){var token=tokens[ti];var style=styleCache[token];var match=void 0;var isEmbedded;if(typeof style==='string'){isEmbedded=false;}else{var patternParts=shortcuts[token.charAt(0)];if(patternParts){match=token.match(patternParts[1]);style=patternParts[0];}else{for(var i=0;i<nPatterns;++i){patternParts=fallthroughStylePatterns[i];match=token.match(patternParts[1]);if(match){style=patternParts[0];break;}}
if(!match){style=PR_PLAIN;}}
isEmbedded=style.length>=5&&'lang-'===style.substring(0,5);if(isEmbedded&&!(match&&typeof match[1]==='string')){isEmbedded=false;style=PR_SOURCE;}
if(!isEmbedded){styleCache[token]=style;}}
var tokenStart=pos;pos+=token.length;if(!isEmbedded){decorations.push(basePos+tokenStart,style);}else{var embeddedSource=match[1];var embeddedSourceStart=token.indexOf(embeddedSource);var embeddedSourceEnd=embeddedSourceStart+embeddedSource.length;if(match[2]){embeddedSourceEnd=token.length-match[2].length;embeddedSourceStart=embeddedSourceEnd-embeddedSource.length;}
var lang=style.substring(5);appendDecorations(basePos+tokenStart,token.substring(0,embeddedSourceStart),decorate,decorations);appendDecorations(basePos+tokenStart+embeddedSourceStart,embeddedSource,langHandlerForExtension(lang,embeddedSource),decorations);appendDecorations(basePos+tokenStart+embeddedSourceEnd,token.substring(embeddedSourceEnd),decorate,decorations);}}
job.decorations=decorations;};return decorate;}
function sourceDecorator(options){var shortcutStylePatterns=[],fallthroughStylePatterns=[];if(options['tripleQuotedStrings']){shortcutStylePatterns.push([PR_STRING,/^(?:\'\'\'(?:[^\'\\]|\\[\s\S]|\'{1,2}(?=[^\']))*(?:\'\'\'|$)|\"\"\"(?:[^\"\\]|\\[\s\S]|\"{1,2}(?=[^\"]))*(?:\"\"\"|$)|\'(?:[^\\\']|\\[\s\S])*(?:\'|$)|\"(?:[^\\\"]|\\[\s\S])*(?:\"|$))/,null,'\'"']);}else if(options['multiLineStrings']){shortcutStylePatterns.push([PR_STRING,/^(?:\'(?:[^\\\']|\\[\s\S])*(?:\'|$)|\"(?:[^\\\"]|\\[\s\S])*(?:\"|$)|\`(?:[^\\\`]|\\[\s\S])*(?:\`|$))/,null,'\'"`']);}else{shortcutStylePatterns.push([PR_STRING,/^(?:\'(?:[^\\\'\r\n]|\\.)*(?:\'|$)|\"(?:[^\\\"\r\n]|\\.)*(?:\"|$))/,null,'"\'']);}
if(options['verbatimStrings']){fallthroughStylePatterns.push([PR_STRING,/^@\"(?:[^\"]|\"\")*(?:\"|$)/,null]);}
var hc=options['hashComments'];if(hc){if(options['cStyleComments']){if(hc>1){shortcutStylePatterns.push([PR_COMMENT,/^#(?:##(?:[^#]|#(?!##))*(?:###|$)|.*)/,null,'#']);}else{shortcutStylePatterns.push([PR_COMMENT,/^#(?:(?:define|e(?:l|nd)if|else|error|ifn?def|include|line|pragma|undef|warning)\b|[^\r\n]*)/,null,'#']);}
fallthroughStylePatterns.push([PR_STRING,/^<(?:(?:(?:\.\.\/)*|\/?)(?:[\w-]+(?:\/[\w-]+)+)?[\w-]+\.h(?:h|pp|\+\+)?|[a-z]\w*)>/,null]);}else{shortcutStylePatterns.push([PR_COMMENT,/^#[^\r\n]*/,null,'#']);}}
if(options['cStyleComments']){fallthroughStylePatterns.push([PR_COMMENT,/^\/\/[^\r\n]*/,null]);fallthroughStylePatterns.push([PR_COMMENT,/^\/\*[\s\S]*?(?:\*\/|$)/,null]);}
if(options['regexLiterals']){var REGEX_LITERAL=('/(?=[^/*])'
+'(?:[^/\\x5B\\x5C]'
+'|\\x5C[\\s\\S]'
+'|\\x5B(?:[^\\x5C\\x5D]|\\x5C[\\s\\S])*(?:\\x5D|$))+'
+'/');fallthroughStylePatterns.push(['lang-regex',new RegExp('^'+REGEXP_PRECEDER_PATTERN+'('+REGEX_LITERAL+')')]);}
var types=options['types'];if(types){fallthroughStylePatterns.push([PR_TYPE,types]);}
var keywords=(""+options['keywords']).replace(/^ | $/g,'');if(keywords.length){fallthroughStylePatterns.push([PR_KEYWORD,new RegExp('^(?:'+keywords.replace(/[\s,]+/g,'|')+')\\b'),null]);}
shortcutStylePatterns.push([PR_PLAIN,/^\s+/,null,' \r\n\t\xA0']);var punctuation=/^.[^\s\w\.$@\'\"\`\/\\]*/;fallthroughStylePatterns.push([PR_LITERAL,/^@[a-z_$][a-z_$@0-9]*/i,null],[PR_TYPE,/^(?:[@_]?[A-Z]+[a-z][A-Za-z_$@0-9]*|\w+_t\b)/,null],[PR_PLAIN,/^[a-z_$][a-z_$@0-9]*/i,null],[PR_LITERAL,new RegExp('^(?:'
+'0x[a-f0-9]+'
+'|(?:\\d(?:_\\d+)*\\d*(?:\\.\\d*)?|\\.\\d\\+)'
+'(?:e[+\\-]?\\d+)?'
+')'
+'[a-z]*','i'),null,'0123456789'],[PR_PLAIN,/^\\[\s\S]?/,null],[PR_PUNCTUATION,punctuation,null]);return createSimpleLexer(shortcutStylePatterns,fallthroughStylePatterns);}
var decorateSource=sourceDecorator({'keywords':ALL_KEYWORDS,'hashComments':true,'cStyleComments':true,'multiLineStrings':true,'regexLiterals':true});function numberLines(node,opt_startLineNum,isPreformatted){var nocode=/(?:^|\s)nocode(?:\s|$)/;var lineBreak=/\r\n?|\n/;var document=node.ownerDocument;var li=document.createElement('li');while(node.firstChild){li.appendChild(node.firstChild);}
var listItems=[li];function walk(node){switch(node.nodeType){case 1:if(nocode.test(node.className)){break;}
if('br'===node.nodeName){breakAfter(node);if(node.parentNode){node.parentNode.removeChild(node);}}else{for(var child=node.firstChild;child;child=child.nextSibling){walk(child);}}
break;case 3:case 4:if(isPreformatted){var text=node.nodeValue;var match=text.match(lineBreak);if(match){var firstLine=text.substring(0,match.index);node.nodeValue=firstLine;var tail=text.substring(match.index+match[0].length);if(tail){var parent=node.parentNode;parent.insertBefore(document.createTextNode(tail),node.nextSibling);}
breakAfter(node);if(!firstLine){node.parentNode.removeChild(node);}}}
break;}}
function breakAfter(lineEndNode){while(!lineEndNode.nextSibling){lineEndNode=lineEndNode.parentNode;if(!lineEndNode){return;}}
function breakLeftOf(limit,copy){var rightSide=copy?limit.cloneNode(false):limit;var parent=limit.parentNode;if(parent){var parentClone=breakLeftOf(parent,1);var next=limit.nextSibling;parentClone.appendChild(rightSide);for(var sibling=next;sibling;sibling=next){next=sibling.nextSibling;parentClone.appendChild(sibling);}}
return rightSide;}
var copiedListItem=breakLeftOf(lineEndNode.nextSibling,0);for(var parent;(parent=copiedListItem.parentNode)&&parent.nodeType===1;){copiedListItem=parent;}
listItems.push(copiedListItem);}
for(var i=0;i<listItems.length;++i){walk(listItems[i]);}
if(opt_startLineNum===(opt_startLineNum|0)){listItems[0].setAttribute('value',opt_startLineNum);}
var ol=document.createElement('ol');ol.className='linenums';var offset=Math.max(0,((opt_startLineNum-1))|0)||0;for(var i=0,n=listItems.length;i<n;++i){li=listItems[i];li.className='L'+((i+offset)%10);if(!li.firstChild){li.appendChild(document.createTextNode('\xA0'));}
ol.appendChild(li);}
node.appendChild(ol);}
function recombineTagsAndDecorations(job){var isIE8OrEarlier=/\bMSIE\s(\d+)/.exec(navigator.userAgent);isIE8OrEarlier=isIE8OrEarlier&&+isIE8OrEarlier[1]<=8;var newlineRe=/\n/g;var source=job.sourceCode;var sourceLength=source.length;var sourceIndex=0;var spans=job.spans;var nSpans=spans.length;var spanIndex=0;var decorations=job.decorations;var nDecorations=decorations.length;var decorationIndex=0;decorations[nDecorations]=sourceLength;var decPos,i;for(i=decPos=0;i<nDecorations;){if(decorations[i]!==decorations[i+2]){decorations[decPos++]=decorations[i++];decorations[decPos++]=decorations[i++];}else{i+=2;}}
nDecorations=decPos;for(i=decPos=0;i<nDecorations;){var startPos=decorations[i];var startDec=decorations[i+1];var end=i+2;while(end+2<=nDecorations&&decorations[end+1]===startDec){end+=2;}
decorations[decPos++]=startPos;decorations[decPos++]=startDec;i=end;}
nDecorations=decorations.length=decPos;var sourceNode=job.sourceNode;var oldDisplay;if(sourceNode){oldDisplay=sourceNode.style.display;sourceNode.style.display='none';}
try{var decoration=null;while(spanIndex<nSpans){var spanStart=spans[spanIndex];var spanEnd=spans[spanIndex+2]||sourceLength;var decEnd=decorations[decorationIndex+2]||sourceLength;var end=Math.min(spanEnd,decEnd);var textNode=spans[spanIndex+1];var styledText;if(textNode.nodeType!==1&&(styledText=source.substring(sourceIndex,end))){if(isIE8OrEarlier){styledText=styledText.replace(newlineRe,'\r');}
textNode.nodeValue=styledText;var document=textNode.ownerDocument;var span=document.createElement('span');span.className=decorations[decorationIndex+1];var parentNode=textNode.parentNode;parentNode.replaceChild(span,textNode);span.appendChild(textNode);if(sourceIndex<spanEnd){spans[spanIndex+1]=textNode=document.createTextNode(source.substring(end,spanEnd));parentNode.insertBefore(textNode,span.nextSibling);}}
sourceIndex=end;if(sourceIndex>=spanEnd){spanIndex+=2;}
if(sourceIndex>=decEnd){decorationIndex+=2;}}}finally{if(sourceNode){sourceNode.style.display=oldDisplay;}}}
var langHandlerRegistry={};function registerLangHandler(handler,fileExtensions){for(var i=fileExtensions.length;--i>=0;){var ext=fileExtensions[i];if(!langHandlerRegistry.hasOwnProperty(ext)){langHandlerRegistry[ext]=handler;}else if(win['console']){console['warn']('cannot override language handler %s',ext);}}}
function langHandlerForExtension(extension,source){if(!(extension&&langHandlerRegistry.hasOwnProperty(extension))){extension=/^\s*</.test(source)?'default-markup':'default-code';}
return langHandlerRegistry[extension];}
registerLangHandler(decorateSource,['default-code']);registerLangHandler(createSimpleLexer([],[[PR_PLAIN,/^[^<?]+/],[PR_DECLARATION,/^<!\w[^>]*(?:>|$)/],[PR_COMMENT,/^<\!--[\s\S]*?(?:-\->|$)/],['lang-',/^<\?([\s\S]+?)(?:\?>|$)/],['lang-',/^<%([\s\S]+?)(?:%>|$)/],[PR_PUNCTUATION,/^(?:<[%?]|[%?]>)/],['lang-',/^<xmp\b[^>]*>([\s\S]+?)<\/xmp\b[^>]*>/i],['lang-js',/^<script\b[^>]*>([\s\S]*?)(<\/script\b[^>]*>)/i],['lang-css',/^<style\b[^>]*>([\s\S]*?)(<\/style\b[^>]*>)/i],['lang-in.tag',/^(<\/?[a-z][^<>]*>)/i]]),['default-markup','htm','html','mxml','xhtml','xml','xsl']);registerLangHandler(createSimpleLexer([[PR_PLAIN,/^[\s]+/,null,' \t\r\n'],[PR_ATTRIB_VALUE,/^(?:\"[^\"]*\"?|\'[^\']*\'?)/,null,'\"\'']],[[PR_TAG,/^^<\/?[a-z](?:[\w.:-]*\w)?|\/?>$/i],[PR_ATTRIB_NAME,/^(?!style[\s=]|on)[a-z](?:[\w:-]*\w)?/i],['lang-uq.val',/^=\s*([^>\'\"\s]*(?:[^>\'\"\s\/]|\/(?=\s)))/],[PR_PUNCTUATION,/^[=<>\/]+/],['lang-js',/^on\w+\s*=\s*\"([^\"]+)\"/i],['lang-js',/^on\w+\s*=\s*\'([^\']+)\'/i],['lang-js',/^on\w+\s*=\s*([^\"\'>\s]+)/i],['lang-css',/^style\s*=\s*\"([^\"]+)\"/i],['lang-css',/^style\s*=\s*\'([^\']+)\'/i],['lang-css',/^style\s*=\s*([^\"\'>\s]+)/i]]),['in.tag']);registerLangHandler(createSimpleLexer([],[[PR_ATTRIB_VALUE,/^[\s\S]+/]]),['uq.val']);registerLangHandler(sourceDecorator({'keywords':CPP_KEYWORDS,'hashComments':true,'cStyleComments':true,'types':C_TYPES}),['c','cc','cpp','cxx','cyc','m']);registerLangHandler(sourceDecorator({'keywords':'null,true,false'}),['json']);registerLangHandler(sourceDecorator({'keywords':CSHARP_KEYWORDS,'hashComments':true,'cStyleComments':true,'verbatimStrings':true,'types':C_TYPES}),['cs']);registerLangHandler(sourceDecorator({'keywords':JAVA_KEYWORDS,'cStyleComments':true}),['java']);registerLangHandler(sourceDecorator({'keywords':SH_KEYWORDS,'hashComments':true,'multiLineStrings':true}),['bsh','csh','sh']);registerLangHandler(sourceDecorator({'keywords':PYTHON_KEYWORDS,'hashComments':true,'multiLineStrings':true,'tripleQuotedStrings':true}),['cv','py']);registerLangHandler(sourceDecorator({'keywords':PERL_KEYWORDS,'hashComments':true,'multiLineStrings':true,'regexLiterals':true}),['perl','pl','pm']);registerLangHandler(sourceDecorator({'keywords':RUBY_KEYWORDS,'hashComments':true,'multiLineStrings':true,'regexLiterals':true}),['rb']);registerLangHandler(sourceDecorator({'keywords':JSCRIPT_KEYWORDS,'cStyleComments':true,'regexLiterals':true}),['js']);registerLangHandler(sourceDecorator({'keywords':COFFEE_KEYWORDS,'hashComments':3,'cStyleComments':true,'multilineStrings':true,'tripleQuotedStrings':true,'regexLiterals':true}),['coffee']);registerLangHandler(createSimpleLexer([],[[PR_STRING,/^[\s\S]+/]]),['regex']);function applyDecorator(job){var opt_langExtension=job.langExtension;try{var sourceAndSpans=extractSourceSpans(job.sourceNode,job.pre);var source=sourceAndSpans.sourceCode;job.sourceCode=source;job.spans=sourceAndSpans.spans;job.basePos=0;langHandlerForExtension(opt_langExtension,source)(job);recombineTagsAndDecorations(job);}catch(e){if(win['console']){console['log'](e&&e['stack']?e['stack']:e);}}}
function prettyPrintOne(sourceCodeHtml,opt_langExtension,opt_numberLines){var container=document.createElement('pre');container.innerHTML=sourceCodeHtml;if(opt_numberLines){numberLines(container,opt_numberLines,true);}
var job={langExtension:opt_langExtension,numberLines:opt_numberLines,sourceNode:container,pre:1};applyDecorator(job);return container.innerHTML;}
function prettyPrint(opt_whenDone){function byTagName(tn){return document.getElementsByTagName(tn);}
var codeSegments=[byTagName('pre'),byTagName('code'),byTagName('xmp')];var elements=[];for(var i=0;i<codeSegments.length;++i){for(var j=0,n=codeSegments[i].length;j<n;++j){elements.push(codeSegments[i][j]);}}
codeSegments=null;var clock=Date;if(!clock['now']){clock={'now':function(){return+(new Date);}};}
var k=0;var prettyPrintingJob;var langExtensionRe=/\blang(?:uage)?-([\w.]+)(?!\S)/;var prettyPrintRe=/\bprettyprint\b/;var prettyPrintedRe=/\bprettyprinted\b/;var preformattedTagNameRe=/pre|xmp/i;var codeRe=/^code$/i;var preCodeXmpRe=/^(?:pre|code|xmp)$/i;function doWork(){var endTime=(win['PR_SHOULD_USE_CONTINUATION']?clock['now']()+250:Infinity);for(;k<elements.length&&clock['now']()<endTime;k++){var cs=elements[k];var className=cs.className;if(prettyPrintRe.test(className)&&!prettyPrintedRe.test(className)){var nested=false;for(var p=cs.parentNode;p;p=p.parentNode){var tn=p.tagName;if(preCodeXmpRe.test(tn)&&p.className&&prettyPrintRe.test(p.className)){nested=true;break;}}
if(!nested){cs.className+=' prettyprinted';var langExtension=className.match(langExtensionRe);var wrapper;if(!langExtension&&(wrapper=childContentWrapper(cs))&&codeRe.test(wrapper.tagName)){langExtension=wrapper.className.match(langExtensionRe);}
if(langExtension){langExtension=langExtension[1];}
var preformatted;if(preformattedTagNameRe.test(cs.tagName)){preformatted=1;}else{var currentStyle=cs['currentStyle'];var whitespace=(currentStyle?currentStyle['whiteSpace']:(document.defaultView&&document.defaultView.getComputedStyle)?document.defaultView.getComputedStyle(cs,null).getPropertyValue('white-space'):0);preformatted=whitespace&&'pre'===whitespace.substring(0,3);}
var lineNums=cs.className.match(/\blinenums\b(?::(\d+))?/);lineNums=lineNums?lineNums[1]&&lineNums[1].length?+lineNums[1]:true:false;if(lineNums){numberLines(cs,lineNums,preformatted);}
prettyPrintingJob={langExtension:langExtension,sourceNode:cs,numberLines:lineNums,pre:preformatted};applyDecorator(prettyPrintingJob);}}}
if(k<elements.length){setTimeout(doWork,250);}else if(opt_whenDone){opt_whenDone();}}
doWork();}
var PR=win['PR']={'createSimpleLexer':createSimpleLexer,'registerLangHandler':registerLangHandler,'sourceDecorator':sourceDecorator,'PR_ATTRIB_NAME':PR_ATTRIB_NAME,'PR_ATTRIB_VALUE':PR_ATTRIB_VALUE,'PR_COMMENT':PR_COMMENT,'PR_DECLARATION':PR_DECLARATION,'PR_KEYWORD':PR_KEYWORD,'PR_LITERAL':PR_LITERAL,'PR_NOCODE':PR_NOCODE,'PR_PLAIN':PR_PLAIN,'PR_PUNCTUATION':PR_PUNCTUATION,'PR_SOURCE':PR_SOURCE,'PR_STRING':PR_STRING,'PR_TAG':PR_TAG,'PR_TYPE':PR_TYPE,'prettyPrintOne':win['prettyPrintOne']=prettyPrintOne,'prettyPrint':win['prettyPrint']=prettyPrint};if(typeof define==="function"&&define['amd']){define("google-code-prettify",[],function(){return PR;});}})();
;(function(window, document) {

  // Hide body until we're done fiddling with the DOM
  document.body.style.display = 'none';

  //////////////////////////////////////////////////////////////////////
  //
  // Shims for IE < 9
  //

  document.head = document.getElementsByTagName('head')[0];

  if (!('getElementsByClassName' in document)) {
    document.getElementsByClassName = function(name) {
      function getElementsByClassName(node, classname) {
        var a = [];
        var re = new RegExp('(^| )'+classname+'( |$)');
        var els = node.getElementsByTagName("*");
        for(var i=0,j=els.length; i<j; i++)
            if(re.test(els[i].className))a.push(els[i]);
        return a;
      }
      return getElementsByClassName(document.body, name);
    }
  }

  //////////////////////////////////////////////////////////////////////
  //
  // Get user elements we need
  //

  var markdownEl = document.getElementsByTagName('xmp')[0] || document.getElementsByTagName('textarea')[0],
      titleEl = document.getElementsByTagName('title')[0],
      scriptEls = document.getElementsByTagName('script'),
      navbarEl = document.getElementsByClassName('navbar')[0];

  //////////////////////////////////////////////////////////////////////
  //
  // <head> stuff
  //

  // Use <meta> viewport so that Bootstrap is actually responsive on mobile
  var metaEl = document.createElement('meta');
  metaEl.name = 'viewport';
  metaEl.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0';
  if (document.head.firstChild)
    document.head.insertBefore(metaEl, document.head.firstChild);
  else
    document.head.appendChild(metaEl);

  // Get origin of script
  var origin = '';
  for (var i = 0; i < scriptEls.length; i++) {
    if (scriptEls[i].src.match('strapdown')) {
      origin = scriptEls[i].src;
    }
  }
  var originBase = origin.substr(0, origin.lastIndexOf('/'));

  // Get theme
  var theme = markdownEl.getAttribute('theme') || 'bootstrap';
  theme = theme.toLowerCase();

  // Stylesheets
  var linkEl = document.createElement('link');
  linkEl.href = originBase + '/themes/'+theme+'.min.css';
  linkEl.rel = 'stylesheet';
  document.head.appendChild(linkEl);

//  var linkEl = document.createElement('link');
//  linkEl.href = originBase + '/strapdown.css';
//  linkEl.rel = 'stylesheet';
//  document.head.appendChild(linkEl);

//  var linkEl = document.createElement('link');
//  linkEl.href = originBase + '/themes/bootstrap-responsive.min.css';
//  linkEl.rel = 'stylesheet';
//  document.head.appendChild(linkEl);

  //////////////////////////////////////////////////////////////////////
  //
  // <body> stuff
  //


  var markdown = markdownEl.textContent || markdownEl.innerText;

  // ein wenig mehr und semantisches html fuer weitere Bearbeitung
  document.body.innerHTML = '<main class="grid w960"><div class="row" id="contentgrid"></div></main>';

  var newNode = document.createElement('div');
  newNode.className = 'container c11 s1';
  newNode.id = 'content';

  // der eigentliche Inhalt wird nun einem anderen Element zugewiesen.
  document.getElementById("contentgrid").appendChild(newNode, markdownEl);

  // Insert navbar if there's none
  var newNode = document.createElement('header');
  newNode.className = '';
  if (!navbarEl && titleEl) {
    newNode.innerHTML = '<div class="grid"><div class="row"> \
    <div class="c11 svgurbrand"><svg id="svg2"\
          xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"\
          xmlns="http://www.w3.org/2000/svg"\
          version="1.1"\
          xmlns:cc="http://creativecommons.org/ns#"\
          xmlns:xlink="http://www.w3.org/1999/xlink"\
          viewBox="0 0 800 160"\
          xmlns:dc="http://purl.org/dc/elements/1.1/">\
    \
    <style type="text/css">\
    svg#svg2 rect.item {\
      transition: all 0.2s ease;\
      opacity:0.8;\
      stroke-width:0.4px;\
      stroke-opacity:0.4;\
      cursor:pointer;\
    }\
    \
    svg#svg2 rect.item:hover {\
      opacity:1.0;\
      stroke-width:0.4px;\
      stroke-opacity:0.4;\
      -webkit-transform: scale(1,2);\
      -moz-transform:    scale(1,2);\
      -ms-transform:     scale(1,2);\
      -o-transform:      scale(1,2);\
      transform:         scale(1,2);\
    }\
    </style>\
    \
    \
    \
    <g\
         id="g3049"\
         inkscape:groupmode="layer"\
         inkscape:label="ink_ext_XXXXXX"\
         transform="matrix(1.25,0,0,-1.25,65,155)"><g\
           id="g3051"\
           transform="scale(0.0474,0.0474)"><path\
             d="m 1414.77,1212.62 261,0 c 86.9,0 151.4,-14.03 193.35,-42.26 42.1,-28.23 63.08,-71.12 63.08,-128.69 0,-42.576 -11.04,-77.432 -33.27,-104.873 -22.24,-27.43 -54.26,-45.719 -96.05,-55.035 34.38,-12.621 62.14,-48.41 83.11,-107.551 l 0,-0.481 78.54,-217.621 -182.47,0 -57.71,179.77 c -9.31,28.871 -21.93,48.902 -37.85,60.09 -16.09,11.043 -41.01,16.562 -74.91,16.562 l -25.39,0 0,-256.422 -171.43,0 0,656.511 z m 171.43,-115.43 0,-168.272 61.5,0 c 37.85,0 66.24,6.777 85.16,20.496 18.92,13.723 28.39,34.383 28.39,61.826 0,29.49 -10.57,51.25 -31.7,65.13 -20.98,13.88 -54.41,20.82 -99.99,20.82 l -43.36,0 0,0"\
             style="fill:#82858c;fill-opacity:1;fill-rule:nonzero;stroke:none"\
             id="path3053" /><path d="m 4122.17,178.289 c -7.23,4.102 -15.63,6.16 -25.14,6.16 -16.19,0 -29.33,-6.058 -39.43,-18.187 -10.1,-12.121 -15.14,-27.91 -15.14,-47.364 0,-19.2066 5.02,-34.6675 15.08,-46.3863 10.04,-11.7226 23.3,-17.582 39.73,-17.582 8.63,0 16.4,1.9297 23.32,5.75 6.91,3.8203 13.22,9.7617 18.92,17.8203 l 0,-13.8008 c 0,-12.7695 -3.69,-22.7695 -11.05,-29.9687 -7.37,-7.1992 -17.6,-10.7891 -30.71,-10.7891 -6.27,0 -12.73,0.8672 -19.39,2.6094 -6.68,1.75 -13.4,4.3008 -20.16,7.6289 l -1.95,-26.23829 c 7.17,-2.61328 14.47,-4.58203 21.91,-5.92188 C 4085.61,0.679688 4093.13,0 4100.68,0 c 23.7,0 41.37,5.78125 53.05,17.3516 11.68,11.539 17.52,29.0898 17.52,52.5976 l 0,111.1988 -30.27,0 0,-21.718 c -5.3,8.461 -11.57,14.75 -18.81,18.859 l 0,0 z m 7.58,-29.539 c 5.6,-7.281 8.41,-17.238 8.41,-29.852 0,-11.398 -2.91,-20.6871 -8.73,-27.8785 -5.82,-7.2187 -13.2,-10.8086 -22.14,-10.8086 -9.2,0 -16.55,3.6289 -22.06,10.918 -5.48,7.2813 -8.22,17.0701 -8.22,29.3591 0,11.801 2.74,21.282 8.22,28.453 5.51,7.161 12.74,10.731 21.68,10.731 9.59,0 17.21,-3.633 22.84,-10.922 l 0,0 z m -106.45,35.148 c -1.8,0.204 -3.42,0.313 -4.88,0.313 -8.46,0 -15.82,-2.359 -22.03,-7.082 -6.23,-4.719 -11.39,-11.801 -15.45,-21.238 l 0,25.257 -29.18,0 0,-126.6988 32.48,0 0,59.1988 c 0,13.602 2.81,23.942 8.42,31.071 5.62,7.133 13.79,10.679 24.53,10.679 2.03,0 4,-0.136 5.86,-0.429 1.87,-0.289 3.67,-0.707 5.37,-1.278 l 1.23,29.297 c -2.44,0.403 -4.57,0.711 -6.35,0.91 l 0,0 z m -229.86,-76.957 c 0,-17.8316 3.86,-31.3512 11.6,-40.5894 7.73,-9.2422 19.04,-13.8633 33.92,-13.8633 10.02,0 18.83,2.2226 26.45,6.6601 7.6,4.4414 13.77,10.961 18.48,19.5899 l 0,-24.2891 29.8,0 0,126.6988 -32.73,0 0,-56.507 c 0,-14.571 -2.54,-25.6918 -7.62,-33.391 -5.08,-7.6797 -12.48,-11.5312 -22.15,-11.5312 -8.55,0 -14.86,2.7617 -18.92,8.3007 -4.09,5.5391 -6.12,14.1605 -6.12,25.8715 l 0,67.257 -32.71,0 0,-74.207 z m -156.37,-52.4918 29.41,0 0,25.5117 c 4.73,-8.8593 10.96,-15.6718 18.68,-20.3906 7.73,-4.7187 16.52,-7.082 26.36,-7.082 15.96,0 28.99,6.25 39.07,18.7422 10.09,12.4883 15.15,28.75 15.15,48.7695 0,19.531 -4.96,35.16 -14.84,46.879 -9.88,11.723 -23.01,17.57 -39.38,17.57 -8.94,0 -16.93,-1.89 -23.98,-5.679 -7.03,-3.782 -12.95,-9.29 -17.75,-16.54 l 0,79.239 -32.72,0 0,-187.0198 z m 86.62,93.9918 c 5.41,-7.652 8.11,-17.902 8.11,-30.75 0,-12.222 -2.8,-21.9801 -8.36,-29.3121 -5.57,-7.3086 -12.97,-10.9805 -22.15,-10.9805 -9.61,0 -17.27,3.7032 -22.95,11.1133 -5.7,7.3985 -8.55,17.3673 -8.55,29.8983 0,12.86 2.91,22.988 8.73,30.399 5.82,7.402 13.73,11.101 23.73,11.101 8.86,0 16.01,-3.808 21.44,-11.469 l 0,0 z m -140.94,34.547 c -4.98,0.981 -9.47,1.461 -13.55,1.461 -15.29,0 -27.66,-3.5 -37.05,-10.488 -9.4,-7.012 -14.1,-16.082 -14.1,-27.231 0,-7.57 2.2,-13.992 6.6,-19.289 4.39,-5.293 12.85,-11.011 25.39,-17.203 0.08,-0.078 0.27,-0.207 0.6,-0.367 16.78,-8.383 25.16,-15.7108 25.16,-21.9804 0,-3.8203 -1.78,-6.8008 -5.31,-8.9609 -3.56,-2.168 -8.54,-3.2383 -14.96,-3.2383 -6.19,0 -12.44,0.7578 -18.73,2.2578 -6.31,1.5 -12.48,3.7617 -18.5,6.7696 l -1.84,-25.0196 c 5.94,-2.1211 12.23,-3.7304 18.85,-4.8281 6.64,-1.0898 13.46,-1.6406 20.47,-1.6406 16.58,0 29.69,3.5195 39.3,10.5586 9.61,7.0312 14.41,16.582 14.41,28.6211 0,8.5508 -2.58,15.7378 -7.69,21.5588 -5.14,5.812 -14.5,11.722 -28.09,17.75 -0.72,0.32 -1.83,0.812 -3.28,1.461 -13.28,5.859 -19.9,11.609 -19.9,17.211 0,3.75 1.56,6.609 4.68,8.621 3.15,1.988 7.64,2.976 13.5,2.976 5.37,0 10.78,-0.726 16.23,-2.187 5.47,-1.473 11,-3.672 16.6,-6.602 l 2.44,24.051 c -9.19,2.852 -16.27,4.762 -21.23,5.738 l 0,0 z m -106.21,-12.379 c -7.63,9.231 -18.9,13.84 -33.81,13.84 -10.02,0 -18.82,-2.219 -26.42,-6.648 -7.6,-4.442 -13.81,-10.961 -18.61,-19.59 l 0,22.937 -29.67,0 0,-126.6988 32.48,0 0,62.9808 c 0,12.289 2.67,22 8.04,29.121 5.38,7.121 12.62,10.679 21.72,10.679 8.56,0 14.85,-2.789 18.87,-8.359 4.02,-5.582 6.06,-14.223 6.06,-25.941 l 0,-68.4808 32.83,0 0,75.4418 c 0,17.898 -3.83,31.468 -11.49,40.718 l 0,0 z m -223.26,-41.461 c 1.23,10.75 4.57,19.114 10.02,25.09 5.45,5.992 12.36,8.973 20.74,8.973 8.23,0 14.91,-2.981 20.02,-8.973 5.14,-5.976 8.15,-14.34 9.05,-25.09 l -59.83,0 0,0 z m 73.93,38.161 c -10.22,11.421 -24.53,17.14 -42.91,17.14 -18.66,0 -33.75,-5.929 -45.35,-17.82 -11.61,-11.879 -17.41,-27.43 -17.41,-46.629 0,-21.5703 5.98,-38.4297 17.89,-50.5898 11.92,-12.1797 28.46,-18.2618 49.61,-18.2618 8.15,0 15.8,0.6329 22.97,1.8907 7.15,1.2812 13.83,3.1601 20.02,5.6797 l 0,25.0195 c -5.78,-3.0781 -11.8,-5.4102 -18.03,-6.9492 -6.21,-1.5391 -12.61,-2.3203 -19.21,-2.3203 -12.06,0 -21.74,3.0703 -29.13,9.2109 -7.34,6.1601 -11.48,14.5508 -12.38,25.2113 l 89.24,0 0,10.25 c 0,20.679 -5.1,36.73 -15.31,48.168 l 0,0 z m -182.19,10.98 c -7.27,4.102 -15.64,6.16 -25.16,6.16 -16.19,0 -29.33,-6.058 -39.43,-18.187 -10.08,-12.121 -15.14,-27.91 -15.14,-47.364 0,-19.2066 5.04,-34.6675 15.08,-46.3863 10.06,-11.7226 23.3,-17.582 39.75,-17.582 8.61,0 16.38,1.9297 23.3,5.75 6.93,3.8203 13.22,9.7617 18.92,17.8203 l 0,-13.8008 c 0,-12.7695 -3.67,-22.7695 -11.05,-29.9687 -7.36,-7.1992 -17.58,-10.7891 -30.7,-10.7891 -6.25,0 -12.72,0.8672 -19.4,2.6094 -6.68,1.75 -13.4,4.3008 -20.15,7.6289 L 3079.1,7.94141 C 3086.25,5.32813 3093.55,3.35938 3101,2.01953 3108.46,0.679688 3115.96,0 3123.52,0 c 23.69,0 41.36,5.78125 53.04,17.3516 11.68,11.539 17.52,29.0898 17.52,52.5976 l 0,111.1988 -30.27,0 0,-21.718 c -5.29,8.461 -11.56,14.75 -18.79,18.859 l 0,0 z m 7.56,-29.539 c 5.6,-7.281 8.42,-17.238 8.42,-29.852 0,-11.398 -2.91,-20.6871 -8.73,-27.8785 -5.82,-7.2187 -13.21,-10.8086 -22.15,-10.8086 -9.2,0 -16.55,3.6289 -22.03,10.918 -5.49,7.2813 -8.25,17.0701 -8.25,29.3591 0,11.801 2.76,21.282 8.25,28.453 5.48,7.161 12.71,10.731 21.66,10.731 9.61,0 17.2,-3.633 22.83,-10.922 l 0,0 z m -193.97,-19.602 c 1.21,10.75 4.55,19.114 10,25.09 5.45,5.992 12.39,8.973 20.77,8.973 8.22,0 14.88,-2.981 20.01,-8.973 5.14,-5.976 8.15,-14.34 9.03,-25.09 l -59.81,0 0,0 z m 73.91,38.161 c -10.22,11.421 -24.51,17.14 -42.91,17.14 -18.63,0 -33.75,-5.929 -45.33,-17.82 -11.6,-11.879 -17.4,-27.43 -17.4,-46.629 0,-21.5703 5.95,-38.4297 17.87,-50.5898 11.93,-12.1797 28.45,-18.2618 49.63,-18.2618 8.14,0 15.78,0.6329 22.94,1.8907 7.17,1.2812 13.85,3.1601 20.02,5.6797 l 0,25.0195 c -5.78,-3.0781 -11.77,-5.4102 -18,-6.9492 -6.23,-1.5391 -12.64,-2.3203 -19.22,-2.3203 -12.05,0 -21.76,3.0703 -29.12,9.2109 -7.37,6.1601 -11.49,14.5508 -12.39,25.2113 l 89.24,0 0,10.25 c 0,20.679 -5.12,36.73 -15.33,48.168 l 0,0 z m -249.08,-112.8598 33.69,0 0,72.7498 10.74,0 c 8.63,0 15.14,-1.488 19.53,-4.449 4.4,-2.969 7.99,-8.25 10.74,-15.809 l 19.54,-52.4918 36.01,0 -24.04,60.3128 c -3.75,9.347 -7.15,15.648 -10.2,18.91 -3.04,3.258 -7.07,5.699 -12.03,7.328 11.64,2.441 20.59,7.301 26.86,14.59 6.27,7.269 9.41,16.488 9.41,27.64 0,14.899 -5.29,26.059 -15.88,33.508 -10.58,7.442 -26.44,11.172 -47.61,11.172 l -56.76,0 0,-173.4608 z m 48.71,149.2888 c 12.85,0 22.26,-2.097 28.26,-6.289 5.98,-4.187 8.97,-10.758 8.97,-19.699 0,-8.391 -3.01,-14.871 -9.03,-19.422 -6.03,-4.558 -14.57,-6.828 -25.64,-6.828 l -17.58,0 0,52.238 15.02,0 0,0 z m -211.17,8.192 0,-30.782 -26.49,0 0,-23.918 25.02,0 0,-57.4995 c 0,-17.25 3.24,-29.5821 9.77,-36.9688 6.5,-7.4219 17.24,-11.1211 32.2,-11.1211 3.75,0 7.54,0.25 11.37,0.7305 3.83,0.4883 7.52,1.2305 11.1,2.1992 l -0.47,22.8281 c -2.39,-0.7382 -4.61,-1.289 -6.72,-1.6484 -2.13,-0.3711 -4.05,-0.5391 -5.74,-0.5391 -6.68,0 -11.47,2.0508 -14.4,6.1485 -2.93,4.1094 -4.39,10.9023 -4.39,20.3316 l 0,55.539 30.5,0 0,23.918 -30.5,0 0,41.262 -31.25,-10.48 0,0 z m -135.14,-6.481 25.14,0 0,27.723 -25.14,0 0,-27.723 z m 42.23,0 25.15,0 0,27.723 -25.15,0 0,-27.723 z m 32.05,-34.84 c -8.75,9.231 -22.64,13.84 -41.68,13.84 -7.42,0 -14.77,-0.73 -22.11,-2.187 -7.33,-1.473 -14.77,-3.742 -22.35,-6.84 l 0.51,-23.203 c 6.43,3.429 12.68,5.992 18.73,7.691 6.06,1.711 11.9,2.57 17.52,2.57 9.92,0 17.62,-2.378 23.07,-7.14 5.45,-4.75 8.18,-11.461 8.18,-20.078 l 0,-1.832 -16.74,0 c -22.2,0 -38.88,-3.532 -50.04,-10.559 -11.15,-7.043 -16.71,-17.601 -16.71,-31.6796 0,-11.793 3.9,-21.4101 11.71,-28.8633 7.82,-7.457 18.07,-11.1797 30.77,-11.1797 8.86,0 16.93,2.0313 24.16,6.043 7.24,4.0274 13.51,9.9492 18.81,17.7578 l 0.48,-20.5 28.81,0 0,72.2618 c 0,20.019 -4.37,34.648 -13.12,43.898 l 0,0 z m -18.13,-55.621 0,-6.816 c 0,-10.0118 -2.89,-18.1837 -8.67,-24.4923 -5.78,-6.3086 -13.14,-9.4609 -22.09,-9.4609 -6.19,0 -11.19,1.7304 -15.02,5.2031 -3.83,3.4492 -5.74,7.9375 -5.74,13.4765 0,7.3316 3.36,12.8316 10.08,16.5426 6.72,3.707 16.7,5.547 29.96,5.547 l 11.48,0 0,0 z m -162.22,96.942 0,-30.782 -26.49,0 0,-23.918 25.02,0 0,-57.4995 c 0,-17.25 3.24,-29.5821 9.77,-36.9688 6.5,-7.4219 17.24,-11.1211 32.2,-11.1211 3.75,0 7.54,0.25 11.37,0.7305 3.83,0.4883 7.52,1.2305 11.11,2.1992 l -0.48,22.8281 c -2.37,-0.7382 -4.61,-1.289 -6.72,-1.6484 -2.11,-0.3711 -4.05,-0.5391 -5.75,-0.5391 -6.67,0 -11.46,2.0508 -14.39,6.1485 -2.93,4.1094 -4.39,10.9023 -4.39,20.3316 l 0,55.539 30.5,0 0,23.918 -30.5,0 0,41.262 -31.25,-10.48 0,0 z m -82.15,-5.5 32.46,0 0,31.492 -32.46,0 0,-31.492 z m 0,-151.9808 32.46,0 0,126.6988 -32.46,0 0,-126.6988 z m -54.34,128.5388 c -4.96,0.981 -9.47,1.461 -13.55,1.461 -15.3,0 -27.64,-3.5 -37.03,-10.488 -9.4,-7.012 -14.11,-16.082 -14.11,-27.231 0,-7.57 2.19,-13.992 6.59,-19.289 4.39,-5.293 12.87,-11.011 25.39,-17.203 0.07,-0.078 0.29,-0.207 0.62,-0.367 16.76,-8.383 25.14,-15.7108 25.14,-21.9804 0,-3.8203 -1.76,-6.8008 -5.31,-8.9609 -3.54,-2.168 -8.52,-3.2383 -14.97,-3.2383 -6.17,0 -12.42,0.7578 -18.73,2.2578 -6.3,1.5 -12.48,3.7617 -18.49,6.7696 l -1.82,-25.0196 c 5.94,-2.1211 12.23,-3.7304 18.85,-4.8281 6.64,-1.0898 13.46,-1.6406 20.45,-1.6406 16.6,0 29.71,3.5195 39.3,10.5586 9.6,7.0312 14.41,16.582 14.41,28.6211 0,8.5508 -2.56,15.7378 -7.7,21.5588 -5.11,5.812 -14.47,11.722 -28.06,17.75 -0.74,0.32 -1.84,0.812 -3.3,1.461 -13.26,5.859 -19.91,11.609 -19.91,17.211 0,3.75 1.57,6.609 4.71,8.621 3.13,1.988 7.64,2.976 13.5,2.976 5.37,0 10.78,-0.726 16.23,-2.187 5.45,-1.473 10.97,-3.672 16.6,-6.602 l 2.44,24.051 c -9.2,2.852 -16.27,4.762 -21.25,5.738 l 0,0 z m -86.42,0.91 c -1.78,0.204 -3.42,0.313 -4.87,0.313 -8.47,0 -15.82,-2.359 -22.05,-7.082 -6.22,-4.719 -11.37,-11.801 -15.44,-21.238 l 0,25.257 -29.17,0 0,-126.6988 32.47,0 0,59.1988 c 0,13.602 2.81,23.942 8.42,31.071 5.62,7.133 13.8,10.679 24.54,10.679 2.03,0 3.99,-0.136 5.86,-0.429 1.88,-0.289 3.65,-0.707 5.37,-1.278 l 1.21,29.297 c -2.42,0.403 -4.55,0.711 -6.34,0.91 l 0,0 z m -186.28,-54.75 c 1.22,10.75 4.56,19.114 10.01,25.09 5.45,5.992 12.37,8.973 20.75,8.973 8.22,0 14.9,-2.981 20.02,-8.973 5.13,-5.976 8.14,-14.34 9.04,-25.09 l -59.82,0 0,0 z m 73.92,38.161 c -10.22,11.421 -24.52,17.14 -42.91,17.14 -18.64,0 -33.75,-5.929 -45.35,-17.82 -11.6,-11.879 -17.4,-27.43 -17.4,-46.629 0,-21.5703 5.96,-38.4297 17.89,-50.5898 11.92,-12.1797 28.46,-18.2618 49.62,-18.2618 8.13,0 15.79,0.6329 22.95,1.8907 7.16,1.2812 13.83,3.1601 20.02,5.6797 l 0,25.0195 c -5.78,-3.0781 -11.78,-5.4102 -18.01,-6.9492 -6.22,-1.5391 -12.63,-2.3203 -19.22,-2.3203 -12.05,0 -21.75,3.0703 -29.12,9.2109 -7.36,6.1601 -11.49,14.5508 -12.39,25.2113 l 89.23,0 0,10.25 c 0,20.679 -5.1,36.73 -15.31,48.168 l 0,0 z m -199.65,-112.8598 37.48,0 46.02,126.6988 -32.47,0 -31.01,-97.4097 -30.27,97.4097 -34.91,0 45.16,-126.6988 0,0 z m -99.12,151.9808 32.47,0 0,31.492 -32.47,0 0,-31.492 z m 0,-151.9808 32.47,0 0,126.6988 -32.47,0 0,-126.6988 z m -46.51,116.1598 c -7.65,9.231 -18.92,13.84 -33.81,13.84 -10.01,0 -18.82,-2.219 -26.43,-6.648 -7.61,-4.442 -13.81,-10.961 -18.61,-19.59 l 0,22.937 -29.67,0 0,-126.6988 32.47,0 0,62.9808 c 0,12.289 2.69,22 8.06,29.121 5.37,7.121 12.61,10.679 21.73,10.679 8.54,0 14.83,-2.789 18.86,-8.359 4.03,-5.582 6.04,-14.223 6.04,-25.941 l 0,-68.4808 32.84,0 0,75.4418 c 0,17.898 -3.83,31.468 -11.48,40.718 l 0,0 z M 1413.7,125.738 c 0,-24.648 5.78,-43.2966 17.34,-55.8982 11.55,-12.6289 28.68,-18.9296 51.39,-18.9296 23.11,0 40.46,6.3711 52.06,19.1015 11.6,12.75 17.4,31.7973 17.4,57.1873 l 0,100.711 -32.23,0 0,-100.469 c 0,-16.519 -3.09,-28.9918 -9.28,-37.4097 -6.18,-8.4219 -15.34,-12.6329 -27.46,-12.6329 -12.05,0 -20.9,3.9219 -26.55,11.7813 -5.66,7.8516 -8.49,20.2113 -8.49,37.0393 l 0,101.691 -34.18,0 0,-102.172"\
             style="fill:#82858c;fill-opacity:1;fill-rule:nonzero;stroke:none"\
             id="path3055" /><path\
             d="m 1414.62,1212.62 c -6.71,384.77 -321.02,695.56 -707.397,695.56 C 316.633,1908.18 0,1591.54 0,1200.96 0,810.371 316.633,493.73 707.223,493.73 l 0,0 c 108.73,0 211.722,24.532 303.767,68.372 0,0 -62.76,29.257 -85.552,52.738 -46.891,48.461 -70.348,120.711 -70.348,216.531 l 0,381.359 174.7,0 0,-381.359 c 0,-56 8.34,-96.293 24.86,-121.332 16.68,-24.848 43.28,-37.277 79.79,-37.277 37.46,0 65.78,13.359 84.83,40.117 19.05,26.742 28.65,66.262 28.65,118.492 l 0,381.359 166.7,-0.11"\
             style="fill:#82858c;fill-opacity:1;fill-rule:nonzero;stroke:none"\
             id="path3057" /></g></g>\
    \
    \
    \
    \
    \
     <g id="g3189" transform="translate(1.6484938e-6,0.17263719)">\
      <g id="layer1" transform="matrix(0.47722879,0,0,0.47722879,22,-156.2)">\
       <g id="g3195" transform="matrix(1.25,0,0,-1.25,89.296875,651.62218)">\
        <g id="g3197">\
         <g id="g3212" fill-rule="nonzero" fill="#82858c">\
    \
         </g>\
        </g>\
       </g>\
      </g>\
      <g id="farben" transform="matrix(0.84,0,0,1.2,128.2,-1)">\
       <g id="g14" class="service">\
        <g id="g16">\
         <title id="title18">Leitung, Organe und Verwaltung</title>\
         <a id="a20" xlink:href="http://www.uni-regensburg.de/verwaltung/organigramm/">\
          <rect id="ur_1" opacity="0.8" stroke-opacity="0.4" class="item" height="70" width="25" stroke="#34535d" y="0" x="250" fill="#34535d"/>\
         </a>\
        </g>\
        <g id="g23">\
         <title id="title25">Chancengleichheit und Familie</title>\
         <a id="a27" xlink:href="http://www.uni-regensburg.de/chancengleichheit/">\
          <rect id="ur_2" opacity="0.8" stroke-opacity="0.4" class="item" height="70" width="25" stroke="#5f002f" y="0" x="275" fill="#5f002f"/>\
         </a>\
        </g>\
        <g id="g30">\
         <title id="title32">Service-Einrichtungen der Verwaltung für Studierende</title>\
         <a id="a34" xlink:href="http://www.uni-regensburg.de/studium/studentenkanzlei/">\
          <rect id="ur_3" opacity="0.8" stroke-opacity="0.4" class="item" height="70" width="25" stroke="#51541a" y="0" x="300" fill="#51541a"/>\
         </a>\
        </g>\
       </g>\
       <g id="g37" class="fakultaet">\
        <g id="g39">\
         <title id="title41">Fakultät für Rechtswissenschaft</title>\
         <a id="a43" xlink:href="http://www.uni-regensburg.de/rechtswissenschaft/fakultaet/">\
          <rect id="ur_4" opacity="0.8" stroke-opacity="0.4" class="item" height="70" width="25" stroke="#a4a90c" y="0" x="325" fill="#a4a90c"/>\
         </a>\
        </g>\
        <g id="g46">\
         <title id="title48">Fakultät für Wirtschaftswissenschaften</title>\
         <a id="a50" xlink:href="http://www-wiwi.uni-regensburg.de/Home/.de">\
          <rect id="ur_5" opacity="0.8" stroke-opacity="0.4" class="item" height="70" width="25" stroke="#8b8600" y="0" x="350" fill="#8b8600"/>\
         </a>\
        </g>\
        <g id="g53">\
         <title id="title55">Fakultät für Katholische Theologie</title>\
         <a id="a57" xlink:href="http://www.uni-regensburg.de/theologie/">\
          <rect id="ur_6" opacity="0.8" stroke-opacity="0.4" class="item" height="70" width="25" stroke="#bd9600" y="0" x="375" fill="#bd9600"/>\
         </a>\
        </g>\
        <g id="g60">\
         <title id="title62">Fakultät für Philosophie, Kunst-, Geschichts- und Gesellschaftswissenschaften</title>\
         <a id="a64" xlink:href="http://www.uni-regensburg.de/philosophie-kunst-geschichte-gesellschaft/fakultaet/">\
          <rect id="ur_7" opacity="0.8" stroke-opacity="0.4" class="item" height="70" width="25" stroke="#bd4e00" y="0" x="400" fill="#bd4e00"/>\
         </a>\
        </g>\
        <g id="g67">\
         <title id="title69">Fakultät für Psychologie, Pädagogik und Sportwissenschaft</title>\
         <a id="a71" xlink:href="http://www.uni-regensburg.de/psychologie-paedagogik-sport/fakultaet/">\
          <rect id="ur_8" opacity="0.8" stroke-opacity="0.4" class="item" height="70" width="25" stroke="#990022" y="0" x="425" fill="#990022"/>\
         </a>\
        </g>\
        <g id="g74">\
         <title id="title76">Fakultät für Sprach-, Literatur- und Kulturwissenschaften</title>\
         <a id="a78" xlink:href="http://www.uni-regensburg.de/sprache-literatur-kultur/fakultaet/">\
          <rect id="ur_9" opacity="0.8" stroke-opacity="0.4" class="item" height="70" width="25" stroke="#7d003c" y="0" x="450" fill="#7d003c"/>\
         </a>\
        </g>\
        <g id="g81">\
         <title id="title83">Fakultät für Biologie und Vorklinische Medizin</title>\
         <a id="a85" xlink:href="http://www.uni-regensburg.de/biologie-vorklinische-medizin/fakultaet/">\
          <rect id="ur_10" opacity="0.8" stroke-opacity="0.4" class="item" height="70" width="25" stroke="#3f9300" y="0" x="475" fill="#3f9300"/>\
         </a>\
        </g>\
        <g id="g88">\
         <title id="title90">Fakultät für Mathematik</title>\
         <a id="a92" xlink:href="http://www.uni-regensburg.de/mathematik/fakultaet/">\
          <rect id="ur_11" opacity="0.8" stroke-opacity="0.4" class="item" height="70" width="25" stroke="#007c5f" y="0" x="500" fill="#007c5f"/>\
         </a>\
        </g>\
        <g id="g95">\
         <title id="title97">Fakultät für Physik</title>\
         <a id="a99" xlink:href="http://www.physik.uni-regensburg.de/">\
          <rect id="ur_12" opacity="0.8" stroke-opacity="0.4" class="item" height="70" width="25" stroke="#006e76" y="0" x="525" fill="#006e76"/>\
         </a>\
        </g>\
        <g id="g102">\
         <title id="title104">Fakultät für Chemie und Pharmazie</title>\
         <a id="a106" xlink:href="http://www.uni-regensburg.de/chemie-pharmazie/fakultaet/">\
          <rect id="ur_13" opacity="0.8" stroke-opacity="0.4" class="item" height="70" width="25" stroke="#006c8e" y="0" x="550" fill="#006c8e"/>\
         </a>\
        </g>\
        <g id="g109">\
         <title id="title111">Fakultät für Medizin</title>\
         <a id="a113" xlink:href="http://www.uni-regensburg.de/medizin/fakultaet/">\
          <rect id="ur_14" opacity="0.8" stroke-opacity="0.4" class="item" height="70" width="25" stroke="#004455" y="0" x="575" fill="#004455"/>\
         </a>\
        </g>\
       </g>\
       <g id="g116" class="service">\
        <g id="g118">\
         <title id="title120">Universitätsbibliothek</title>\
         <a id="a122" xlink:href="http://www.uni-regensburg.de/bibliothek/">\
          <rect id="ur_15" opacity="0.8" stroke-opacity="0.4" class="item" height="70" width="25" stroke="#83525d" y="0" x="600" fill="#83525d"/>\
         </a>\
        </g>\
       </g>\
       <g id="g125" class="uebergreifend">\
        <g id="g127">\
         <title id="title129">Zentrum für Sprache und Kommunikation</title>\
         <a id="a131" xlink:href="http://www.uni-regensburg.de/zentrum-sprache-kommunikation/leitung/">\
          <rect id="ur_16" opacity="0.8" stroke-opacity="0.4" class="item" height="70" width="25" stroke="#5b3c41" y="0" x="625" fill="#5b3c41"/>\
         </a>\
        </g>\
        <g id="g134">\
         <title id="title136">Europaeum (Ost-West-Zentrum)</title>\
         <a id="a138" xlink:href="http://www.uni-regensburg.de/europaeum/europaeum/">\
          <rect id="ur_17" opacity="0.8" stroke-opacity="0.4" class="item" height="70" width="25" stroke="#453e59" y="0" x="650" fill="#453e59"/>\
         </a>\
        </g>\
        <g id="g141">\
         <title id="title143">Zentrum für Hochschul- und Wissenschaftsdidaktik</title>\
         <a id="a145" xlink:href="http://www.uni-regensburg.de/zentrum-hochschul-wissenschaftsdidaktik/">\
          <rect id="ur_18" opacity="0.8" stroke-opacity="0.4" class="item" height="70" width="25" stroke="#3b0041" y="0" x="675" fill="#3b0041"/>\
         </a>\
        </g>\
        <g id="g148">\
         <title id="title150">Regensburger Universitätszentrum für Lehrerbildung</title>\
         <a id="a152" xlink:href="http://www.uni-regensburg.de/rul/">\
          <rect id="ur_19" opacity="0.8" stroke-opacity="0.4" class="item" height="70" width="25" stroke="#866800" y="0" x="700" fill="#866800"/>\
         </a>\
        </g>\
       </g>\
       <g id="g155" class="service">\
        <g id="g157">\
         <title id="title159">Zentrum für Weiterbildung</title>\
         <a id="a161" xlink:href="http://www.uni-regensburg.de/einrichtungen/">\
          <rect id="ur_20" opacity="0.8" stroke-opacity="0.4" class="item" height="70" width="25" stroke="#416224" y="0" x="725" fill="#416224"/>\
         </a>\
        </g>\
       </g>\
       <g id="g164" class="uebergreifend">\
        <g id="g166">\
         <title id="title168">Sportzentrum</title>\
         <a id="a170" xlink:href="http://www.uni-regensburg.de/sport/">\
          <rect id="ur_21" opacity="0.8" stroke-opacity="0.4" class="item" height="70" width="25" stroke="#006062" y="0" x="750" fill="#006062"/>\
         </a>\
        </g>\
       </g>\
       <g id="g173" class="service">\
        <g id="g175">\
         <title id="title177">Rechenzentrum</title>\
         <a id="a179" xlink:href="http://www.uni-regensburg.de/rechenzentrum/">\
          <rect id="ur_22" opacity="0.8" stroke-opacity="0.4" class="item" height="70" width="25" stroke="#032352" y="0" x="775" fill="#032352"/>\
         </a>\
        </g>\
       </g>\
      </g>\
     </g>\
    </svg></div></div></div>\
    <div class="grid w960"><div class="container row"><div id="headline" class="brand c11 s1"> </div></div></div></header>';
    document.body.insertBefore(newNode, document.body.firstChild);
    var title = titleEl.innerHTML;
    var headlineEl = document.getElementById('headline');
    if (headlineEl)
      headlineEl.innerHTML = '<h1>' + title + '</h1>';
  }

  //////////////////////////////////////////////////////////////////////
  //
  // Markdown!
  //

  // Generate Markdown
  var html = marked(markdown);
  document.getElementById('content').innerHTML = html;

  // Prettify
  var codeEls = document.getElementsByTagName('code');
  for (var i=0, ii=codeEls.length; i<ii; i++) {
    var codeEl = codeEls[i];
    var lang = codeEl.className;
    codeEl.className = 'prettyprint lang-' + lang;
  }
  prettyPrint();

  // Style tables
  var tableEls = document.getElementsByTagName('table');
  for (var i=0, ii=tableEls.length; i<ii; i++) {
    var tableEl = tableEls[i];
    tableEl.className = 'table table-striped table-bordered';
  }

  // All done - show body
  document.body.style.display = '';

})(window, document);

