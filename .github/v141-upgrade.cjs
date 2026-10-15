'use strict';
const fs=require('node:fs'),path=require('node:path');
const ops=JSON.parse(fs.readFileSync('/tmp/gsf-v141-ops.json','utf8'));
let changed=0;
for(const [file,steps] of Object.entries(ops)){
  let content=fs.existsSync(file)?fs.readFileSync(file,'utf8'):null;
  for(const op of steps){
    if(Object.hasOwn(op,'create')){
      if(content!==null)throw new Error('Already exists: '+file);
      content=op.create;
    }else if(Object.hasOwn(op,'append')){
      if(content===null)throw new Error('Missing file: '+file);
      content+=op.append;
    }else{
      if(content===null)throw new Error('Missing: '+file);
      const count=content.split(op.old).length-1;
      if(count!==1)throw new Error('Expected one occurrence in '+file+', found '+count+': '+op.old.slice(0,115));
      content=content.replace(op.old,op.new);
    }
  }
  fs.mkdirSync(path.dirname(file),{recursive:true});
  fs.writeFileSync(file,content,'utf8');
  changed++;
  console.log('UPDATED',file,content.length);
}
console.log('Applied v1.4.1 on',changed,'files.');
