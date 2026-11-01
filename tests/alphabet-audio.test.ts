import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync,readdirSync} from "node:fs";

test("all 26 pt-PT alphabet clips contain comparable, unclipped speech",()=>{
  const root=new URL("../public/audio/alphabet/pt-PT/",import.meta.url);
  const expected=Array.from("abcdefghijklmnopqrstuvwxyz",letter=>`${letter}.wav`);
  assert.deepEqual(readdirSync(root).filter(name=>name.endsWith(".wav")).sort(),expected);
  for(const file of expected){
    const wav=readFileSync(new URL(file,root));
    assert.equal(wav.toString("ascii",0,4),"RIFF");assert.equal(wav.toString("ascii",8,12),"WAVE");
    let data:Buffer|undefined,rate=0;
    for(let offset=12;offset+8<=wav.length;){
      const name=wav.toString("ascii",offset,offset+4),size=wav.readUInt32LE(offset+4),start=offset+8;
      if(name==="fmt "){
        assert.equal(wav.readUInt16LE(start),1);assert.equal(wav.readUInt16LE(start+2),1);
        rate=wav.readUInt32LE(start+4);assert.equal(wav.readUInt16LE(start+14),16);
      }
      if(name==="data")data=wav.subarray(start,start+size);
      offset=start+size+(size%2);
    }
    assert.ok(data&&rate>0,file);
    const duration=data.length/2/rate;assert.ok(duration>.1&&duration<2,file);
    let peak=0,energy=0,count=0;
    for(let i=0;i<data.length;i+=2){const value=data.readInt16LE(i);peak=Math.max(peak,Math.abs(value));if(Math.abs(value)>=328){energy+=value*value;count++;}}
    assert.ok(peak>100&&peak<30000&&count>100,file);
    const rms=20*Math.log10(Math.sqrt(energy/count)/32768);
    assert.ok(rms>-20&&rms<-18,`${file}: ${rms} dBFS`);
  }
});
